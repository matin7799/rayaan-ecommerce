# Frontend-Backend Integration Guide

This guide explains how your Next.js frontend is connected to the NestJS backend API.

## 📋 Table of Contents

1. [Configuration](#configuration)
2. [API Client Setup](#api-client-setup)
3. [Available Services](#available-services)
4. [Authentication Flow](#authentication-flow)
5. [Usage Examples](#usage-examples)
6. [Error Handling](#error-handling)

---

## Configuration

### Environment Variables

Create or update `.env.local` in the frontend root:

```env
NEXT_PUBLIC_API_URL=http://localhost:3002/api/v1
```

**Production:**
```env
NEXT_PUBLIC_API_URL=https://your-domain.com/api/v1
```

---

## API Client Setup

The API client is configured with automatic token management and error handling.

### Location: `src/services/api-client.ts`

**Features:**
- Automatic JWT token injection
- Token refresh on 401 errors
- Automatic logout on authentication failure
- Request/response interceptors

**Key Configuration:**
```typescript
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002/api/v1';
```

---

## Available Services

All services are located in `src/services/` and can be imported from the index:

```typescript
import { 
  authService, 
  userService, 
  productService, 
  cartService,
  orderService,
  paymentService,
  campaignService 
} from '@/services';
```

### 1. Authentication Service (`auth.service.ts`)

**Methods:**
- `requestOtp(payload)` - Request OTP code
- `verifyOtp(payload)` - Verify OTP code
- `register(payload, tempToken)` - Complete registration
- `login(payload)` - Login with password
- `refreshToken(payload)` - Refresh access token

### 2. User Service (`user.service.ts`)

**Methods:**
- `getProfile()` - Get current user profile
- `updateProfile(payload)` - Update user information

### 3. Product Service (`product.service.ts`)

**Methods:**
- `getProducts(params)` - Get products with filters
- `getProductBySlug(slug)` - Get single product
- `getCategories()` - Get all categories
- `getCategoryById(id)` - Get single category

### 4. Cart Service (`cart.service.ts`)

**Methods:**
- `getCart()` - Get current cart
- `addToCart(payload)` - Add item to cart
- `updateCartItem(variantId, payload)` - Update quantity
- `removeFromCart(variantId)` - Remove item
- `clearCart()` - Clear entire cart

### 5. Order Service (`order.service.ts`)

**Methods:**
- `getMyOrders(params)` - Get user's orders
- `getOrderById(id)` - Get single order
- `createOrder(payload)` - Create new order
- `cancelOrder(id)` - Cancel order

### 6. Payment Service (`payment.service.ts`)

**Methods:**
- `createPayment(payload)` - Create payment
- `verifyPayment(paymentId, payload)` - Verify payment

### 7. Campaign Service (`campaign.service.ts`)

**Methods:**
- `getCampaigns()` - Get all campaigns
- `getActiveCampaigns()` - Get active campaigns only
- `getCampaignById(id)` - Get single campaign

---

## Authentication Flow

### Option 1: OTP-Based Authentication

```typescript
import { authService } from '@/services';
import { useAuthStore } from '@/lib/store/auth-store';

// Step 1: Request OTP
const handleRequestOtp = async (phone: string) => {
  try {
    const response = await authService.requestOtp({ phone });
    console.log('OTP sent, expires in:', response.data.otpExpiry);
  } catch (error) {
    console.error('Failed to send OTP:', error);
  }
};

// Step 2: Verify OTP
const handleVerifyOtp = async (phone: string, code: string) => {
  try {
    const response = await authService.verifyOtp({ phone, code });
    
    if (response.data.needsRegistration) {
      // New user - needs to complete registration
      const tempToken = response.data.tempToken;
      // Store tempToken and show registration form
    } else {
      // Existing user - logged in
      const { accessToken, refreshToken } = response.data;
      useAuthStore.getState().setTokens(accessToken!, refreshToken!);
    }
  } catch (error) {
    console.error('OTP verification failed:', error);
  }
};

// Step 3: Complete Registration (for new users)
const handleRegister = async (
  firstName: string,
  lastName: string,
  password: string,
  tempToken: string
) => {
  try {
    const response = await authService.register(
      { firstName, lastName, password },
      tempToken
    );
    
    const { accessToken, refreshToken } = response.data;
    useAuthStore.getState().setTokens(accessToken, refreshToken);
  } catch (error) {
    console.error('Registration failed:', error);
  }
};
```

### Option 2: Password-Based Login

```typescript
import { authService } from '@/services';
import { useAuthStore } from '@/lib/store/auth-store';

const handleLogin = async (phone: string, password: string) => {
  try {
    const response = await authService.login({ phone, password });
    const { accessToken, refreshToken } = response.data;
    
    useAuthStore.getState().setTokens(accessToken, refreshToken);
    
    // Redirect to dashboard or home
    router.push('/');
  } catch (error) {
    console.error('Login failed:', error);
  }
};
```

---

## Usage Examples

### Get User Profile

```typescript
import { userService } from '@/services';
import { useAuthStore } from '@/lib/store/auth-store';

const fetchUserProfile = async () => {
  try {
    const user = await userService.getProfile();
    useAuthStore.getState().setUser(user);
  } catch (error) {
    console.error('Failed to fetch profile:', error);
  }
};
```

### Fetch Products with Filters

```typescript
import { productService } from '@/services';

const fetchProducts = async () => {
  try {
    const response = await productService.getProducts({
      page: 1,
      limit: 20,
      category: 'electronics',
      minPrice: 1000,
      maxPrice: 5000,
      search: 'laptop',
      sortBy: 'price',
      sortOrder: 'asc',
    });
    
    console.log('Products:', response.items);
    console.log('Total:', response.meta.total);
  } catch (error) {
    console.error('Failed to fetch products:', error);
  }
};
```

### Add to Cart

```typescript
import { cartService } from '@/services';

const addProductToCart = async (variantId: string, quantity: number) => {
  try {
    const cart = await cartService.addToCart({ variantId, quantity });
    console.log('Cart updated:', cart);
  } catch (error) {
    console.error('Failed to add to cart:', error);
  }
};
```

### Create Order

```typescript
import { orderService } from '@/services';

const createNewOrder = async () => {
  try {
    const order = await orderService.createOrder({
      shippingAddress: {
        fullName: 'علی احمدی',
        phone: '09123456789',
        province: 'تهران',
        city: 'تهران',
        address: 'خیابان ولیعصر، پلاک 123',
        postalCode: '1234567890',
      },
      paymentMethod: 'online',
    });
    
    console.log('Order created:', order);
  } catch (error) {
    console.error('Failed to create order:', error);
  }
};
```

### Using with React Query

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productService, cartService } from '@/services';

// Fetch products
const useProducts = (params: ProductsQueryParams) => {
  return useQuery({
    queryKey: ['products', params],
    queryFn: () => productService.getProducts(params),
  });
};

// Add to cart mutation
const useAddToCart = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (payload: AddToCartPayload) => 
      cartService.addToCart(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });
};

// Usage in component
const ProductList = () => {
  const { data, isLoading } = useProducts({ page: 1, limit: 20 });
  const addToCart = useAddToCart();
  
  const handleAddToCart = (variantId: string) => {
    addToCart.mutate({ variantId, quantity: 1 });
  };
  
  if (isLoading) return <div>Loading...</div>;
  
  return (
    <div>
      {data?.items.map(product => (
        <div key={product.id}>
          <h3>{product.title}</h3>
          <button onClick={() => handleAddToCart(product.variants[0].id)}>
            Add to Cart
          </button>
        </div>
      ))}
    </div>
  );
};
```

---

## Error Handling

### API Response Format

All API responses follow this structure:

**Success:**
```json
{
  "success": true,
  "data": { ... },
  "error": null,
  "meta": { "requestId": "uuid" }
}
```

**Error:**
```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message",
    "details": []
  },
  "meta": { "requestId": "uuid" }
}
```

### Common Error Codes

- `VALIDATION_ERROR` (400) - Invalid input
- `UNAUTHORIZED` (401) - Not authenticated
- `FORBIDDEN` (403) - No permission
- `NOT_FOUND` (404) - Resource not found
- `RATE_LIMIT_EXCEEDED` (429) - Too many requests
- `INTERNAL_ERROR` (500) - Server error

### Error Handling Example

```typescript
import { AxiosError } from 'axios';

const handleApiCall = async () => {
  try {
    const result = await productService.getProducts();
    return result;
  } catch (error) {
    if (error instanceof AxiosError) {
      const apiError = error.response?.data?.error;
      
      switch (apiError?.code) {
        case 'VALIDATION_ERROR':
          console.error('Invalid input:', apiError.message);
          break;
        case 'UNAUTHORIZED':
          console.error('Please login');
          // Redirect to login
          break;
        case 'RATE_LIMIT_EXCEEDED':
          console.error('Too many requests, please wait');
          break;
        default:
          console.error('An error occurred:', apiError?.message);
      }
    }
  }
};
```

---

## Testing the Integration

### 1. Start Backend Server

```bash
cd apps/backend
npm run start:dev
```

Backend will run on: `http://localhost:3002`

### 2. Start Frontend Server

```bash
cd apps/frontend
npm run dev
```

Frontend will run on: `http://localhost:3001`

### 3. Test API Connection

```typescript
// Test in browser console or a test component
import { productService } from '@/services';

const testConnection = async () => {
  try {
    const products = await productService.getProducts({ limit: 5 });
    console.log('✅ Backend connected successfully!', products);
  } catch (error) {
    console.error('❌ Backend connection failed:', error);
  }
};

testConnection();
```

---

## Next Steps

1. **Update your components** to use the new services
2. **Implement authentication UI** using the auth service
3. **Add React Query hooks** for better data management
4. **Handle loading and error states** in your UI
5. **Test all API endpoints** with your frontend

---

## Support

For backend API documentation, see:
- `apps/backend/API-DOCUMENTATION.md`
- `apps/backend/API-USAGE-GUIDE.md`

For issues or questions, check the backend health endpoint:
```
GET http://localhost:3002/api/v1/health
```
