import { useState } from 'react';
import { paymentService } from '@/services/payment.service';
import { toast } from 'sonner';

export function useDigipayPayment() {
  const [isPending, setIsPending] = useState(false);

  const initiatePayment = async (orderId: string) => {
    if (!orderId) {
      toast.error('شناسه سفارش معتبر نیست');
      return;
    }

    setIsPending(true);
    try {
      toast.loading('در حال انتقال به درگاه پرداخت دیجی‌پی...', { id: 'digipay-redirect' });
      
      const response = await paymentService.initiatePayment({
        orderId,
        provider: 'digipay',
      });

      if (response && response.paymentUrl) {
        toast.success('آماده انتقال به درگاه دیجی‌پی', { id: 'digipay-redirect' });
        // Redirect to gateway
        window.location.href = response.paymentUrl;
      } else {
        throw new Error('لینک پرداخت دریافت نشد');
      }
    } catch (error: any) {
      console.error('DigiPay initiation error:', error);
      const message = error?.response?.data?.message || error.message || 'خطا در برقراری ارتباط با درگاه دیجی‌پی';
      toast.error(message, { id: 'digipay-redirect' });
    } finally {
      setIsPending(false);
    }
  };

  return {
    initiatePayment,
    isPending,
  };
}
