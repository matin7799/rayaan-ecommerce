import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Payment } from './entities/payment.entity';
import { PaymentStatus } from './enums/payment-status.enum';
import { PaymentProvider } from './enums/payment-provider.enum';
import { IPaymentProvider } from './providers/payment-provider.interface';
import { Order, OrderStatus } from '../orders/entities/order.entity';
import { PaymentsInventoryService } from './payments-inventory.service';
import { CartService } from '../cart/cart.service';

@Injectable()
export class ResilientPaymentService {
  private readonly logger = new Logger(ResilientPaymentService.name);

  constructor(
    private readonly dataSource: DataSource,
    private readonly inventoryService: PaymentsInventoryService,
    private readonly cartService: CartService,
  ) {}

  /**
   * Processes gateway callback using dual-phase verification:
   * 1. Fetches payment and performs API gateway network call OUTSIDE any database write lock.
   * 2. Deducts inventory and commits states inside a fast, isolated database write transaction.
   */
  async processCallback(
    provider: PaymentProvider,
    paymentId: string,
    payload: any,
    providerInstance: IPaymentProvider,
  ): Promise<any> {
    // Phase A: Query payment statelessly without write-lock first
    const payment = await this.dataSource.getRepository(Payment).findOne({
      where: { id: paymentId },
    });

    if (!payment) {
      throw new NotFoundException('تراکنش پرداخت یافت نشد');
    }

    if (payment.provider !== provider) {
      throw new BadRequestException('عدم تطابق درگاه پرداخت');
    }

    if (payment.status === PaymentStatus.SUCCESS) {
      return {
        success: true,
        message: 'Payment already processed',
        refId: payment.provider_ref_id ?? null,
        orderId: payment.order_id,
        authority: payment.provider_track_id ?? null,
      };
    }

    let callbackAuthority: string;
    let callbackStatus: string;

    if (provider === PaymentProvider.DIGIPAY) {
      // Security: Verify that the callback amount matches the stored IRR amount.
      // payment.amount is stored in Tomans; DigiPay sends amount in IRR (Rials).
      const callbackAmount = Number(payload.amount || payload.Amount || 0);
      const dbAmountInRials = Math.floor(Number(payment.amount) * 10);
      if (callbackAmount !== dbAmountInRials) {
        this.logger.warn(
          `DigiPay amount mismatch: callback=${callbackAmount} IRR, db=${dbAmountInRials} IRR`,
        );
        throw new BadRequestException(
          'Security violation: Callback transaction amount mismatch',
        );
      }

      // Security: Verify that the callback providerId matches our stored payment UUID.
      const callbackProviderId = String(
        payload.providerId || payload.ProviderId || '',
      );
      if (callbackProviderId !== payment.id) {
        this.logger.warn(
          `DigiPay providerId mismatch: callback=${callbackProviderId}, db=${payment.id}`,
        );
        throw new BadRequestException(
          'Security violation: Callback transaction identity mismatch',
        );
      }

      callbackAuthority = payment.provider_track_id ?? '';
      // DigiPay docs: result field is 'SUCCESS' (success) or 'FAILURE' (failed)
      const resultStr = String(payload.result || payload.Result || '')
        .trim()
        .toUpperCase();
      callbackStatus = resultStr === 'SUCCESS' ? 'OK' : 'NOK';
    } else {
      callbackAuthority =
        typeof payload.Authority === 'string' ? payload.Authority.trim() : '';
      callbackStatus =
        typeof payload.Status === 'string' ? payload.Status.trim() : '';
    }

    if (!callbackAuthority && provider !== PaymentProvider.DIGIPAY) {
      throw new BadRequestException('Authority is missing in callback');
    }

    if (!payment.provider_track_id) {
      throw new BadRequestException('Stored payment authority is missing');
    }

    if (
      provider !== PaymentProvider.DIGIPAY &&
      callbackAuthority !== payment.provider_track_id
    ) {
      throw new BadRequestException('Callback authority mismatch');
    }

    const amountInRials = Math.floor(Number(payment.amount) * 10);

    // Call external gateway verification OUTSIDE database write-lock transaction!
    const verifyResult = await providerInstance.verifyPayment({
      authority: payment.provider_track_id,
      amount: amountInRials,
      status: callbackStatus,
      payload,
    });

    let shouldReleaseReservation = false;
    let shouldClearCart = false;
    let cartUserId: string | null = null;

    if (!verifyResult.success) {
      // Short database write transaction to mark payment as failed
      await this.dataSource.getRepository(Payment).update(paymentId, {
        status: PaymentStatus.FAILED,
        callback_payload: (verifyResult.rawPayload as any) || null,
      });

      await this.inventoryService.releaseInventoryReservation(paymentId);

      return {
        success: false,
        message: 'Payment failed',
        refId: null,
        orderId: payment.order_id,
        authority: payment.provider_track_id ?? null,
      };
    }

    // Phase B: External verify succeeded! Perform database updates inside a short, atomic transaction with pessimistic locking
    const callbackResult = await this.dataSource.transaction(
      async (manager) => {
        const lockedPayment = await manager.findOne(Payment, {
          where: { id: paymentId },
          lock: { mode: 'pessimistic_write' },
        });

        if (!lockedPayment) {
          throw new NotFoundException('Payment not found during transaction');
        }

        if (lockedPayment.status === PaymentStatus.SUCCESS) {
          return {
            success: true,
            message: 'Payment already verified',
            refId: lockedPayment.provider_ref_id ?? null,
            orderId: lockedPayment.order_id,
            authority: lockedPayment.provider_track_id ?? null,
          };
        }

        // Deduct/consume inventory from the physical stock
        await this.inventoryService.consumeInventoryReservation(
          lockedPayment.id,
          manager,
        );

        // Update payment state
        lockedPayment.status = PaymentStatus.SUCCESS;
        lockedPayment.provider_ref_id = verifyResult.refId ?? null;
        lockedPayment.callback_payload = {
          ...(verifyResult.rawPayload &&
          typeof verifyResult.rawPayload === 'object'
            ? verifyResult.rawPayload
            : {}),
          authority: verifyResult.authority ?? null,
          cardPan: verifyResult.cardPan ?? null,
          fee: verifyResult.fee ?? null,
        };
        await manager.save(Payment, lockedPayment);

        // Update order state
        const orderRepo = manager.getRepository(Order);
        const order = await orderRepo.findOne({
          where: { id: lockedPayment.order_id },
        });

        if (!order) {
          throw new NotFoundException('Order not found during transaction');
        }

        if (order.status !== OrderStatus.PAID) {
          order.status = OrderStatus.PAID;
          order.payment_ref = verifyResult.refId ?? null;
          await orderRepo.save(order);
        }

        cartUserId = order.user_id;
        shouldClearCart = true;
        shouldReleaseReservation = true;

        return {
          success: true,
          message: verifyResult.alreadyVerified
            ? 'Payment already verified'
            : 'Payment successful',
          refId: verifyResult.refId ?? null,
          orderId: lockedPayment.order_id,
          authority: verifyResult.authority ?? null,
        };
      },
    );

    if (shouldReleaseReservation) {
      await this.inventoryService.releaseInventoryReservation(paymentId);
    }

    if (shouldClearCart && cartUserId) {
      const normalizedUserId = String(cartUserId);
      const cartId = `user:${normalizedUserId}`;
      try {
        await this.cartService.clearCart(cartId);
      } catch (error) {
        this.logger.warn(
          `Clear cart failed for user ${normalizedUserId}: ${error instanceof Error ? error.message : String(error)}`,
        );
      }
    }

    return callbackResult;
  }
}
