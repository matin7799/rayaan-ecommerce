//apps/backend/src/domains/payments/enums/payment-status.enum.ts

// ──────────────────────────────────────────────────────
// وضعیت‌های پرداخت طبق schema مستندات (05-database-schema.md)
// pending: در انتظار پرداخت | success: پرداخت موفق | failed: پرداخت ناموفق
// ──────────────────────────────────────────────────────
export enum PaymentStatus {
  PENDING = 'pending',
  SUCCESS = 'success',
  FAILED = 'failed',
}
