import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { Payment } from './entities/payment.entity';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { PaymentsRepository } from './payments.repository';
import { ZarinpalProvider } from './providers/zarinpal.provider';
import { IdpayProvider } from './providers/idpay.provider';
import { PAYMENT_PROVIDERS_TOKEN } from './providers/payment-provider.interface';
import { CartModule } from '../cart/cart.module';

// ──────────────────────────────────────────────────────
// ماژول پرداخت
// Strategy Pattern: لیست درگاه‌ها با توکن PAYMENT_PROVIDERS_TOKEN
// تزریق می‌شود — برای افزودن درگاه جدید فقط کافیه
// provider جدید رو بسازی و اینجا اضافه کنی
// ──────────────────────────────────────────────────────

@Module({
  imports: [TypeOrmModule.forFeature([Payment]), ConfigModule, CartModule],
  controllers: [PaymentsController],
  providers: [
    PaymentsService,
    PaymentsRepository,
    ZarinpalProvider,
    IdpayProvider,

    // ────────────────────────────────────────────
    // تزریق لیست درگاه‌ها با Strategy Pattern
    // PaymentsService از این توکن برای ساخت providersMap استفاده می‌کند
    // ────────────────────────────────────────────
    {
      provide: PAYMENT_PROVIDERS_TOKEN,
      useFactory: (zarinpal: ZarinpalProvider, idpay: IdpayProvider) => [
        zarinpal,
        idpay,
      ],
      inject: [ZarinpalProvider, IdpayProvider],
    },
  ],
  exports: [PaymentsService],
})
export class PaymentsModule {}
