// ─────────────────────────────────────────────────────────
// DigiPay UPG — Complete Type Definitions
// Source: digipay.md API documentation
// ─────────────────────────────────────────────────────────

export interface DigipayTokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  scope?: string;
  jti?: string;
}

// ─────────────────────────────────────────────────────────
// Ticket Creation Types (Section 5)
// ─────────────────────────────────────────────────────────

export interface DigipayBasketItem {
  sellerId: string;
  supplierId: string;
  productCode: string;
  brand: string;
  /** 1: durable, 2: consumable, 3: service, 4: durable-consumable */
  productType: number;
  count: number;
  /** Mobile, laptop, tablet, gameconsole */
  categoryId: string;
}

export interface DigipayBasketDetails {
  basketId: string;
  items: DigipayBasketItem[];
}

export interface DigipaySplitDetail {
  /** 'simple' or 'insurance' */
  type: 'simple' | 'insurance';
  username: string;
  amount: number;
  policies?: DigipayInsurancePolicy[];
  policyHolder?: DigipayPolicyHolder;
}

export interface DigipayInsurancePolicy {
  id?: string;
  variantId: string;
  category: string;
  brand: string;
  model: string;
  serialNo?: string | null;
  price: number;
  priceWithDiscount?: number;
}

export interface DigipayPolicyHolder {
  nationalCode?: string;
  firstName: string;
  lastName: string;
  cellNumber: string;
  digiPlusCustomer?: boolean;
  postCode?: string;
  address: string;
}

export interface DigipayTicketRequest {
  cellNumber: string;
  /** Amount in IRR (Rials) */
  amount: number;
  providerId: string;
  callbackUrl: string;
  basketDetailsDto?: DigipayBasketDetails;
  splitDetailsList?: DigipaySplitDetail[];
  additionalInfo?: {
    /** 0 = Wallet, 2 = IPG */
    preferredGateway?: number;
  };
}

export interface DigipayTicketResponse {
  result: {
    title: string;
    status: number;
    message: string;
    level: string;
  };
  ticket: string;
  redirectUrl: string;
  insurancePolicies?: Array<{
    id: string;
    policyDraftNo: string;
  }>;
}

// ─────────────────────────────────────────────────────────
// Purchase Verification Types (Section 7)
// ─────────────────────────────────────────────────────────

export interface DigipayVerifyResponse {
  result: {
    status: number;
    message: string;
    level: string;
  };
  trackingCode: string;
  providerId: string;
  terminalId?: string;
  rrn?: string;
  maskedPan?: string;
  pspCode?: string;
  pspName?: string;
  fpCode?: string;
  fpName?: string;
  amount: number;
  /** 0 = IPG, 3 = Wallet, 4 = CPG (Credit) */
  paymentGateway: number;
  additionalInfo?: {
    prepaymentAmount?: number;
    cashAmount?: number;
    creditAmount?: number;
    instantFinalization?: boolean;
    generateInvoice?: boolean;
  };
}

// ─────────────────────────────────────────────────────────
// Manual Reverse Types (Section 8 — within 25 minutes)
// Only for IPG and DPG purchases
// ─────────────────────────────────────────────────────────

export interface DigipayReverseRequest {
  /** Tracking code from callback */
  trackingCode: string;
  /** Unique ID sent during ticket creation */
  providerId: string;
}

export interface DigipayReverseResponse {
  result: {
    status: number;
    message: string;
    level: string;
  };
  trackingCode?: string;
  providerId?: string;
  rrn?: string;
  maskedPan?: string;
  amount?: number;
  /** 0 = IPG, 1 = DPG */
  paymentGateway?: number;
}

// ─────────────────────────────────────────────────────────
// Delivery Reporting Types (Section 9 — Credit/BNPL only)
// ─────────────────────────────────────────────────────────

export interface DigipayDeliverRequest {
  /** Delivery date in epoch milliseconds */
  deliveryDate: number;
  invoiceNumber: string;
  trackingCode: string;
  products: string[];
}

export interface DigipayDeliverResponse {
  result: {
    status: number;
    message: string;
    level: string;
  };
}

// ─────────────────────────────────────────────────────────
// Refund Types (Section 10 — long-term refund)
// ─────────────────────────────────────────────────────────

export interface DigipayRefundRequest {
  /** Unique refund ID — must be different from sale providerId */
  providerId: string;
  /** Amount to refund in IRR */
  amount: number;
  /** Tracking code of the original purchase */
  saleTrackingCode: string;
}

export interface DigipayRefundResponse {
  result: {
    title?: string;
    status: number;
    message: string;
    level: string;
  };
  trackingCode?: string;
}

// ─────────────────────────────────────────────────────────
// Refund Inquiry Types (Section 11)
// ─────────────────────────────────────────────────────────

export interface DigipayRefundInquiryResponse {
  result: {
    title?: string;
    status: number;
    message: string;
    level: string;
  };
  providerId?: string;
  trackingCode?: string;
  /** 0 = success, 1 = failed, 2 = unknown/retry */
  status?: number;
  resultCode?: number;
  transferDate?: string;
  /** 0 = MaskedPAN, 1 = IBAN, 2 = Wallet, 3 = Credit */
  destinationType?: number;
  destination?: string;
}
