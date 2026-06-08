'use client';

import { CheckCircle, XCircle, AlertTriangle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface AdminCancelRequestsListProps {
  cancelRequests: any[];
  onReview: (payload: { id: string; status: 'APPROVED' | 'REJECTED' }) => void;
}

export function AdminCancelRequestsList({ cancelRequests, onReview }: AdminCancelRequestsListProps) {
  if (cancelRequests.length === 0) return null;

  return (
    <section className="space-y-3">
      <div className="flex items-center gap-2">
        <AlertTriangle className="w-4 h-4 text-amber-500" />
        <h2 className="font-bold text-sm">درخواست‌های لغو در انتظار بررسی ({cancelRequests.length})</h2>
      </div>
      <div className="space-y-2">
        {cancelRequests.map((request) => (
          <div
            key={request.id}
            className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 rounded-2xl border border-amber-200 dark:border-amber-900/40 bg-amber-50/50 dark:bg-amber-950/10"
          >
            <div className="flex-1 min-w-0 space-y-1">
              <div className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <p className="text-xs font-bold text-zinc-700 dark:text-zinc-300 truncate">
                  سفارش: #{String(request.order_id).slice(0, 8)}
                </p>
              </div>
              {request.reason && (
                <p className="text-xs text-zinc-500 pr-5">دلیل: {request.reason}</p>
              )}
            </div>

            {request.status === 'PENDING' ? (
              <div className="flex items-center gap-2 shrink-0">
                <Button
                  size="sm"
                  onClick={() => onReview({ id: request.id, status: 'APPROVED' })}
                  className="h-8 px-3 rounded-xl text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center gap-1"
                >
                  <CheckCircle className="w-3.5 h-3.5" /> تایید لغو
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onReview({ id: request.id, status: 'REJECTED' })}
                  className="h-8 px-3 rounded-xl text-xs font-bold text-red-600 border-red-300 hover:bg-red-50 flex items-center gap-1"
                >
                  <XCircle className="w-3.5 h-3.5" /> رد
                </Button>
              </div>
            ) : (
              <span className="text-xs font-bold text-zinc-500 shrink-0">
                {request.status === 'APPROVED' ? 'تایید شده' : 'رد شده'}
              </span>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
