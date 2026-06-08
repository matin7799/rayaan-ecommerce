'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AddressSection } from '@/components/checkout/address-section';
import { ShippingMethod } from '@/components/checkout/shipping-method';
import { PaymentMethod } from '@/components/checkout/payment-method';
import { CheckoutSummary } from '@/components/checkout/checkout-summary';
import { useCartStore } from '@/lib/store/cart-store';

import { useAuthStore } from '@/lib/store/auth-store';
import { toast } from 'sonner';
import { Loader2, ShoppingBag } from 'lucide-react';
import { addressService } from '@/services/address.service';
import { cartService } from '@/services/cart.service';
import { orderService } from '@/services/order.service';
import { shippingService } from '@/services/shipping.service';
import { paymentService } from '@/services/payment.service';

function getApiErrorMessage(error: unknown, fallback: string): string {
  if (
    error &&
    typeof error === 'object' &&
    'response' in error &&
    error.response &&
    typeof error.response === 'object' &&
    'data' in error.response &&
    error.response.data &&
    typeof error.response.data === 'object' &&
    'error' in error.response.data &&
    error.response.data.error &&
    typeof error.response.data.error === 'object' &&
    'message' in error.response.data.error
  ) {
    return String(error.response.data.error.message);
  }

  return fallback;
}

export default function CheckoutPage() {
  const router = useRouter();
  const accessToken = useAuthStore((state) => state.accessToken);
  const sessionChecked = useAuthStore((state) => state.sessionChecked);
  const [selectedAddressId, setSelectedAddressId] = useState<string>('');
  const [selectedShippingMethodId, setSelectedShippingMethodId] = useState<string>('');
  const [paymentMethod] = useState<'online' | 'cash_on_delivery'>('online');
  const [selectedGateway, setSelectedGateway] = useState<'zarinpal' | 'digipay'>('zarinpal');
  const [pendingPaymentOrderId, setPendingPaymentOrderId] = useState<string | null>(null);

  // Pre-select DigiPay gateway if redirected from dynamic product widget
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const gw = urlParams.get('gateway');
      if (gw === 'digipay') {
        setSelectedGateway('digipay');
      }
    }
  }, []);

  // Redirect to login if not authenticated (only after hydration)
  useEffect(() => {
    if (typeof window !== 'undefined' && sessionChecked && !accessToken) {
      toast.error('برای ثبت سفارش ابتدا وارد شوید');
      router.push('/login?redirect=/checkout');
    }
  }, [accessToken, router, sessionChecked]);

  useEffect(() => {
    setPendingPaymentOrderId(null);
  }, [paymentMethod, selectedAddressId, selectedShippingMethodId]);

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
      setPendingPaymentOrderId(order.id);
      initiatePaymentMutation.mutate(order.id);
    },
    onError: (error: unknown) => {
      toast.error(getApiErrorMessage(error, 'خطا در ثبت سفارش'));
    },
  });

  const queryClient = useQueryClient();

  // Initiate payment mutation
  const initiatePaymentMutation = useMutation({
    mutationFn: async (orderId: string) => paymentService.initiatePayment({ orderId, provider: selectedGateway }),
    onSuccess: (data) => {
      window.location.href = data.paymentUrl;
    },
    onError: (error: unknown) => {
      toast.error(getApiErrorMessage(error, 'خطا در ایجاد درخواست پرداخت'));
    },
  });

  const handleSubmitOrder = async () => {
    if (!effectiveAddressId) {
      toast.error('لطفا آدرس خود را انتخاب کنید');
      return;
    }
    if (!effectiveShippingMethodId) {
      toast.error('لطفا روش ارسال را انتخاب کنید');
      return;
    }

    try {
      toast.loading('در حال بررسی نهایی موجودی انبار کالاها...', { id: 'stock-check' });
      const freshCart = await cartService.getCart();
      queryClient.setQueryData(['cart'], freshCart);
      useCartStore.getState().setCart(freshCart);

      if (!freshCart || freshCart.items.length === 0) {
        toast.error('سبد خرید شما خالی است', { id: 'stock-check' });
        return;
      }

      const outOfStockItem = freshCart.items.find(item => Number(item.maxStock) <= 0);

      if (outOfStockItem) {
        toast.dismiss('stock-check');
        await cartService.removeFromCart(outOfStockItem.variantId);
        queryClient.invalidateQueries({ queryKey: ['cart'] });
        toast.error(
          `کالای "${outOfStockItem.productTitle}" به دلیل اتمام ناگهانی موجودی از سبد خرید شما حذف گردید.`,
          { duration: 6000 }
        );
        return;
      }

      toast.success('موجودی انبار تایید شد. اتصال به درگاه پرداخت...', { id: 'stock-check' });

      if (paymentMethod === 'online' && pendingPaymentOrderId) {
        initiatePaymentMutation.mutate(pendingPaymentOrderId);
        return;
      }

      createOrderMutation.mutate();
    } catch (err) {
      toast.error('خطا در اعتبارسنجی موجودی سبد خرید', { id: 'stock-check' });
    }
  };

  const effectiveAddressId = selectedAddressId || 
    (addresses && addresses.length > 0 
      ? (addresses.find(a => a.is_default) || addresses[0]).id 
      : '');
  
  const effectiveShippingMethodId = selectedShippingMethodId || 
    (shippingMethods && shippingMethods.length > 0 ? shippingMethods[0].id : '');

  if (!sessionChecked || isLoadingCart || isLoadingAddresses || isLoadingShipping) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-7xl relative" dir="rtl">
        <div className="flex flex-col items-center justify-center py-36">
          <div className="relative flex items-center justify-center">
            <Loader2 className="w-10 h-10 animate-spin text-[#008080]" />
            <div className="absolute w-16 h-16 bg-[#008080]/10 rounded-full blur-[20px]" />
          </div>
          <p className="text-zinc-500 dark:text-zinc-400 text-xs font-black animate-pulse mt-5">در حال بازیابی مشخصات تسویه حساب...</p>
        </div>
      </div>
    );
  }

  if (!accessToken) {
    return null;
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-7xl" dir="rtl">
        <div className="text-center py-20 bg-white/40 dark:bg-zinc-950/40 border border-zinc-200/50 dark:border-white/10 rounded-3xl backdrop-blur-md shadow-[0_8px_32px_rgba(0,0,0,0.03)]">
          <div className="absolute top-[-20%] left-[-20%] w-72 h-72 bg-[#008080]/5 rounded-full blur-[70px]" />
          <ShoppingBag className="w-16 h-16 mx-auto text-zinc-300 dark:text-zinc-700 mb-5 animate-bounce" />
          <h2 className="text-lg font-black text-zinc-800 dark:text-zinc-200 mb-2">سبد خرید شما در حال حاضر خالی است</h2>
          <p className="text-zinc-500 dark:text-zinc-400 text-xs mb-8 font-extrabold max-w-xs mx-auto">
            برای تکمیل سفارش، ابتدا محصولاتی به سبد خرید خود اضافه فرمایید.
          </p>
          <Link
            href="/products"
            className="inline-flex items-center justify-center px-8 py-3.5 bg-gradient-to-r from-[#008080] to-[#20B2AA] hover:from-[#006666] hover:to-[#008080] text-white font-extrabold rounded-2xl transition-all shadow-md shadow-[#008080]/15 hover:scale-[1.025]"
          >
            مشاهده و خرید محصولات
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-10 max-w-7xl relative" dir="rtl">
      {/* Decorative neon ambient gradients */}
      <div className="absolute top-[5%] right-[10%] w-80 h-80 bg-[#008080]/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[15%] left-[5%] w-80 h-80 bg-[#20B2AA]/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Sleek Page Header */}
      <div className="flex items-center gap-4 mb-10 pb-5 border-b border-zinc-200/50 dark:border-white/5 relative z-10">
        <div className="bg-gradient-to-br from-[#008080] to-[#20B2AA] p-3 rounded-2xl text-white shadow-lg shadow-[#008080]/20">
          <ShoppingBag className="w-6 h-6 animate-pulse" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-zinc-800 dark:text-zinc-100">تسویه حساب و ثبت سفارش</h1>
          <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1 font-bold">
            درگاه‌های بانکی رمزنگاری شده و درگاه اقساطی BNPL دیجی‌پی آماده ثبت سفارش شما هستند.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative z-10">
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
            selectedGateway={selectedGateway}
            onGatewayChange={setSelectedGateway}
          />
        </div>

        {/* Summary Section */}
        <div className="lg:col-span-4">
          <CheckoutSummary 
            cart={cart}
            shippingCost={
              (() => {
                const method = shippingMethods?.find(m => m.id === effectiveShippingMethodId);
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
