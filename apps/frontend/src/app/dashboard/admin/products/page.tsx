'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchProducts, updateProductByAdmin } from '@/services/catalog.service';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

export default function AdminProductsPage() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ['admin-products'],
    queryFn: () => fetchProducts({ page: 1, limit: 50 }),
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<{
    name: string;
    sku: string;
    base_price: string;
    stock_quantity: string;
  }>({
    name: '',
    sku: '',
    base_price: '',
    stock_quantity: '',
  });

  const updateMutation = useMutation({
    mutationFn: (payload: { id: string; body: Parameters<typeof updateProductByAdmin>[1] }) =>
      updateProductByAdmin(payload.id, payload.body),
    onSuccess: () => {
      setEditingId(null);
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
    },
  });

  if (isLoading) return <div>در حال بارگذاری...</div>;

  const items = (() => {
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

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">مدیریت محصولات (ادمین)</h1>
      <div className="space-y-2">
        {items.map((product) => (
          <div key={product.id} className="rounded-xl border p-3">
            <p className="font-medium">{product.name}</p>
            <p className="text-sm text-zinc-500">
              SKU: {product.sku} | قیمت پایه: {Number(product.pricing.basePrice).toLocaleString('fa-IR')} تومان
            </p>
            {editingId === product.id ? (
              <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                <Input
                  placeholder="عنوان"
                  value={form.name}
                  onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
                />
                <Input
                  placeholder="SKU"
                  value={form.sku}
                  onChange={(event) => setForm((prev) => ({ ...prev, sku: event.target.value }))}
                />
                <Input
                  placeholder="قیمت پایه"
                  value={form.base_price}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, base_price: event.target.value }))
                  }
                />
                <Input
                  placeholder="موجودی"
                  value={form.stock_quantity}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, stock_quantity: event.target.value }))
                  }
                />
                <div className="sm:col-span-2 flex gap-2">
                  <Button
                    onClick={() =>
                      updateMutation.mutate({
                        id: product.id,
                        body: {
                          name: form.name || undefined,
                          sku: form.sku || undefined,
                          base_price: form.base_price ? Number(form.base_price) : undefined,
                          stock_quantity: form.stock_quantity
                            ? Number(form.stock_quantity)
                            : undefined,
                        },
                      })
                    }
                    disabled={updateMutation.isPending}
                  >
                    ذخیره
                  </Button>
                  <Button variant="outline" onClick={() => setEditingId(null)}>
                    انصراف
                  </Button>
                </div>
              </div>
            ) : (
              <div className="mt-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setEditingId(product.id);
                    setForm({
                      name: product.name,
                      sku: product.sku,
                      base_price: String(product.pricing.basePrice),
                      stock_quantity: String(product.stockQuantity),
                    });
                  }}
                >
                  ویرایش
                </Button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
