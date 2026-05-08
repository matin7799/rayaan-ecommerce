'use client';
import { Suspense } from 'react';
import { useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

function PaymentCallbackContent() {
  const searchParams = useSearchParams();
  
  const { status, message, orderId, refId } = useMemo(() => {
    const statusParam = searchParams.get('status');
    const orderIdParam = searchParams.get('orderId');
    const refIdParam = searchParams.get('refId');

    if (!statusParam) {
      return {
        status: 'failed' as const,
        message: 'اطلاعات پرداخت ناقص است',
        orderId: null,
        refId: null,
      };
    }

    if (statusParam === 'success') {
      return {
        status: 'success' as const,
        message: 'پرداخت با موفقیت انجام شد',
        orderId: orderIdParam,
        refId: refIdParam,
      };
    } else {
      return {
        status: 'failed' as const,
        message: 'پرداخت ناموفق بود',
        orderId: orderIdParam,
        refId: null,
      };
    }
  }, [searchParams]);

  return (
    <div className="container mx-auto px-4 py-16 max-w-2xl">
      <div className="bg-card rounded-2xl border border-border/50 shadow-lg p-8 text-center">
        {status === 'success' && (
          <>
            <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-500" />
            <h1 className="text-2xl font-bold mb-2 text-green-600">پرداخت موفق</h1>
            <p className="text-muted-foreground mb-6">{message}</p>
            {refId && (
              <p className="text-sm text-muted-foreground mb-4">
                کد پیگیری: <span className="font-mono font-bold">{refId}</span>
              </p>
            )}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              {orderId ? (
                <Link href={`/dashboard/orders/${orderId}`}>
                  <Button size="lg" className="w-full sm:w-auto">
                    مشاهده سفارش
                  </Button>
                </Link>
              ) : (
                <Link href="/dashboard/orders">
                  <Button size="lg" className="w-full sm:w-auto">
                    مشاهده سفارشات
                  </Button>
                </Link>
              )}
              <Link href="/">
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  بازگشت به صفحه اصلی
                </Button>
              </Link>
            </div>
          </>
        )}

        {status === 'failed' && (
          <>
            <XCircle className="w-16 h-16 mx-auto mb-4 text-red-500" />
            <h1 className="text-2xl font-bold mb-2 text-red-600">پرداخت ناموفق</h1>
            <p className="text-muted-foreground mb-6">{message}</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/cart">
                <Button size="lg" className="w-full sm:w-auto">
                  بازگشت به سبد خرید
                </Button>
              </Link>
              <Link href="/">
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  بازگشت به صفحه اصلی
                </Button>
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function PaymentCallbackPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto px-4 py-16 max-w-2xl">
        <div className="bg-card rounded-2xl border border-border/50 shadow-lg p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p>در حال بررسی پرداخت...</p>
        </div>
      </div>
    }>
      <PaymentCallbackContent />
    </Suspense>
  );
}
