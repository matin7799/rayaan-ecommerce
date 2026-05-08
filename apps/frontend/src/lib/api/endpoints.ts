export const API_ENDPOINTS = {
  // Auth
  AUTH: {
    REQUEST_OTP: '/auth/otp/request',
    VERIFY_OTP: '/auth/otp/verify',
    REGISTER: '/auth/register',
    LOGIN: '/auth/login',
    REFRESH: '/auth/refresh',
  },

  // Users
  USERS: {
    ME: '/users/me',
    UPDATE_PROFILE: '/users/me',
  },

  // Products
  PRODUCTS: {
    LIST: '/catalog/products',
    DETAIL: (slug: string) => `/catalog/products/${slug}`,
    CREATE: '/catalog/products',
    UPDATE: (id: string) => `/catalog/products/${id}`,
    ADMIN_UPDATE: (id: string) => `/catalog/products/admin/${id}`,
    DELETE: (id: string) => `/catalog/products/${id}`,
  },

  // Categories
  CATEGORIES: {
    LIST: '/categories',
    DETAIL: (id: string) => `/categories/${id}`,
    CREATE: '/categories',
    UPDATE: (id: string) => `/categories/${id}`,
    DELETE: (id: string) => `/categories/${id}`,
  },

  // Cart
  CART: {
    GET: '/cart',
    ADD_ITEM: '/cart/items',
    UPDATE_ITEM: (variantId: string) => `/cart/items/${variantId}`,
    REMOVE_ITEM: (variantId: string) => `/cart/items/${variantId}`,
    CLEAR: '/cart',
  },

  // Orders
  ORDERS: {
    LIST: '/orders',
    MY_ORDERS: '/orders',
    DETAIL: (id: string) => `/orders/${id}`,
    CREATE: '/orders',
    CANCEL: (id: string) => `/orders/${id}/cancel`,
    CANCEL_REQUEST: (id: string) => `/orders/${id}/cancel-request`,
    ADMIN_ALL: '/orders/admin/all',
    ADMIN_UPDATE_STATUS: (id: string) => `/orders/admin/${id}/status`,
    ADMIN_CANCEL_REQUESTS: '/orders/admin/cancel-requests/all',
    ADMIN_REVIEW_CANCEL_REQUEST: (id: string) =>
      `/orders/admin/cancel-requests/${id}/review`,
    UPDATE_STATUS: (id: string) => `/orders/admin/${id}/status`,
  },

  // Payment
  PAYMENT: {
    CREATE: '/payments',
    INITIATE: '/payments/initiate',
    VERIFY: (id: string) => `/payments/${id}/verify`,
    CALLBACK: '/payments/callback',
    ADMIN_ALL: '/payments/admin/all',
  },

  // Addresses
  ADDRESSES: {
    LIST: '/addresses',
    CREATE: '/addresses',
    UPDATE: (id: string) => `/addresses/${id}`,
    DELETE: (id: string) => `/addresses/${id}`,
    SET_DEFAULT: (id: string) => `/addresses/${id}/set-default`,
  },

  // Shipping Methods
  SHIPPING_METHODS: '/shipping-methods',

  // Campaigns
  CAMPAIGNS: {
    LIST: '/campaigns',
    ACTIVE: '/campaigns/active',
    DETAIL: (id: string) => `/campaigns/${id}`,
    CREATE: '/campaigns',
    UPDATE: (id: string) => `/campaigns/${id}`,
    DELETE: (id: string) => `/campaigns/${id}`,
  },

  // Blogs
  BLOGS: {
    LIST: '/blogs',
    PUBLISHED: '/blogs/published',
    BY_SLUG: (slug: string) => `/blogs/slug/${slug}`,
    DETAIL: (id: string) => `/blogs/${id}`,
    INCREMENT_VIEW: (id: string) => `/blogs/${id}/view`,
  },

  // Banners
  BANNERS: {
    LIST: '/banners',
    BY_POSITION: (position: string) => `/banners/position/${position}`,
    DETAIL: (id: string) => `/banners/${id}`,
  },

  // Health
  HEALTH: '/health',
} as const;

// Helper function to build query string
export function buildQueryString(params: Record<string, unknown>): string {
  const searchParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.append(key, String(value));
    }
  });
  
  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : '';
}
