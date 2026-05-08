'use client';

import { useMemo } from 'react';
import { useState } from 'react';
import Image from 'next/image';
import { PackageSearch, Star, Store, Tag } from 'lucide-react';
import { useProductsQuery } from '@/hooks/catalog/useProductsQuery';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

function StatCard({
  title,
  value,
  description,
  icon: Icon,
}: {
  title: string;
  value: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <Card className="border-zinc-200/60 dark:border-zinc-800/60">
      <CardHeader className="flex flex-row items-start justify-between space-y-0">
        <div>
          <CardDescription>{title}</CardDescription>
          <CardTitle className="mt-2 text-2xl font-bold">{value}</CardTitle>
        </div>
        <div className="rounded-2xl bg-primary/10 p-3 text-primary">
          <Icon className="size-5" />
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}

export default function DashboardCatalogPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading, isError } = useProductsQuery({
    page,
    limit: 20,
  });

  const stats = useMemo(() => {
    const products = data?.products ?? [];
    const inStockCount = products.filter((product) => product.inStock).length;
    const discountedCount = products.filter(
      (product) =>
        typeof product.discountPrice === 'number' &&
        product.discountPrice > 0 &&
        product.discountPrice < product.price,
    ).length;
    const withBadgeCount = products.filter((product) => Boolean(product.badge)).length;

    return {
      total: products.length,
      inStock: inStockCount,
      withBadge: withBadgeCount,
      discounted: discountedCount,
    };
  }, [data]);

  if (isLoading) {
    return <div className="py-16 text-center text-sm text-muted-foreground">در حال بارگذاری کاتالوگ...</div>;
  }

  if (isError || !data) {
    return (
      <div className="rounded-3xl border border-dashed border-zinc-200 bg-zinc-50 p-10 text-center dark:border-zinc-800 dark:bg-zinc-900/30">
        <PackageSearch className="mx-auto mb-4 size-12 text-red-400" />
        <h1 className="text-xl font-bold">خطا در بارگذاری کاتالوگ</h1>
        <p className="mt-2 text-sm text-muted-foreground">داده‌های کاتالوگ در دسترس نیستند.</p>
      </div>
    );
  }

  const currentPage = data.meta?.currentPage ?? page;
  const totalPages = data.meta?.totalPages ?? 1;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">مدیریت کاتالوگ</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          نمای مدیریتی محصولات یکپارچه‌شده با قیمت‌گذاری پایه، تخفیف و همکار
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="کل محصولات"
          value={stats.total.toLocaleString('fa-IR')}
          description="تعداد محصولات بارگذاری‌شده در این نما"
          icon={Store}
        />
        <StatCard
          title="موجود در انبار"
          value={stats.inStock.toLocaleString('fa-IR')}
          description="تعداد محصولاتی که اکنون قابل سفارش‌اند"
          icon={Tag}
        />
        <StatCard
          title="دارای برچسب"
          value={stats.withBadge.toLocaleString('fa-IR')}
          description="محصولات دارای لیبل (مثل حراج/همکار)"
          icon={Star}
        />
        <StatCard
          title="دارای تخفیف"
          value={stats.discounted.toLocaleString('fa-IR')}
          description="محصولاتی که صرفه‌جویی قیمتی دارند"
          icon={PackageSearch}
        />
      </div>

      <Card className="border-zinc-200/60 dark:border-zinc-800/60">
        <CardHeader>
          <CardTitle>فهرست محصولات</CardTitle>
          <CardDescription>
            آخرین محصولات کاتالوگ با وضعیت، موجودی و قیمت نهایی
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>محصول</TableHead>
                <TableHead>برند</TableHead>
                <TableHead>وضعیت</TableHead>
                <TableHead>قیمت</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="relative size-12 overflow-hidden rounded-lg bg-muted">
                        <Image
                          src={product.thumbnail}
                          alt={product.thumbnailAlt || product.title}
                          fill
                          sizes="48px"
                          className="object-cover"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="font-medium text-foreground">{product.title}</span>
                        <span className="text-xs text-muted-foreground">/{product.slug}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{product.brand || 'بدون برند'}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant={product.inStock ? 'default' : 'outline'}>
                        {product.inStock ? 'موجود' : 'ناموجود'}
                      </Badge>
                      {product.badge ? <Badge variant="secondary">{product.badge}</Badge> : null}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      {product.discountPrice ? (
                        <span className="text-xs text-muted-foreground line-through">
                          {product.price.toLocaleString('fa-IR')} تومان
                        </span>
                      ) : null}
                      <span className="font-semibold">
                        {(product.discountPrice ?? product.price).toLocaleString('fa-IR')} تومان
                      </span>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="mt-6 flex items-center justify-between border-t pt-4">
            <p className="text-sm text-muted-foreground">
              صفحه {currentPage.toLocaleString('fa-IR')} از {totalPages.toLocaleString('fa-IR')}
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage <= 1}
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              >
                قبلی
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage >= totalPages}
                onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
              >
                بعدی
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
