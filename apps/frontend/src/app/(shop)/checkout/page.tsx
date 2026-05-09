'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation } from '@tanstack/react-query';
import { AddressSection } from '@/components/checkout/address-section';
import { ShippingMethod } from '@/components/checkout/shipping-method';
import { PaymentMethod } from '@/components/checkout/payment-method';
import { CheckoutSummary } from '@/components/checkout/checkout-summary';

import { useAuthStore } from '@/lib/store/auth-store';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { addressService } from '@/services/address.service';
import { cartService } from '@/services/cart.service';
import { orderService } from '@/services/order.service';
import { shippingService } from '@/services/shipping.service';
import { paymentService } from '@/services/payment.service';

export default function CheckoutPage() {
  const router = useRouter();
  const accessToken = useAuthStore((state) => state.accessToken);
  const sessionChecked = useAuthStore((state) => state.sessionChecked);
  const [selectedAddressId, setSelectedAddressId] = useState<string>('');
  const [selectedShippingMethodId, setSelectedShippingMethodId] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<'online' | 'cash_on_delivery'>('online');

  // Redirect to login if not authenticated (only after hydration)
  useEffect(() => {
    if (typeof window !== 'undefined' && sessionChecked && !accessToken) {
      toast.error('برای ثبت سفارش ابتدا وارد شوید');
      router.push('/login?redirect=/checkout');
    }
  }, [accessToken, router, sessionChecked]);

  // Fetch addresses
  const { data: addresses, isLoading: isLoadingAddresses } = useQuery({
    queryKey: ['addresses'],
    queryFn: () => addressService.getAddresses(),
    enabled: !!accessToken,
  });

  // Fetch shipping methods
  const { data: shippingMethods, isLoading: isLoadingShipping } = useQuery({
    queryKey: ['shipping-methods'],
    queryFn: () => shippingService.getShippingMethods(),
  });

  // Fetch cart
  const { data: cart, isLoading: isLoadingCart } = useQuery({
    queryKey: ['cart'],
    queryFn: () => cartService.getCart(),
    enabled: !!accessToken,
  });

  // Create order mutation
  const createOrderMutation = useMutation({
    mutationFn: () => orderService.createOrder({
      addressId: effectiveAddressId,
      shippingMethodId: effectiveShippingMethodId,
      paymentMethod,
    }),
    onSuccess: (order) => {
      if (paymentMethod === 'cash_on_delivery') {
        toast.success('سفارش با موفقیت ثبت شد');
        router.push(`/dashboard/orders/${order.id}?success=true`);
      } else {
        // Online payment - initiate payment
        initiatePaymentMutation.mutate(order.id);
      }
    },
    onError: (error: unknown) => {
      const errorMessage = 
        (error && typeof error === 'object' && 'response' in error && 
         error.response && typeof error.response === 'object' && 'data' in error.response &&
         error.response.data && typeof error.response.data === 'object' && 'error' in error.response.data &&
         error.response.data.error && typeof error.response.data.error === 'object' && 'message' in error.response.data.error)
        ? String(error.response.data.error.message) : 'خطا در ثبت سفارش';
      toast.error(errorMessage);
    },
  });

  // Initiate payment mutation
  const initiatePaymentMutation = useMutation({
    mutationFn: async (orderId: string) => paymentService.initiatePayment({ orderId }),
    onSuccess: (data) => {
      // Redirect to payment gateway
      window.location.href = data.paymentUrl;
    },
    onError: () => {
      toast.error('خطا در ایجاد درخواست پرداخت');
    },
  });

  const handleSubmitOrder = () => {
    // Validate address
    if (!effectiveAddressId) {
      toast.error('لطفا آدرس خود را انتخاب کنید');
      return;
    }

    if (!effectiveShippingMethodId) {
      toast.error('لطفا روش ارسال را انتخاب کنید');
      return;
    }

    if (!cart || cart.items.length === 0) {
      toast.error('سبد خرید شما خالی است');
      return;
    }

    createOrderMutation.mutate();
  };

  // Set default selections when data loads (derived state, not in useEffect)
  const effectiveAddressId = selectedAddressId || 
    (addresses && addresses.length > 0 
      ? (addresses.find(a => a.is_default) || addresses[0]).id 
      : '');
  
  const effectiveShippingMethodId = selectedShippingMethodId || 
    (shippingMethods && shippingMethods.length > 0 ? shippingMethods[0].id : '');

  // Redirect is handled by useEffect
  if (!sessionChecked) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!accessToken) {
    return null;
  }

  if (isLoadingCart || isLoadingAddresses || isLoadingShipping) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="text-center py-24 bg-card rounded-2xl border border-border/50">
          <h2 className="text-xl font-bold mb-2">سبد خرید شما خالی است</h2>
          <p className="text-muted-foreground mb-6">
            برای ثبت سفارش ابتدا محصولاتی به سبد خرید اضافه کنید
          </p>
          <Link
            href="/products"
            className="inline-flex items-center justify-center px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            مشاهده محصولات
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <h1 className="text-2xl font-bold mb-8">تسویه حساب و ثبت سفارش</h1>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Forms Section */}
        <div className="lg:col-span-8 space-y-6">
          {/* Address */}
          <AddressSection 
            addresses={addresses || []}
            selectedAddressId={effectiveAddressId}
            onAddressSelect={setSelectedAddressId}
          />

          {/* Shipping Method */}
          <ShippingMethod 
            shippingMethods={shippingMethods || []}
            selectedMethodId={effectiveShippingMethodId}
            onMethodSelect={setSelectedShippingMethodId}
          />

          {/* Payment Method */}
          <PaymentMethod 
            selectedMethod={paymentMethod}
            onMethodChange={setPaymentMethod}
          />
        </div>

        {/* Summary Section */}
        <div className="lg:col-span-4">
          <CheckoutSummary 
            cart={cart}
            shippingCost={
              (() => {
                const method = shippingMethods?.find(m => m.id === effectiveShippingMethodId);
                // If pay on delivery, don't add to total (customer pays cargo directly)
                return method?.is_pay_on_delivery ? 0 : (Number(method?.cost) || 0);
              })()
            }
            selectedShippingMethod={shippingMethods?.find(m => m.id === effectiveShippingMethodId)}
            onSubmit={handleSubmitOrder}
            isSubmitting={createOrderMutation.isPending || initiatePaymentMutation.isPending}
          />
        </div>
      </div>
    </div>
  );
}
