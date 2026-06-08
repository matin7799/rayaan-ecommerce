import { Injectable, Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import {
  IPaymentProvider,
  PaymentInquiryResult,
  PaymentRequestInput,
  PaymentRequestResult,
  PaymentVerifyResult,
} from '../payment-provider.interface';
import { DigipayService } from './digipay.service';
import { Payment } from '../../entities/payment.entity';
import { Order } from '../../../orders/entities/order.entity';
import { User } from '../../../users/entities/user.entity';
import { DigipayBasketItem } from './digipay.types';

@Injectable()
export class DigipayProvider implements IPaymentProvider {
  readonly providerName = 'digipay';
  private readonly logger = new Logger(DigipayProvider.name);

  constructor(
    private readonly digipayService: DigipayService,
    private readonly dataSource: DataSource,
  ) {}

  /**
   * Translates generic request inputs into DigiPay's UPG basket ticket format.
   */
  async requestPayment(
    input: PaymentRequestInput,
  ): Promise<PaymentRequestResult> {
    this.logger.log(
      `Initiating DigiPay request payment for amount=${input.amount} IRR`,
    );

    // Parse the pre-generated payment UUID from the callback URL.
    // This is the canonical providerId DigiPay will echo back in the callback.
    let resolvedProviderId: string;
    try {
      resolvedProviderId =
        new URL(input.callbackUrl).searchParams.get('paymentId') ??
        `pay_${Date.now()}`;
    } catch {
      resolvedProviderId = `pay_${Date.now()}`;
    }

    let basketDetails;
    let userPhone = '';

    try {
      // Resolve payment and order details to build basketDetailsDto
      const url = new URL(input.callbackUrl);
      const paymentId = url.searchParams.get('paymentId');

      let orderId = input.orderId;
      if (!orderId && paymentId) {
        orderId = url.searchParams.get('orderId') || undefined;
      }

      let order: Order | null = null;
      if (orderId) {
        order = await this.dataSource.getRepository(Order).findOne({
          where: { id: orderId },
        });
      } else if (paymentId) {
        const payment = await this.dataSource.getRepository(Payment).findOne({
          where: { id: paymentId },
        });

        if (payment) {
          order = await this.dataSource.getRepository(Order).findOne({
            where: { id: payment.order_id },
          });
        }
      }

      if (order) {
        // Load user to get their actual registered phone number
        const user = await this.dataSource.getRepository(User).findOne({
          where: { id: order.user_id },
        });
        if (user && user.phone) {
          userPhone = user.phone;
        }

        if (order.items && order.items.length > 0) {
          const sellerId = process.env['DIGIPAY_SELLER_ID'] ?? '1';
          const supplierId = process.env['DIGIPAY_SUPPLIER_ID'] ?? '1';

          const mappedItems: DigipayBasketItem[] = order.items.map((item) => {
            // Guess DigiPay category (Mobile, laptop, tablet, gameconsole) based on product title
            const titleLower = (item.product_title || '').toLowerCase();
            let categoryId = 'laptop'; // default fallback

            if (
              titleLower.includes('گوشی') ||
              titleLower.includes('موبایل') ||
              titleLower.includes('phone') ||
              titleLower.includes('mobile')
            ) {
              categoryId = 'Mobile';
            } else if (
              titleLower.includes('تبلت') ||
              titleLower.includes('tablet')
            ) {
              categoryId = 'tablet';
            } else if (
              titleLower.includes('کنسول') ||
              titleLower.includes('console') ||
              titleLower.includes('بازی') ||
              titleLower.includes('playstation') ||
              titleLower.includes('xbox')
            ) {
              categoryId = 'gameconsole';
            }

            return {
              sellerId,
              supplierId,
              productCode:
                item.variant_sku ||
                item.product_slug ||
                String(item.product_id),
              brand: 'RayaanTech',
              productType: 1, // 1: durable (electronics, phones, etc.)
              count: item.quantity || 1,
              categoryId,
            };
          });

          basketDetails = {
            basketId: resolvedProviderId, // must match providerId exactly
            items: mappedItems,
          };
        }
      }
    } catch (e: any) {
      this.logger.warn(
        `Could not resolve basket items context: ${e.message}. Continuing without basket details.`,
      );
    }

    // Build DigiPay ticket payload
    const ticketRequest = {
      cellNumber: input.mobile || userPhone || '09120000000',
      amount: input.amount, // IRR
      providerId: resolvedProviderId,
      callbackUrl: input.callbackUrl,
      ...(basketDetails ? { basketDetailsDto: basketDetails } : {}),
    };

    const ticketResponse =
      await this.digipayService.createPurchaseTicket(ticketRequest);

    return {
      authority: ticketResponse.ticket,
      paymentUrl: ticketResponse.redirectUrl,
      rawPayload: ticketResponse as any,
    };
  }

  /**
   * Verifies payment callback payload.
   */
  async verifyPayment(input: {
    authority: string;
    amount: number;
    status?: string;
    payload?: Record<string, any>;
  }): Promise<PaymentVerifyResult> {
    const callbackPayload = input.payload || {};
    const trackingCode = String(
      callbackPayload['trackingCode'] || callbackPayload['TrackingCode'] || '',
    );
    const providerId = String(
      callbackPayload['providerId'] || callbackPayload['ProviderId'] || '',
    );

    if (input.status === 'NOK' || !trackingCode) {
      return {
        success: false,
        refId: null,
        authority: input.authority,
        rawPayload: callbackPayload,
      };
    }

    try {
      const type =
        callbackPayload.type !== undefined
          ? callbackPayload.type
          : callbackPayload.Type;
      const typeCode = type !== undefined ? Number(type) : 11;
      const verifyResult = await this.digipayService.verifyPurchase(
        trackingCode,
        providerId,
        typeCode,
      );
      const isSuccess = verifyResult.result.status === 0;

      return {
        success: isSuccess,
        alreadyVerified:
          verifyResult.result.status === 101 ||
          verifyResult.result.status === 9010 ||
          verifyResult.result.status === 9008,
        refId: isSuccess ? trackingCode : null,
        authority: input.authority,
        cardPan: verifyResult.maskedPan || null,
        rawPayload: {
          ...callbackPayload,
          verifyResponse: verifyResult,
        },
      };
    } catch (error: any) {
      this.logger.error(`DigiPay verifyPayment failed: ${error.message}`);
      return {
        success: false,
        refId: null,
        authority: input.authority,
        rawPayload: {
          ...callbackPayload,
          verifyError: error.message,
        },
      };
    }
  }

  /**
   * Inquiry / check payment status directly.
   */
  async inquiryPayment(authority: string): Promise<PaymentInquiryResult> {
    // DigiPay inquiry uses verifyPurchase endpoint with cached details, or we query internal db status
    this.logger.log(`DigiPay inquiryPayment called for authority=${authority}`);
    return await Promise.resolve({
      success: false,
      rawPayload: {
        message: 'Inquiry is mapped directly through verification endpoint.',
      },
    });
  }
}
