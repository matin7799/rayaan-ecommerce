# Error Codes Reference

## Authentication Errors

| Code | Message (Persian) | Description |
|------|------------------|-------------|
| `UNAUTHORIZED` | لطفا وارد حساب کاربری خود شوید | User not authenticated |
| `INVALID_CREDENTIALS` | شماره موبایل یا رمز عبور اشتباه است | Wrong phone or password |
| `OTP_INVALID` | کد تایید نامعتبر یا منقضی شده است | Invalid or expired OTP |
| `OTP_NOT_FOUND` | کد تایید یافت نشد. لطفا مجددا درخواست دهید | OTP not found in Redis |
| `OTP_MAX_ATTEMPTS` | تعداد تلاش‌های شما به حد مجاز رسیده است | Too many OTP attempts |
| `RATE_LIMIT_EXCEEDED` | تعداد درخواست‌های شما بیش از حد مجاز است | Rate limit exceeded |

## Validation Errors

| Code | Message (Persian) | Description |
|------|------------------|-------------|
| `VALIDATION_ERROR` | اطلاعات وارد شده نامعتبر است | Input validation failed |

## Resource Errors

| Code | Message (Persian) | Description |
|------|------------------|-------------|
| `NOT_FOUND` | موردی یافت نشد | Resource not found |
| `ALREADY_EXISTS` | این مورد قبلا ثبت شده است | Resource already exists |

## Cart Errors

| Code | Message (Persian) | Description |
|------|------------------|-------------|
| `INSUFFICIENT_STOCK` | موجودی کافی نیست | Not enough stock |
| `CART_EMPTY` | سبد خرید شما خالی است | Cart is empty |

## Order Errors

| Code | Message (Persian) | Description |
|------|------------------|-------------|
| `ORDER_NOT_FOUND` | سفارش یافت نشد | Order not found |

## Payment Errors

| Code | Message (Persian) | Description |
|------|------------------|-------------|
| `PAYMENT_FAILED` | پرداخت ناموفق بود | Payment failed |
| `PAYMENT_CANCELLED` | پرداخت لغو شد | Payment cancelled |

## Server Errors

| Code | Message (Persian) | Description |
|------|------------------|-------------|
| `INTERNAL_ERROR` | خطای سرور. لطفا بعدا تلاش کنید | Internal server error |
| `SERVICE_UNAVAILABLE` | سرویس در دسترس نیست | Service unavailable |

## HTTP Status Codes

| Status | Default Code | Message |
|--------|-------------|---------|
| 400 | `BAD_REQUEST` | Bad request |
| 401 | `UNAUTHORIZED` | Unauthorized |
| 403 | `FORBIDDEN` | Forbidden |
| 404 | `NOT_FOUND` | Not found |
| 409 | `CONFLICT` | Conflict |
| 422 | `VALIDATION_ERROR` | Validation error |
| 429 | `RATE_LIMIT_EXCEEDED` | Rate limit exceeded |
| 500 | `INTERNAL_ERROR` | Internal server error |
| 503 | `SERVICE_UNAVAILABLE` | Service unavailable |

## Usage in Frontend

```typescript
import { handleApiError, getErrorMessage } from '@/lib/api/error-handler';

// Automatic handling with toast
try {
  await authService.login({ phone, password });
} catch (error) {
  handleApiError(error); // Shows toast + logs
}

// Get error message only
try {
  await authService.login({ phone, password });
} catch (error) {
  const message = getErrorMessage(error);
  console.log(message);
}

// Custom message
try {
  await authService.login({ phone, password });
} catch (error) {
  handleApiError(error, 'خطا در ورود به سیستم');
}
```

## Adding New Error Codes

### 1. Backend (NestJS)
```typescript
throw new BadRequestException({
  error: 'CUSTOM_ERROR_CODE',
  message: 'Custom error message',
});
```

### 2. Frontend (error-handler.ts)
```typescript
const ERROR_MESSAGES: Record<string, string> = {
  // ... existing codes
  CUSTOM_ERROR_CODE: 'پیام خطای سفارشی',
};
```

## Development Mode

In development, errors are logged with full details:
- Request/response data
- Stack traces
- Request ID
- Headers

## Production Mode

In production, only safe messages are shown:
- User-friendly Persian messages
- No sensitive data
- Request ID for tracking
