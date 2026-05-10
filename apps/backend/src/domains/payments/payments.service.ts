import {
  Injectable,
  Inject,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';
import { PaymentsRepository } from './payments.repository';
import { Payment } from './entities/payment.entity';
import { PaymentStatus } from './enums/payment-status.enum';
import { PaymentProvider } from './enums/payment-provider.enum';
import { CartService } from '../cart/cart.service';
import {
  IPaymentProvider,
  PAYMENT_PROVIDERS_TOKEN,
} from './providers/payment-provider.interface';
import { InitiatePaymentResponseDto, CallbackPaymentResponseDto } from './dto';
import { Order, OrderStatus } from '../orders/entities/order.entity';

// ──────────────────────────────────────────────────────
// سرویس اصلی پرداخت — منطق تجاری مرکزی
// مسئولیت‌ها:
//   1. شروع پرداخت (initiate)
//   2. مدیریت callback از درگاه
//   3. رعایت Idempotency و Transactional بودن
// ──────────────────────────────────────────────────────

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  /** درگاه پیش‌فرض — توسط سیستم انتخاب می‌شود */
  private readonly defaultProvider: PaymentProvider;

  /** مپ درگاه‌ها برای دسترسی سریع بر اساس نام */
  private readonly providersMap: Map<string, IPaymentProvider>;

  constructor(
    private readonly paymentsRepository: PaymentsRepository,
    private readonly configService: ConfigService,
    private readonly dataSource: DataSource,
    private readonly cartService: CartService,
    @Inject(PAYMENT_PROVIDERS_TOKEN)
    private readonly paymentProviders: IPaymentProvider[],
  ) {
    // ────────────────────────────────────────────
    // ساخت مپ درگاه‌ها از لیست inject شده
    // ────────────────────────────────────────────
    this.providersMap = new Map(
      paymentProviders.map((p) => [p.providerName, p]),
    );

    // درگاه پیش‌فرض از env — اگه نبود zarinpal
    this.defaultProvider =
      (this.configService.get<string>(
        'DEFAULT_PAYMENT_PROVIDER',
      ) as PaymentProvider) || PaymentProvider.ZARINPAL;

    this.logger.log(`درگاه پیش‌فرض: ${this.defaultProvider}`);
  }

  // ──────────────────────────────────────────────────────
  // Use-Case 1: شروع پرداخت
  // 1. بررسی وجود سفارش و وضعیت آن
  // 2. بررسی پرداخت pending قبلی (جلوگیری از تکرار)
  // 3. ساخت رکورد payment + ارسال درخواست به درگاه
  // 4. بروزرسانی provider_track_id
  // ──────────────────────────────────────────────────────
  async initiatePayment(
    orderId: string,
    userId: string,
  ): Promise<InitiatePaymentResponseDto> {
    this.logger.log(`شروع پرداخت: orderId=${orderId}, userId=${userId}`);

    // ---- بررسی وجود سفارش و مالکیت آن ----
    const order = await this.dataSource.getRepository(Order).findOne({
      where: { id: orderId, user_id: userId },
    });

    if (!order) {
      throw new NotFoundException('سفارش یافت نشد');
    }

    // ---- فقط سفارش PENDING قابل پرداخت است ----
    if (order.status !== OrderStatus.PENDING) {
      throw new BadRequestException(
        `سفارش در وضعیت "${order.status}" قابل پرداخت نیست`,
      );
    }

    // ---- بررسی پرداخت pending قبلی ----
    const existingPending =
      await this.paymentsRepository.findPendingByOrderId(orderId);

    if (existingPending) {
      this.logger.warn(
        `پرداخت pending قبلی وجود دارد: paymentId=${existingPending.id}`,
      );
      // پرداخت قبلی رو failed می‌کنیم و یکی جدید می‌سازیم
      existingPending.status = PaymentStatus.FAILED;
      await this.paymentsRepository.save(existingPending);
    }

    // ---- انتخاب درگاه ----
    const providerInstance = this.getProvider(this.defaultProvider);

    // ---- ساخت رکورد پرداخت ----
    const payment = this.paymentsRepository.create({
      order_id: orderId,
      amount: order.total_price,
      status: PaymentStatus.PENDING,
      provider: this.defaultProvider,
    });
    const savedPayment = await this.paymentsRepository.save(payment);

    // ---- ساخت callback URL ----
    const baseUrl = this.configService.get<string>(
      'APP_BASE_URL',
      'http://localhost:3002',
    );
    const callbackUrl = `${baseUrl}/api/v1/payments/callback/${this.defaultProvider}?paymentId=${savedPayment.id}`;

    // تبدیل تومان به ریال (ضرب در 10)
    const amountInRials = Number(order.total_price) * 10;

    const requestResult = await providerInstance.requestPayment(
      amountInRials,
      callbackUrl,
      `Payment for order ${order.id}`,
    );

    // ذخیره authority / trackId
    savedPayment.provider_track_id = requestResult.trackId;
    await this.paymentsRepository.save(savedPayment);

    return {
      paymentId: savedPayment.id,
      paymentUrl: requestResult.paymentUrl,
    };
  }

  // ──────────────────────────────────────────────────────
  // Use-Case 2: مدیریت Callback از درگاه
  // قوانین مهم:
  //  - Idempotent باشد (callback تکراری مشکل ایجاد نکند)
  //  - payload کامل ذخیره شود
  //  - در صورت موفق بودن، Order → PAID شود
  // ──────────────────────────────────────────────────────
  async handleCallback(
    provider: PaymentProvider,
    paymentId: string,
    payload: Record<string, any>,
  ): Promise<CallbackPaymentResponseDto> {
    this.logger.log(
      `callback received provider=${provider} paymentId=${paymentId}`,
    );

    const payment = await this.paymentsRepository.findById(paymentId);

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    // جلوگیری از اجرای دوباره (Idempotency)
    if (payment.status === PaymentStatus.SUCCESS) {
      this.logger.warn(`duplicate callback ignored paymentId=${paymentId}`);

      return {
        success: true,
        message: 'Payment already processed',
        refId: payment.provider_track_id,
        orderId: payment.order_id,
      };
    }

    const providerInstance = this.getProvider(provider);

    // تبدیل تومان به ریال برای تایید پرداخت
    const amountInRials = Number(payment.amount) * 10;

    const verifyResult = await providerInstance.verifyPayment(
      payment.provider_track_id!,
      amountInRials, // ← مبلغ به ریال
      payload,
    );

    // ذخیره payload کامل
    payment.callback_payload = verifyResult.rawPayload;

    if (!verifyResult.success) {
      payment.status = PaymentStatus.FAILED;
      await this.paymentsRepository.save(payment);

      return {
        success: false,
        message: 'Payment failed',
        refId: null,
        orderId: payment.order_id,
      };
    }

    // ────────────────────────────────────────────
    // تراکنش برای بروزرسانی Payment و Order
    // ────────────────────────────────────────────
    await this.dataSource.transaction(async (manager) => {
      payment.status = PaymentStatus.SUCCESS;
      payment.provider_track_id = verifyResult.refId;

      await manager.save(Payment, payment);

      const orderRepo = manager.getRepository(Order);

      const order = await orderRepo.findOne({
        where: { id: payment.order_id },
      });

      if (!order) {
        throw new NotFoundException('Order not found');
      }

      order.status = OrderStatus.PAID;
      order.payment_ref = verifyResult.refId;

      await orderRepo.save(order);

      // Clear cart after successful payment
      const cartId = `user:${order.user_id}`;
      await this.cartService.clearCart(cartId);
      this.logger.log(`سبد خرید کاربر ${order.user_id} پاک شد`);
    });

    return {
      success: true,
      message: 'Payment successful',
      refId: verifyResult.refId,
      orderId: payment.order_id,
    };
  }

  // ──────────────────────────────────────────────────────
  // گرفتن provider از map
  // ──────────────────────────────────────────────────────
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
