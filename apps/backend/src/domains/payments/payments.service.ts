import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';
import { randomUUID } from 'crypto';

import { CartService } from '../cart/cart.service';
import { Order, OrderStatus } from '../orders/entities/order.entity';

import { InitiatePaymentResponseDto, CallbackPaymentResponseDto } from './dto';
import { Payment } from './entities/payment.entity';
import { PaymentProvider } from './enums/payment-provider.enum';
import { PaymentStatus } from './enums/payment-status.enum';
import {
  IPaymentProvider,
  PAYMENT_PROVIDERS_TOKEN,
} from './providers/payment-provider.interface';
import { PaymentsRepository } from './payments.repository';
import { ZarinpalCallbackPayload } from './providers/zarinpal/zarinpal.types';
import { PaymentsInventoryService } from './payments-inventory.service';
import { ResilientPaymentService } from './resilient-payment.service';
import { ResilientReservationHelper } from './resilient-reservation.helper';

@Injectable()
export class PaymentsService implements OnModuleInit {
  private readonly logger = new Logger(PaymentsService.name);
  private readonly defaultProvider: PaymentProvider;
  private readonly providersMap: Map<string, IPaymentProvider>;

  async onModuleInit() {
    try {
      this.logger.log(
        'Ensuring "digipay" is added to database enum "payments_provider_enum"...',
      );
      await this.dataSource.query(
        `ALTER TYPE payments_provider_enum ADD VALUE IF NOT EXISTS 'digipay'`,
      );
      this.logger.log('Database enum "payments_provider_enum" verified.');
    } catch (error: any) {
      this.logger.warn(
        `Could not alter payments_provider_enum type: ${error.message}`,
      );
    }
  }

  constructor(
    private readonly paymentsRepository: PaymentsRepository,
    private readonly configService: ConfigService,
    private readonly dataSource: DataSource,
    private readonly cartService: CartService,
    private readonly inventoryService: PaymentsInventoryService,
    private readonly resilientPaymentService: ResilientPaymentService,
    private readonly resilientReservationHelper: ResilientReservationHelper,
    @Inject(PAYMENT_PROVIDERS_TOKEN)
    private readonly paymentProviders: IPaymentProvider[],
  ) {
    this.providersMap = new Map(
      paymentProviders.map((provider) => [provider.providerName, provider]),
    );

    this.defaultProvider =
      (this.configService.get<string>(
        'DEFAULT_PAYMENT_PROVIDER',
      ) as PaymentProvider) ?? PaymentProvider.ZARINPAL;
  }

  async initiatePayment(
    orderId: string,
    userId: string,
    selectedProvider?: PaymentProvider,
  ): Promise<InitiatePaymentResponseDto> {
    const order = await this.dataSource.getRepository(Order).findOne({
      where: { id: orderId, user_id: userId },
    });

    if (!order) {
      throw new NotFoundException('سفارش یافت نشد');
    }

    if (order.status !== OrderStatus.PENDING) {
      throw new BadRequestException(
        `سفارش در وضعیت "${order.status}" قابل پرداخت نیست`,
      );
    }

    // 1. Validate local cart/order item stock first
    await this.inventoryService.validateStock(order.items ?? []);

    const existingPending =
      await this.paymentsRepository.findPendingByOrderId(orderId);

    if (existingPending) {
      existingPending.status = PaymentStatus.FAILED;
      await this.paymentsRepository.save(existingPending);
      await this.inventoryService.releaseInventoryReservation(
        existingPending.id,
      );
    }

    const activeProvider = selectedProvider ?? this.defaultProvider;
    const providerInstance = this.getProvider(activeProvider);

    // 2. Pre-generate a dynamic, secure payment ID
    const pregeneratedPaymentId = randomUUID();

    const baseUrl = this.configService.get<string>(
      'APP_BASE_URL',
      'http://localhost:3002',
    );

    const callbackUrl =
      `${baseUrl}/api/v1/payments/callback/${activeProvider}` +
      `?paymentId=${pregeneratedPaymentId}&orderId=${order.id}`;

    const amountInRials = Math.floor(Number(order.total_price) * 10);

    try {
      // 3. Request the Purchase Ticket from DigiPay (or other strategy providers)
      const requestResult = await providerInstance.requestPayment({
        amount: amountInRials,
        callbackUrl,
        description: `Payment for order ${order.id}`,
        orderId: order.id,
      });

      // 4. ONLY when successfully generated, save to DB and reserve inventory inside a strict transaction
      const savedPayment = await this.resilientReservationHelper.executeSafely(
        pregeneratedPaymentId,
        order.items ?? [],
        async (manager) => {
          const paymentRepo = manager.getRepository(Payment);

          const payment = paymentRepo.create({
            id: pregeneratedPaymentId,
            order_id: orderId,
            amount: Number(order.total_price),
            status: PaymentStatus.PENDING,
            provider: activeProvider,
            provider_track_id: requestResult.authority ?? null,
            provider_ref_id: null,
            callback_payload: {
              requestResponse: requestResult.rawPayload ?? null,
            },
          });

          return await paymentRepo.save(payment);
        },
      );

      return {
        paymentId: savedPayment.id,
        paymentUrl: requestResult.paymentUrl,
      };
    } catch (error) {
      this.logger.error(
        `Payment initiation failed for orderId=${orderId}, paymentId=${pregeneratedPaymentId}`,
        error instanceof Error ? error.stack : String(error),
      );
      throw error;
    }
  }

  async handleCallback(
    provider: PaymentProvider,
    paymentId: string,
    payload: ZarinpalCallbackPayload,
  ): Promise<CallbackPaymentResponseDto> {
    const providerInstance = this.getProvider(provider);
    return this.resilientPaymentService.processCallback(
      provider,
      paymentId,
      payload,
      providerInstance,
    );
  }

  private getProvider(provider: PaymentProvider): IPaymentProvider {
    const instance = this.providersMap.get(provider);

    if (!instance) {
      throw new BadRequestException(
        `Payment provider "${provider}" not registered`,
      );
    }

    return instance;
  }

  async getAllPaymentsForAdmin(params: {
    page: number;
    limit: number;
    status?: PaymentStatus;
  }): Promise<{ data: Payment[]; total: number }> {
    return this.paymentsRepository.findAllWithPagination(params);
  }
}
