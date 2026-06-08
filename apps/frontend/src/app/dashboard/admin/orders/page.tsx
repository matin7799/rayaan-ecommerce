'use client';

import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { orderService, type Order } from '@/services/order.service';
import { useAuthStore } from '@/lib/store/auth-store';
import { Input } from '@/components/ui/input';
import { AdminOrdersStats } from './AdminOrdersStats';
import { AdminCancelRequestsList } from './AdminCancelRequestsList';
import { AdminOrdersTable } from './AdminOrdersTable';
import { AdminOrderStatusDialog } from './AdminOrderStatusDialog';
import { Loader2, ShoppingBag, Search, Filter } from 'lucide-react';

const ORDER_STATUSES: Order['status'][] = ['PENDING', 'PAID', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

const statusLabel: Record<Order['status'], string> = {
  PENDING: 'در انتظار پرداخت',
  PAID: 'پرداخت شده',
  SHIPPED: 'ارسال شده',
  DELIVERED: 'تحویل داده شده',
  CANCELLED: 'لغو شده',
};

function normalizeShippingAddress(address: Order['shipping_address']) {
  if (!address) return null;
  if (typeof address === 'object') return address as Record<string, unknown>;
  try { return JSON.parse(String(address)) as Record<string, unknown>; } catch { return null; }
}

function getOrderItemDisplay(item: Order['items'][number]) {
  const raw = item as unknown as Record<string, unknown>;
  return {
    key: String(raw.id ?? raw.variantId ?? raw.variant_id ?? raw.product_id ?? 'item'),
    title: String(raw.productTitle ?? raw.product_title ?? 'محصول'),
    sku: String(raw.variantSku ?? raw.variant_sku ?? raw.option_name ?? '-'),
    quantity: Number(raw.quantity ?? 0),
    unitPrice: Number(raw.price ?? raw.unit_price ?? 0),
    subtotal: Number(raw.subtotal ?? raw.total_price ?? 0),
  };
}

export default function AdminOrdersPage() {
  const { user } = useAuthStore();
  const isPartner = ['partner', 'collaborator'].includes(String(user?.role ?? '').toLowerCase());

  const [expandedOrderIds, setExpandedOrderIds] = useState<Record<string, boolean>>({});
  const [statusDialogOrderId, setStatusDialogOrderId] = useState<string | null>(null);
  const [nextStatus, setNextStatus] = useState<Order['status'] | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-orders'],
    queryFn: () => orderService.getAdminOrders({ page: 1, limit: 100 }),
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

  const orders = data?.data ?? [];
  const selectedOrder = statusDialogOrderId ? (orders.find((o) => o.id === statusDialogOrderId) ?? null) : null;

  const totalSales = useMemo(
    () => orders.filter(o => o.status !== 'CANCELLED').reduce((s, o) => s + Number(o.total_price) + Number(o.shipping_cost), 0),
    [orders],
  );
  const pendingCount = useMemo(() => orders.filter(o => o.status === 'PENDING').length, [orders]);

  if (isLoading) return (
    <div className="flex items-center justify-center py-32">
      <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
    </div>
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black flex items-center gap-2">
            <span className="p-2 bg-indigo-500/10 rounded-xl"><ShoppingBag className="w-6 h-6 text-indigo-600" /></span>
            مدیریت سفارش‌ها
          </h1>
          <p className="text-sm text-zinc-500 mt-1">جزئیات کاربر، اقلام سفارش و عملیات وضعیت در یک صفحه</p>
        </div>
      </div>

      {/* Stats */}
      <AdminOrdersStats
        ordersCount={orders.length}
        cancelRequestsCount={cancelRequests.length}
        totalSales={totalSales}
        pendingCount={pendingCount}
      />

      {/* Cancel Requests Alert */}
      <AdminCancelRequestsList
        cancelRequests={cancelRequests}
        onReview={(payload) => reviewCancelRequestMutation.mutate(payload)}
      />

      {/* Search + Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <Input
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="h-11 rounded-xl pr-10"
            placeholder="جستجو بر اساس شناسه، نام یا موبایل..."
          />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Filter className="w-4 h-4 text-zinc-400 shrink-0" />
          {[{ value: 'all', label: 'همه' }, ...ORDER_STATUSES.map(s => ({ value: s, label: statusLabel[s] }))].map(f => (
            <button
              key={f.value}
              onClick={() => setFilterStatus(f.value)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${filterStatus === f.value ? 'bg-indigo-600 text-white border-indigo-600' : 'border-zinc-200 dark:border-zinc-700 hover:border-indigo-400 text-zinc-600 dark:text-zinc-300'}`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      <AdminOrdersTable
        orders={orders}
        expandedOrderIds={expandedOrderIds}
        setExpandedOrderIds={setExpandedOrderIds}
        isPartner={isPartner}
        setStatusDialogOrderId={setStatusDialogOrderId}
        setNextStatus={setNextStatus}
        normalizeShippingAddress={normalizeShippingAddress}
        getOrderItemDisplay={getOrderItemDisplay}
        statusLabel={statusLabel}
        searchQuery={searchQuery}
        filterStatus={filterStatus}
      />

      {/* Status Change Dialog */}
      <AdminOrderStatusDialog
        statusDialogOrderId={statusDialogOrderId}
        setStatusDialogOrderId={setStatusDialogOrderId}
        nextStatus={nextStatus}
        setNextStatus={setNextStatus}
        selectedOrder={selectedOrder}
        updateStatusMutation={updateStatusMutation}
        ORDER_STATUSES={ORDER_STATUSES}
        statusLabel={statusLabel}
      />
    </div>
  );
}
