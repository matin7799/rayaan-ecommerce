'use client';

import { useState, useEffect } from 'react';
import { orderService, Order } from '@/services/order.service';
import { useCartStore } from '@/lib/store/cart-store';

/**
 * Verifies the payment result by checking the order status from the database.
 *
 * For DigiPay, the gateway POSTs a `result` field ('SUCCESS' or 'FAILURE') to
 * the backend callback, which then redirects to the frontend with a `status`
 * query param ('success' or 'failed'). We use this for instant UX feedback
 * without waiting for an additional DB round-trip.
 *
 * @param orderId - The order UUID from the URL
 * @param gatewayStatus - Pre-resolved status from URL ('success' | 'failed' | null)
 */
export function useVerifyPayment(
  orderId: string | null,
  gatewayStatus?: string | null,
) {
  const [isLoading, setIsLoading] = useState(true);
  const [isVerified, setIsVerified] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [order, setOrder] = useState<Order | null>(null);

  useEffect(() => {
    if (!orderId) {
      setIsLoading(false);
      setError('شناسه سفارش یافت نشد');
      return;
    }

    // Fast-fail path: if the backend already resolved the payment as failed and
    // communicated it via the redirect URL, skip the DB round-trip and show error
    // immediately. This improves UX especially for large DigiPay networks.
    if (gatewayStatus === 'failed') {
      setIsLoading(false);
      setIsVerified(false);
      setError('پرداخت در درگاه بانکی تأیید نشد یا لغو گردید');
      return;
    }

    let isMounted = true;

    const verify = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Authoritatively verify by reading order status directly from the database.
        // Never rely solely on gateway callback URL params for success determination.
        const dbOrder = await orderService.getOrderById(orderId);

        if (isMounted) {
          setOrder(dbOrder);
          if (dbOrder.status === 'PAID') {
            setIsVerified(true);
            // Re-synchronize client state: clear the cart after confirmed payment
            useCartStore.getState().clearCart();
          } else {
            setIsVerified(false);
            setError('پرداخت این سفارش هنوز توسط بانک تأیید نهایی نشده است');
          }
        }
      } catch (err: any) {
        console.error('Client payment verification error:', err);
        if (isMounted) {
          setError('خطا در دریافت وضعیت نهایی پرداخت سفارش');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    verify();

    return () => {
      isMounted = false;
    };
  }, [orderId, gatewayStatus]);

  return {
    isLoading,
    isVerified,
    error,
    order,
  };
}
