// ──────────────────────────────────────────────────────
// درگاه‌های پرداخت پشتیبانی‌شده طبق schema مستندات
// فعلاً zarinpal و idpay — با Strategy Pattern قابل توسعه
// ──────────────────────────────────────────────────────
export enum PaymentProvider {
  ZARINPAL = 'zarinpal',
  IDPAY = 'idpay',
  DIGIPAY = 'digipay',
}
