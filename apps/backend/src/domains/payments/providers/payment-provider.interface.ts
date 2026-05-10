// ──────────────────────────────────────────────────────
// اینترفیس مشترک درگاه‌های پرداخت (Strategy Pattern)
// هر درگاه جدید (zarinpal, idpay, ...) باید این اینترفیس را پیاده‌سازی کند
// مزیت: افزودن درگاه جدید بدون تغییر در service اصلی
// ──────────────────────────────────────────────────────

/**
 * نتیجه درخواست پرداخت به درگاه
 */
export interface PaymentRequestResult {
  /** شناسه رهگیری درگاه (authority / id) */
  trackId: string;

  /** لینک پرداخت برای ریدایرکت کاربر */
  paymentUrl: string;
}

/**
 * نتیجه تأیید (verify) پرداخت از درگاه
 */
export interface PaymentVerifyResult {
  /** آیا پرداخت موفق بوده؟ */
  success: boolean;

  /** شناسه مرجع نهایی (ref_id) — برای نمایش به کاربر */
  refId: string | null;

  /** کل payload بازگشتی — برای ذخیره در callback_payload */
  rawPayload: Record<string, any>;
}

/**
 * اینترفیس اصلی درگاه پرداخت
 * هر provider باید این سه متد را پیاده‌سازی کند
 */
export interface IPaymentProvider {
  /**
   * نام درگاه — برای شناسایی و لاگ
   */
  readonly providerName: string;

  /**
   * ارسال درخواست پرداخت به درگاه
   * @param amount مبلغ به ریال
   * @param callbackUrl آدرس بازگشت از درگاه
   * @param description توضیحات پرداخت
   * @returns لینک پرداخت + شناسه رهگیری
   */
  requestPayment(
    amount: number,
    callbackUrl: string,
    description: string,
  ): Promise<PaymentRequestResult>;

  /**
   * تأیید (verify) پرداخت پس از بازگشت از درگاه
   * @param trackId شناسه رهگیری (authority / id)
   * @param payload کل query/body بازگشتی از callback
   * @returns نتیجه تأیید شامل success/refId/rawPayload
   */
  verifyPayment(
    trackId: string,
    amount: number, // ← اضافه شد
    payload: Record<string, any>,
  ): Promise<PaymentVerifyResult>;
}
/**
 * توکن تزریق وابستگی برای لیست درگاه‌ها
 * در ماژول از این توکن برای inject کردن provider‌ها استفاده می‌کنیم
 */
export const PAYMENT_PROVIDERS_TOKEN = 'PAYMENT_PROVIDERS';
