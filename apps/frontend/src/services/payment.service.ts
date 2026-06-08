import { apiClient } from './api-client';
import { API_ENDPOINTS } from '@/lib/api/endpoints';

// ========== Types ==========
export interface InitiatePaymentPayload {
  orderId: string;
  provider?: string;
}

export interface InitiatePaymentResponse {
  paymentId: string;
  paymentUrl: string;
}

export interface PaymentListItem {
  id: string;
  order_id: string;
  amount: number | string;
  status: 'pending' | 'success' | 'failed';
  provider: string;
  provider_track_id?: string | null;
  created_at: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error: null;
  meta: Record<string, unknown>;
}

// ========== Payment Service ==========
export const paymentService = {
  /**
   * Create payment and get gateway URL
   */
  initiatePayment: async (
    payload: InitiatePaymentPayload,
  ): Promise<InitiatePaymentResponse> => {
    const { data } = await apiClient.post<ApiResponse<InitiatePaymentResponse>>(
      API_ENDPOINTS.PAYMENT.INITIATE,
      payload
    );
    return data.data;
  },

  getAdminPayments: async (params: { page?: number; limit?: number; status?: string } = {}) => {
    const query = new URLSearchParams();
    if (params.page) query.set('page', String(params.page));
    if (params.limit) query.set('limit', String(params.limit));
    if (params.status) query.set('status', params.status);
    const queryString = query.toString();
    const endpoint = queryString
      ? `${API_ENDPOINTS.PAYMENT.ADMIN_ALL}?${queryString}`
      : API_ENDPOINTS.PAYMENT.ADMIN_ALL;

    const { data } = await apiClient.get<
      ApiResponse<{ data: PaymentListItem[]; total: number }>
    >(endpoint);
    return data.data;
  },
};
