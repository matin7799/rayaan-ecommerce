import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import {
  IPaymentProvider,
  PaymentRequestResult,
  PaymentVerifyResult,
} from './payment-provider.interface';

// ──────────────────────────────────────────────────────
// پیاده‌سازی درگاه زرین‌پال
// از Sandbox برای توسعه و Production API برای محیط اصلی
// مستندات: https://docs.zarinpal.com
// ──────────────────────────────────────────────────────

@Injectable()
export class ZarinpalProvider implements IPaymentProvider {
  private readonly logger = new Logger(ZarinpalProvider.name);

  /** آدرس API زرین‌پال — بر اساس حالت sandbox/production */
  private readonly baseUrl: string;

  /** آدرس پرداخت (ریدایرکت کاربر) */
  private readonly gatewayUrl: string;

  /** مرچنت کد زرین‌پال */
  private readonly merchantId: string;

  readonly providerName = 'zarinpal';

  constructor(private readonly configService: ConfigService) {
    // ────────────────────────────────────────────
    // خواندن تنظیمات از environment variables
    // ZARINPAL_SANDBOX=true → حالت تست
    // ────────────────────────────────────────────
    const isSandbox =
      this.configService.get<string>('ZARINPAL_SANDBOX', 'true') === 'true';

    this.merchantId = this.configService
      .get<string>('ZARINPAL_MERCHANT_ID', '')
      .trim();

    if (isSandbox) {
      this.baseUrl = 'https://sandbox.zarinpal.com/pg/v4/payment';
      this.gatewayUrl = 'https://sandbox.zarinpal.com/pg/StartPay';
    } else {
      this.baseUrl = 'https://payment.zarinpal.com/pg/v4/payment';
      this.gatewayUrl = 'https://payment.zarinpal.com/pg/StartPay';
    }

    this.logger.log(
      `زرین‌پال در حالت ${isSandbox ? 'Sandbox' : 'Production'} راه‌اندازی شد`,
    );

    if (!this.merchantId || this.merchantId.length < 36) {
      this.logger.error(
        'ZARINPAL_MERCHANT_ID نامعتبر است. مقدار فعلی خالی است یا کمتر از ۳۶ کاراکتر دارد.',
      );
    }
  }

  // ────────────────────────────────────────────
  // ارسال درخواست پرداخت به زرین‌پال
  // خروجی: authority (شناسه رهگیری) + لینک پرداخت
  // ────────────────────────────────────────────
  async requestPayment(
    amount: number,
    callbackUrl: string,
    description: string,
  ): Promise<PaymentRequestResult> {
    this.logger.log(`درخواست پرداخت: مبلغ=${amount} ریال`);

    try {
      if (!this.merchantId || this.merchantId.length < 36) {
        throw new Error(
          'ZARINPAL_MERCHANT_ID is invalid. Set a valid 36-character merchant id in backend environment variables.',
        );
      }

      const response = await axios.post(`${this.baseUrl}/request.json`, {
        merchant_id: this.merchantId,
        amount: Math.floor(Number(amount)), // ✅ تبدیل به integer
        callback_url: callbackUrl,
        description,
      });

      const { data } = response.data;

      // بررسی کد موفقیت زرین‌پال (100 = موفق)
      if (data.code !== 100) {
        this.logger.error(`خطا از زرین‌پال: code=${data.code}`);
        throw new Error(`Zarinpal request failed with code: ${data.code}`);
      }

      const authority: string = data.authority;

      return {
        trackId: authority,
        paymentUrl: `${this.gatewayUrl}/${authority}`,
      };
    } catch (error) {
      this.logger.error('خطا در ارسال درخواست به زرین‌پال', error);
      throw error;
    }
  }

  // ────────────────────────────────────────────
  // تأیید پرداخت پس از بازگشت کاربر از زرین‌پال
  // authority از query string callback گرفته می‌شود
  // ────────────────────────────────────────────
  async verifyPayment(
    trackId: string,
    amount: number, // ← مبلغ امن از DB
    payload: Record<string, any>,
  ): Promise<PaymentVerifyResult> {
    this.logger.log(`تأیید پرداخت: authority=${trackId}`);

    try {
      if (payload.Status === 'NOK') {
        this.logger.warn(`پرداخت ناموفق: authority=${trackId}, Status=NOK`);
        return {
          success: false,
          refId: null,
          rawPayload: payload,
        };
      }

      const response = await axios.post(`${this.baseUrl}/verify.json`, {
        merchant_id: this.merchantId,
        authority: trackId,
        amount: Math.floor(Number(amount)), // تبدیل به integer
      });

      const { data } = response.data;

      // کد 100 = موفق | کد 101 = قبلاً تأیید شده
      const isSuccess = data.code === 100 || data.code === 101;

      return {
        success: isSuccess,
        refId: isSuccess ? String(data.ref_id) : null,
        rawPayload: { ...payload, verifyResponse: data },
      };
    } catch (error) {
      this.logger.error('خطا در تأیید پرداخت زرین‌پال', error);
      return {
        success: false,
        refId: null,
        rawPayload: { ...payload, verifyError: String(error) },
      };
    }
  }
}
