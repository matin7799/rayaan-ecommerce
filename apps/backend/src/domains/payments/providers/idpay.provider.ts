import { Injectable, Logger, NotImplementedException } from '@nestjs/common';
import {
  IPaymentProvider,
  PaymentInquiryResult,
  PaymentRequestInput,
  PaymentRequestResult,
  PaymentVerifyResult,
} from './payment-provider.interface';

// ──────────────────────────────────────────────────────
// پیاده‌سازی درگاه آیدی‌پی — فعلاً ساختار اولیه
// در فاز بعد (Phase 7 - Hardening) کامل پیاده‌سازی می‌شود
// الان فقط ساختار Strategy Pattern رعایت شده تا قابل توسعه باشد
// ──────────────────────────────────────────────────────

@Injectable()
export class IdpayProvider implements IPaymentProvider {
  private readonly logger = new Logger(IdpayProvider.name);

  readonly providerName = 'idpay';

  requestPayment(_input: PaymentRequestInput): Promise<PaymentRequestResult> {
    this.logger.warn('درگاه آیدی‌پی هنوز پیاده‌سازی نشده');
    throw new NotImplementedException('IDPay provider is not implemented yet');
  }

  verifyPayment(input: {
    authority: string;
    amount: number;
    status?: string;
    payload?: Record<string, unknown>;
  }): Promise<PaymentVerifyResult> {
    // placeholder — فاز ۷ تکمیل می‌شود
    return Promise.resolve({
      success: false,
      refId: null,
      authority: input.authority,
      rawPayload: input.payload ?? {},
    });
  }

  inquiryPayment(_authority: string): Promise<PaymentInquiryResult> {
    this.logger.warn('استعلام آیدی‌پی هنوز پیاده‌سازی نشده');
    return Promise.resolve({
      success: false,
      rawPayload: {},
    });
  }
}
