'use client';

import { useState, useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchProducts, updateProductByAdmin } from '@/services/catalog.service';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { getErrorMessage } from '@/lib/api/error-handler';
import {
  Package, Search, Filter, Pencil, X, Loader2,
  TrendingUp, AlertTriangle, CheckCircle,
} from 'lucide-react';

type ProductForm = {
  name: string;
  sku: string;
  base_price: string;
  stock_quantity: string;
};

const EMPTY_FORM: ProductForm = { name: '', sku: '', base_price: '', stock_quantity: '' };

type StockFilter = 'all' | 'in_stock' | 'low_stock' | 'out_of_stock';

export default function AdminProductsPage() {
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ProductForm>(EMPTY_FORM);
  const [search, setSearch] = useState('');
  const [stockFilter, setStockFilter] = useState<StockFilter>('all');

  const { data, isLoading } = useQuery({
    queryKey: ['admin-products'],
    queryFn: () => fetchProducts({ page: 1, limit: 100 }),
  });

  const updateMutation = useMutation({
    mutationFn: (payload: { id: string; body: Parameters<typeof updateProductByAdmin>[1] }) =>
      updateProductByAdmin(payload.id, payload.body),
    onSuccess: () => {
      setEditingId(null);
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      toast.success('محصول بروزرسانی شد');
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });

  const rawItems = (() => {
    const payload = data as unknown;
    if (Array.isArray(payload) && payload.length > 0) {
      const first = payload[0] as { data?: unknown };
      if (first?.data && typeof first.data === 'object' && 'data' in first.data) {
        const nested = (first.data as { data?: unknown }).data;
        return Array.isArray(nested) ? nested : [];
      }
      return [];
    }
    if (payload && typeof payload === 'object' && 'data' in payload) {
      const maybeData = (payload as { data?: unknown }).data;
      if (Array.isArray(maybeData)) return maybeData;
      if (maybeData && typeof maybeData === 'object' && 'data' in maybeData) {
        const nested = (maybeData as { data?: unknown }).data;
        return Array.isArray(nested) ? nested : [];
      }
    }
    return [];
  })();

  const items = rawItems as any[];

  const stats = useMemo(() => ({
    total: items.length,
    inStock: items.filter(p => Number(p.stockQuantity) > 10).length,
    lowStock: items.filter(p => Number(p.stockQuantity) > 0 && Number(p.stockQuantity) <= 10).length,
    outOfStock: items.filter(p => Number(p.stockQuantity) === 0).length,
  }), [items]);

  const filtered = useMemo(() => items.filter(p => {
    const stock = Number(p.stockQuantity);
    const matchStock =
      stockFilter === 'all' ||
      (stockFilter === 'in_stock' && stock > 10) ||
      (stockFilter === 'low_stock' && stock > 0 && stock <= 10) ||
      (stockFilter === 'out_of_stock' && stock === 0);
    const matchSearch = !search ||
      String(p.name ?? '').toLowerCase().includes(search.toLowerCase()) ||
      String(p.sku ?? '').toLowerCase().includes(search.toLowerCase());
    return matchStock && matchSearch;
  }), [items, search, stockFilter]);

  const startEdit = (product: any) => {
    setEditingId(product.id);
    setForm({
      name: product.name,
      sku: product.sku,
      base_price: String(product.pricing?.basePrice ?? ''),
      stock_quantity: String(product.stockQuantity ?? ''),
    });
  };

  if (isLoading) return (
    <div className="flex items-center justify-center py-32">
      <Loader2 className="w-8 h-8 animate-spin text-pink-500" />
    </div>
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black flex items-center gap-2">
          <span className="p-2 bg-pink-500/10 rounded-xl"><Package className="w-6 h-6 text-pink-600" /></span>
          مدیریت محصولات
        </h1>
        <p className="text-sm text-zinc-500 mt-1">ویرایش قیمت، SKU و موجودی انبار محصولات</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'کل محصولات', value: stats.total, color: 'text-indigo-600', bg: 'bg-indigo-50 dark:bg-indigo-950/20 border-indigo-100 dark:border-indigo-900/40', icon: Package },
          { label: 'موجود', value: stats.inStock, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-100 dark:border-emerald-900/40', icon: CheckCircle },
          { label: 'موجودی کم', value: stats.lowStock, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-950/20 border-amber-100 dark:border-amber-900/40', icon: AlertTriangle },
          { label: 'ناموجود', value: stats.outOfStock, color: 'text-red-600', bg: 'bg-red-50 dark:bg-red-950/20 border-red-100 dark:border-red-900/40', icon: TrendingUp },
        ].map(s => (
          <div key={s.label} className={`flex items-center gap-3 p-4 rounded-2xl border ${s.bg}`}>
            <div className={`p-2.5 rounded-xl bg-white/70 dark:bg-zinc-900/50 ${s.color} shrink-0`}>
              <s.icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] text-zinc-400 font-bold">{s.label}</p>
              <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Search + Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <Input value={search} onChange={e => setSearch(e.target.value)} className="h-11 rounded-xl pr-10" placeholder="جستجو نام یا SKU محصول..." />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Filter className="w-4 h-4 text-zinc-400 shrink-0" />
          {([
            { value: 'all', label: 'همه' },
            { value: 'in_stock', label: 'موجود' },
            { value: 'low_stock', label: 'موجودی کم' },
            { value: 'out_of_stock', label: 'ناموجود' },
          ] as { value: StockFilter; label: string }[]).map(f => (
            <button key={f.value} onClick={() => setStockFilter(f.value)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${stockFilter === f.value ? 'bg-pink-600 text-white border-pink-600' : 'border-zinc-200 dark:border-zinc-700 hover:border-pink-400 text-zinc-600 dark:text-zinc-300'}`}>
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <p className="text-xs text-zinc-400">{filtered.length} محصول نمایش داده می‌شود</p>

      {/* Product List */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-zinc-400">
          <Package className="w-10 h-10 mx-auto mb-2 opacity-30" />
          <p className="font-bold text-sm">محصولی یافت نشد</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((product: any) => {
            const stock = Number(product.stockQuantity ?? 0);
            const isEditing = editingId === product.id;
            const stockColor = stock === 0 ? 'text-red-600 bg-red-100 dark:bg-red-900/30' : stock <= 10 ? 'text-amber-600 bg-amber-100 dark:bg-amber-900/30' : 'text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30';
            const stockLabel = stock === 0 ? 'ناموجود' : stock <= 10 ? `کم (${stock})` : stock.toLocaleString('fa-IR');

            return (
              <div
                key={product.id}
                className={`rounded-2xl border transition-all ${isEditing ? 'border-pink-300 dark:border-pink-800 shadow-md' : 'border-zinc-200 dark:border-zinc-800 hover:border-pink-200 dark:hover:border-pink-800 hover:shadow-sm'} bg-white dark:bg-zinc-950`}
              >
                {/* Summary Row */}
                <div className="flex items-center gap-3 p-4">
                  {/* Icon */}
                  <div className="w-10 h-10 rounded-xl bg-pink-50 dark:bg-pink-950/30 flex items-center justify-center shrink-0 border border-pink-100 dark:border-pink-900/40">
                    <Package className="w-4 h-4 text-pink-600" />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm text-zinc-900 dark:text-white truncate">{product.name}</p>
                    <div className="flex items-center gap-3 text-xs text-zinc-400 mt-0.5">
                      <span dir="ltr" className="font-mono">{product.sku}</span>
                      <span className="font-bold text-zinc-700 dark:text-zinc-300">
                        {Number(product.pricing?.basePrice ?? 0).toLocaleString('fa-IR')} ت
                      </span>
                    </div>
                  </div>

                  {/* Stock badge */}
                  <span className={`shrink-0 px-2.5 py-1 rounded-full text-[10px] font-black ${stockColor}`}>
                    {stockLabel}
                  </span>

                  {/* Edit/Cancel button */}
                  {isEditing ? (
                    <Button variant="ghost" size="sm" onClick={() => setEditingId(null)} className="shrink-0 h-8 w-8 p-0 rounded-xl">
                      <X className="w-4 h-4" />
                    </Button>
                  ) : (
                    <Button variant="outline" size="sm" onClick={() => startEdit(product)} className="shrink-0 h-8 px-3 rounded-xl text-xs font-bold">
                      <Pencil className="w-3.5 h-3.5 ml-1" />ویرایش
                    </Button>
                  )}
                </div>

                {/* Edit Form */}
                {isEditing && (
                  <div className="border-t border-zinc-100 dark:border-zinc-800 p-4 space-y-4 animate-in slide-in-from-top-1 duration-200">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label className="text-xs font-bold text-zinc-500">نام محصول</Label>
                        <Input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} className="h-10 rounded-xl" placeholder="نام محصول" />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs font-bold text-zinc-500">SKU</Label>
                        <Input dir="ltr" value={form.sku} onChange={e => setForm(p => ({ ...p, sku: e.target.value }))} className="h-10 rounded-xl font-mono text-sm" placeholder="SKU" />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs font-bold text-zinc-500">قیمت پایه (تومان)</Label>
                        <Input type="number" value={form.base_price} onChange={e => setForm(p => ({ ...p, base_price: e.target.value }))} className="h-10 rounded-xl" placeholder="0" />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs font-bold text-zinc-500">موجودی انبار</Label>
                        <Input type="number" value={form.stock_quantity} onChange={e => setForm(p => ({ ...p, stock_quantity: e.target.value }))} className="h-10 rounded-xl" placeholder="0" />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        className="h-10 px-6 rounded-xl font-bold"
                        disabled={updateMutation.isPending}
                        onClick={() => updateMutation.mutate({
                          id: product.id,
                          body: {
                            name: form.name || undefined,
                            sku: form.sku || undefined,
                            base_price: form.base_price ? Number(form.base_price) : undefined,
                            stock_quantity: form.stock_quantity ? Number(form.stock_quantity) : undefined,
                          },
                        })}
                      >
                        {updateMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'ذخیره تغییرات'}
                      </Button>
                      <Button variant="outline" onClick={() => setEditingId(null)} className="h-10 px-4 rounded-xl">انصراف</Button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
