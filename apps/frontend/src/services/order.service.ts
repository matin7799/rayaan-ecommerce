// ./src/services/order.service.ts
import { apiClient } from './api-client';
import { API_ENDPOINTS, buildQueryString } from '@/lib/api/endpoints';

// ========== Types ==========
export interface ShippingAddress {
  id: string;
  recipientName: string;
  phone: string;
  province: string;
  city: string;
  address: string;
  postalCode: string;
  isDefault?: boolean;
}

export interface OrderItem {
  variantId: string;
  productTitle: string;
  variantSku: string;
  price: number;
  quantity: number;
  subtotal: number;
}

export interface Order {
  id: string;
  user_id: string;
  items: OrderItem[];
  shipping_address: any; // JSON field
  total_price: number;
  shipping_cost: number;
  status: 'PENDING' | 'PAID' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  payment_ref: string | null;
  payment_method: string | null;
  shipping_method_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface OrderCancelRequest {
  id: string;
  order_id: string;
  user_id: string;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  admin_note: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateOrderPayload {
  addressId: string;
  shippingMethodId: string;
  paymentMethod: 'online' | 'cash_on_delivery';
  notes?: string;
}

export interface OrdersQueryParams extends Record<string, unknown> {
  page?: number;
  limit?: number;
  status?: string;
}

export interface AdminOrdersResponse {
  data: Order[];
  total: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error: null;
  meta: Record<string, unknown>;
}

// ========== Order Service ==========
export const orderService = {
  /**
   * Get user's orders
   */
  getMyOrders: async (
    params: OrdersQueryParams = {}
  ): Promise<Order[]> => {
    const queryString = buildQueryString(params);
    const { data } = await apiClient.get<ApiResponse<Order[]>>(
      `${API_ENDPOINTS.ORDERS.MY_ORDERS}${queryString}`
    );
    return data.data;
  },

  /**
   * Get single order by ID
   */
  getOrderById: async (id: string): Promise<Order> => {
    const { data } = await apiClient.get<ApiResponse<Order>>(
      API_ENDPOINTS.ORDERS.DETAIL(id)
    );
    return data.data;
  },

  /**
   * Create new order
   */
  createOrder: async (payload: CreateOrderPayload): Promise<Order> => {
    const { data } = await apiClient.post<ApiResponse<Order>>(
      API_ENDPOINTS.ORDERS.CREATE,
      payload
    );
    return data.data;
  },

  /**
   * Cancel order
   */
  cancelOrder: async (id: string): Promise<Order> => {
    const { data } = await apiClient.patch<ApiResponse<Order>>(
      API_ENDPOINTS.ORDERS.CANCEL(id)
    );
    return data.data;
  },

  requestCancelOrder: async (id: string, reason: string): Promise<OrderCancelRequest> => {
    const { data } = await apiClient.post<ApiResponse<OrderCancelRequest>>(
      API_ENDPOINTS.ORDERS.CANCEL_REQUEST(id),
      { reason },
    );
    return data.data;
  },

  getCancelRequest: async (id: string): Promise<OrderCancelRequest | null> => {
    const { data } = await apiClient.get<ApiResponse<OrderCancelRequest | null>>(
      API_ENDPOINTS.ORDERS.CANCEL_REQUEST(id),
    );
    return data.data;
  },

  getAdminOrders: async (params: OrdersQueryParams = {}): Promise<AdminOrdersResponse> => {
    const queryString = buildQueryString(params);
    const { data } = await apiClient.get<ApiResponse<AdminOrdersResponse>>(
      `${API_ENDPOINTS.ORDERS.ADMIN_ALL}${queryString}`,
    );
    return data.data;
  },

  updateOrderStatusByAdmin: async (
    id: string,
    status: Order['status'],
  ): Promise<Order> => {
    const { data } = await apiClient.patch<ApiResponse<Order>>(
      API_ENDPOINTS.ORDERS.ADMIN_UPDATE_STATUS(id),
      { status },
    );
    return data.data;
  },

  getAdminCancelRequests: async (): Promise<OrderCancelRequest[]> => {
    const { data } = await apiClient.get<ApiResponse<OrderCancelRequest[]>>(
      API_ENDPOINTS.ORDERS.ADMIN_CANCEL_REQUESTS,
    );
    return data.data;
  },

  reviewCancelRequestByAdmin: async (
    requestId: string,
    payload: { status: 'APPROVED' | 'REJECTED'; adminNote?: string },
  ): Promise<OrderCancelRequest> => {
    const { data } = await apiClient.patch<ApiResponse<OrderCancelRequest>>(
      API_ENDPOINTS.ORDERS.ADMIN_REVIEW_CANCEL_REQUEST(requestId),
      payload,
    );
    return data.data;
  },
};
