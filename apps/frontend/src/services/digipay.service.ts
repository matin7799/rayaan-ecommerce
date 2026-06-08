import { apiClient } from './api-client';
import { API_ENDPOINTS } from '@/lib/api/endpoints';

// ─────────────────────────────────────────────────────────
// DigiPay Types
// ─────────────────────────────────────────────────────────

export interface DigipayInstallmentPlan {
  id: 'bnpl' | 'credit_12' | 'credit_18';
  name: string;
  installments: number;
  interestRate: number;
  downpaymentRate: number;
  description: string;
}

export interface DigipayPlansResponse {
  success: boolean;
  plans: DigipayInstallmentPlan[];
  config: {
    minAmountTomans: number;
    maxAmountTomans: number;
  };
}

export interface DigipayDeliverPayload {
  orderId: string;
  invoiceNumber: string;
  /** Optional payment type: 5=Credit (default), 13=BNPL */
  type?: number;
}

export interface DigipayReversePayload {
  orderId: string;
  /** Optional payment type: 0=IPG (default), 11=Wallet */
  type?: number;
}

export interface DigipayRefundPayload {
  orderId: string;
  /** Amount in Tomans to refund */
  amountTomans: number;
  /** Optional payment type: 0=IPG (default), 5=Credit, 11=Wallet, 13=BNPL */
  type?: number;
}

export interface DigipayOperationResult {
  success: boolean;
  message: string;
  refundTrackingCode?: string;
  data?: Record<string, unknown>;
}

// ─────────────────────────────────────────────────────────
// DigiPay Service
// ─────────────────────────────────────────────────────────

export const digipayService = {
  /**
   * Fetches available DigiPay installment and BNPL plans.
   * Public endpoint — no authentication required.
   */
  getInstallmentPlans: async (): Promise<DigipayPlansResponse> => {
    const { data } = await apiClient.get<DigipayPlansResponse>(
      API_ENDPOINTS.DIGIPAY.PLANS,
    );
    return data;
  },

  /**
   * Reports product delivery to DigiPay for Credit/BNPL orders.
   * Admin-only operation required after physical delivery.
   */
  deliverOrder: async (
    payload: DigipayDeliverPayload,
  ): Promise<DigipayOperationResult> => {
    const { type = 5, ...body } = payload;
    const { data } = await apiClient.post<DigipayOperationResult>(
      `${API_ENDPOINTS.DIGIPAY.DELIVER}?type=${type}`,
      body,
    );
    return data;
  },

  /**
   * Reverses a DigiPay IPG/DPG purchase within 25 minutes of verification.
   * Admin-only operation.
   */
  reverseOrder: async (
    payload: DigipayReversePayload,
  ): Promise<DigipayOperationResult> => {
    const { type = 0, ...body } = payload;
    const { data } = await apiClient.post<DigipayOperationResult>(
      `${API_ENDPOINTS.DIGIPAY.REVERSE}?type=${type}`,
      body,
    );
    return data;
  },

  /**
   * Issues a long-term refund for a DigiPay order.
   * Admin-only operation.
   */
  refundOrder: async (
    payload: DigipayRefundPayload,
  ): Promise<DigipayOperationResult> => {
    const { type = 0, ...body } = payload;
    const { data } = await apiClient.post<DigipayOperationResult>(
      `${API_ENDPOINTS.DIGIPAY.REFUND}?type=${type}`,
      body,
    );
    return data;
  },

  /**
   * Checks the status of a previously submitted DigiPay refund.
   * Admin-only operation.
   */
  getRefundInquiry: async (
    inquiryId: string,
    type = 0,
  ): Promise<{ success: boolean; data: Record<string, unknown> }> => {
    const { data } = await apiClient.get<{
      success: boolean;
      data: Record<string, unknown>;
    }>(`${API_ENDPOINTS.DIGIPAY.REFUND_INQUIRY(inquiryId)}?type=${type}`);
    return data;
  },
};
