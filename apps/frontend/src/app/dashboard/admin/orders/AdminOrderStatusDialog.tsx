'use client';

import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2, ArrowRight } from 'lucide-react';
import type { Order } from '@/services/order.service';

const STATUS_STYLE: Record<string, string> = {
  PENDING:   'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400',
  PAID:      'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
  SHIPPED:   'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400',
  DELIVERED: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400',
  CANCELLED: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
};

export interface AdminOrderStatusDialogProps {
  statusDialogOrderId: string | null;
  setStatusDialogOrderId: (id: string | null) => void;
  nextStatus: Order['status'] | null;
  setNextStatus: (status: Order['status'] | null) => void;
  selectedOrder: Order | null;
  updateStatusMutation: any;
  ORDER_STATUSES: Order['status'][];
  statusLabel: Record<Order['status'], string>;
}

export function AdminOrderStatusDialog({
  statusDialogOrderId,
  setStatusDialogOrderId,
  nextStatus,
  setNextStatus,
  selectedOrder,
  updateStatusMutation,
  ORDER_STATUSES,
  statusLabel,
}: AdminOrderStatusDialogProps) {
  return (
    <Dialog open={Boolean(statusDialogOrderId)} onOpenChange={(open) => { if (!open) { setStatusDialogOrderId(null); setNextStatus(null); } }}>
      <DialogContent className="rounded-3xl max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-base font-black">تغییر وضعیت سفارش</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {selectedOrder && (
            <p className="text-xs text-zinc-500 font-mono bg-zinc-100 dark:bg-zinc-800 px-3 py-2 rounded-lg">
              سفارش #{selectedOrder.id.slice(0, 8)}
            </p>
          )}

          {/* Status grid picker */}
          <div className="grid grid-cols-1 gap-2">
            {ORDER_STATUSES.map((status) => (
              <button
                key={status}
                onClick={() => setNextStatus(status)}
                className={`flex items-center justify-between px-4 py-3 rounded-xl border-2 transition-all text-sm font-bold ${
                  nextStatus === status
                    ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/30'
                    : 'border-transparent bg-zinc-50 dark:bg-zinc-900 hover:border-zinc-200 dark:hover:border-zinc-700'
                }`}
              >
                <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${STATUS_STYLE[status] ?? ''}`}>
                  {statusLabel[status]}
                </span>
                {nextStatus === status && <ArrowRight className="w-4 h-4 text-indigo-500" />}
              </button>
            ))}
          </div>
        </div>

        <DialogFooter className="gap-2 flex-row">
          <Button variant="outline" className="flex-1 h-11 rounded-xl" onClick={() => setStatusDialogOrderId(null)}>
            انصراف
          </Button>
          <Button
            className="flex-1 h-11 rounded-xl font-bold"
            disabled={!selectedOrder || !nextStatus || updateStatusMutation.isPending}
            onClick={() => {
              if (!selectedOrder || !nextStatus) return;
              updateStatusMutation.mutate(
                { orderId: selectedOrder.id, status: nextStatus },
                { onSuccess: () => { setStatusDialogOrderId(null); setNextStatus(null); } }
              );
            }}
          >
            {updateStatusMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'ذخیره وضعیت'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
