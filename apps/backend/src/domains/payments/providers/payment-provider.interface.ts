export interface PaymentRequestInput {
  amount: number; // amount in IRR
  callbackUrl: string;
  description: string;
  mobile?: string;
  email?: string;
  cardPan?: string | string[];
  referrerId?: string;
  currency?: 'IRR' | 'IRT';
  orderId?: string;
  wages?: Array<{
    iban: string;
    amount: number;
    description?: string;
  }>;
}

export interface PaymentRequestResult {
  authority: string;
  paymentUrl: string;
  rawPayload?: Record<string, unknown>;
}

export interface PaymentVerifyResult {
  success: boolean;
  refId: string | null;
  authority: string;
  cardPan?: string | null;
  fee?: number | null;
  alreadyVerified?: boolean;
  rawPayload: Record<string, unknown>;
}

export interface PaymentInquiryResult {
  success: boolean;
  status?: string;
  code?: number;
  rawPayload: Record<string, unknown>;
}

export interface IPaymentProvider {
  readonly providerName: string;

  requestPayment(input: PaymentRequestInput): Promise<PaymentRequestResult>;

  verifyPayment(input: {
    authority: string;
    amount: number; // IRR
    status?: string;
    payload?: Record<string, unknown>;
  }): Promise<PaymentVerifyResult>;

  inquiryPayment(authority: string): Promise<PaymentInquiryResult>;
}

export const PAYMENT_PROVIDERS_TOKEN = 'PAYMENT_PROVIDERS_TOKEN';
