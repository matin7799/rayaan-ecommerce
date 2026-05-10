import { Injectable, Logger, NotImplementedException } from '@nestjs/common';
import {
  IPaymentProvider,
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

  requestPayment(
    _amount: number,
    _callbackUrl: string,
    _description: string,
  ): Promise<PaymentRequestResult> {
    this.logger.warn('درگاه آیدی‌پی هنوز پیاده‌سازی نشده');
    throw new NotImplementedException('IDPay provider is not implemented yet');
  }

  verifyPayment(
    _trackId: string,
    _amount: number,
    payload: Record<string, any>,
  ): Promise<PaymentVerifyResult> {
    // placeholder — فاز ۷ تکمیل می‌شود
    return Promise.resolve({
      success: false,
      refId: null,
      rawPayload: payload,
    });
  }
}
