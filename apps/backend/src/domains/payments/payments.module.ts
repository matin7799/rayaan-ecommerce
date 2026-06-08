import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { Payment } from './entities/payment.entity';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { PaymentsRepository } from './payments.repository';
import { ZarinpalProvider } from './providers/zarinpal/zarinpal.provider';
import { IdpayProvider } from './providers/idpay.provider';
import { DigipayProvider } from './providers/digipay/digipay.provider';
import { DigipayModule } from './providers/digipay/digipay.module';
import { PAYMENT_PROVIDERS_TOKEN } from './providers/payment-provider.interface';
import { CartModule } from '../cart/cart.module';

import { PaymentsInventoryService } from './payments-inventory.service';
import { ResilientPaymentService } from './resilient-payment.service';
import { ResilientReservationHelper } from './resilient-reservation.helper';

// ──────────────────────────────────────────────────────
// ماژول پرداخت
// Strategy Pattern: همه providerها با یک token مشترک inject می‌شوند
// ──────────────────────────────────────────────────────
@Module({
  imports: [
    TypeOrmModule.forFeature([Payment]),
    ConfigModule,
    CartModule,
    DigipayModule,
  ],
  controllers: [PaymentsController],
  providers: [
    PaymentsService,
    PaymentsRepository,
    PaymentsInventoryService,
    ResilientPaymentService,
    ResilientReservationHelper,
    ZarinpalProvider,
    IdpayProvider,
    {
      provide: PAYMENT_PROVIDERS_TOKEN,
      useFactory: (
        zarinpal: ZarinpalProvider,
        idpay: IdpayProvider,
        digipay: DigipayProvider,
      ) => [zarinpal, idpay, digipay],
      inject: [ZarinpalProvider, IdpayProvider, DigipayProvider],
    },
  ],
  exports: [
    PaymentsService,
    PaymentsInventoryService,
    ResilientPaymentService,
    ResilientReservationHelper,
  ],
})
export class PaymentsModule {}
