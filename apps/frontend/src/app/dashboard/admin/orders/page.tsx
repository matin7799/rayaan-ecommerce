'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { orderService, type Order } from '@/services/order.service';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const ORDER_STATUSES: Order['status'][] = [
  'PENDING',
  'PAID',
  'SHIPPED',
  'DELIVERED',
  'CANCELLED',
];

export default function AdminOrdersPage() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ['admin-orders'],
    queryFn: () => orderService.getAdminOrders({ page: 1, limit: 50 }),
  });

  const { data: cancelRequests = [] } = useQuery({
    queryKey: ['admin-cancel-requests'],
    queryFn: () => orderService.getAdminCancelRequests(),
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ orderId, status }: { orderId: string; status: Order['status'] }) =>
      orderService.updateOrderStatusByAdmin(orderId, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-orders'] }),
  });

  const reviewCancelRequestMutation = useMutation({
    mutationFn: (payload: { id: string; status: 'APPROVED' | 'REJECTED' }) =>
      orderService.reviewCancelRequestByAdmin(payload.id, { status: payload.status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-cancel-requests'] });
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
    },
  });

  if (isLoading) return <div>در حال بارگذاری...</div>;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">مدیریت سفارش‌ها (ادمین)</h1>
      </div>

      <section className="space-y-3">
        <h2 className="font-semibold">درخواست‌های لغو پرداخت‌شده</h2>
        {cancelRequests.length === 0 ? (
          <p className="text-sm text-zinc-500">درخواستی وجود ندارد.</p>
        ) : (
          <div className="space-y-3">
            {cancelRequests.map((request) => (
              <div key={request.id} className="rounded-xl border p-4">
                <p className="text-sm">سفارش: {request.order_id}</p>
                <p className="text-sm">وضعیت: {request.status}</p>
                <p className="text-sm text-zinc-600 mt-1">دلیل: {request.reason}</p>
                {request.status === 'PENDING' ? (
                  <div className="mt-3 flex gap-2">
                    <Button
                      size="sm"
                      onClick={() =>
                        reviewCancelRequestMutation.mutate({
                          id: request.id,
                          status: 'APPROVED',
                        })
                      }
                    >
                      تایید لغو
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        reviewCancelRequestMutation.mutate({
                          id: request.id,
                          status: 'REJECTED',
                        })
                      }
                    >
                      رد درخواست
                    </Button>
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="font-semibold">لیست سفارش‌ها</h2>
        <div className="space-y-3">
          {(data?.data ?? []).map((order) => (
            <div key={order.id} className="rounded-xl border p-4">
              <p className="text-sm">#{order.id.slice(0, 8)}</p>
              <p className="text-sm text-zinc-500">
                مبلغ: {(Number(order.total_price) + Number(order.shipping_cost)).toLocaleString('fa-IR')} تومان
              </p>
              <div className="mt-3 flex items-center gap-2">
                <Select
                  value={order.status}
                  onValueChange={(value) =>
                    updateStatusMutation.mutate({
                      orderId: order.id,
                      status: value as Order['status'],
                    })
                  }
                >
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ORDER_STATUSES.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
