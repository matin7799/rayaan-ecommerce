'use client';

import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle, DialogClose } from '@/components/ui/dialog';
import type { ProductCardItem } from '@/types/catalog.types';
import { cartService } from '@/services/cart.service';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { apiClient } from '@/services/api-client';
import { useAuthStore } from '@/lib/store/auth-store';
import { authService, userService } from '@/services';
import { getErrorMessage } from '@/lib/api/error-handler';
import { ProductQuickViewContent } from './ProductQuickViewContent';

interface ProductQuickViewProps {
  product: ProductCardItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ProductQuickView({ product, isOpen, onClose }: ProductQuickViewProps) {
  const PLACEHOLDER_IMAGE = 'https://ranew.s3.ir-thr-at1.arvanstorage.ir/placeholder.png';
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [cartStatus, setCartStatus] = useState<'idle' | 'loading' | 'success'>('idle');
  const [resolvedProduct, setResolvedProduct] = useState<ProductCardItem | null>(product);
  const queryClient = useQueryClient();
  const { accessToken, sessionChecked, setAuth, setTokens, logout, setSessionChecked } = useAuthStore();

  const resolveVariantId = () => {
    if (!resolvedProduct) return undefined;
    if (resolvedProduct.defaultVariantId) return resolvedProduct.defaultVariantId;
    if (resolvedProduct.hasMultipleVariants) return undefined;
    return resolvedProduct.id;
  };

  const ensureSession = async () => {
    if (accessToken) return true;
    if (!sessionChecked) return null;

    try {
      const refresh = await authService.refreshSession();
      const tokens = refresh.data;
      if (!tokens?.accessToken || !tokens?.refreshToken) return false;
      setTokens(tokens.accessToken, tokens.refreshToken);
      const user = await userService.getProfile();
      setAuth(user, tokens.accessToken, tokens.refreshToken);
      setSessionChecked(true);
      return true;
    } catch {
      logout();
      return false;
    }
  };

  useEffect(() => {
    setResolvedProduct(product);
  }, [product]);

  useEffect(() => {
    if (!isOpen || !product?.slug) return;

    const loadDetails = async () => {
      try {
        const response = await apiClient.get(`/catalog/products/${product.slug}`);
        const payload = response.data;
        const detail = payload?.data?.data ?? payload?.data ?? payload;
        const attributes = Array.isArray(detail?.attributes) ? detail.attributes : [];
        const gallery = Array.isArray(detail?.media?.gallery) ? detail.media.gallery : [];
        const images = gallery
          .slice()
          .sort(
            (left: { order?: number }, right: { order?: number }) =>
              (left?.order ?? 0) - (right?.order ?? 0),
          )
          .map((media: { url?: string }) => media?.url)
          .filter((url: string | undefined): url is string => Boolean(url));

        setResolvedProduct((prev) =>
          prev
            ? {
                ...prev,
                images: images.length > 0 ? images : prev.images,
                specs: attributes.map((attribute: { key?: string; value?: string }) => ({
                  label: attribute?.key ?? '-',
                  value: attribute?.value ?? '-',
                })),
              }
            : prev,
        );
      } catch {
        // Keep base card data if detail fetch fails.
      }
    };

    loadDetails();
  }, [isOpen, product?.slug]);

  if (!resolvedProduct) return null;
  const productData = resolvedProduct;
  const safeThumbnail =
    productData.thumbnail && productData.thumbnail.trim().length > 0
      ? productData.thumbnail
      : PLACEHOLDER_IMAGE;
  const safePrice = Number.isFinite(productData.price) ? productData.price : 0;
  const safeDiscountPrice =
    typeof productData.discountPrice === 'number' && productData.discountPrice > 0
      ? productData.discountPrice
      : undefined;

  const images = [
    ...(productData.images?.filter((image) => !!image?.trim()) ?? []),
  ];
  if (images.length === 0) {
    images.push(safeThumbnail);
  }

  const handleNextImage = () => {
    setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const handlePrevImage = () => {
    setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleAddToCart = async () => {
    if (cartStatus !== 'idle') return;
    const variantId = resolveVariantId();
    if (!variantId) {
      toast.info('برای افزودن این محصول، ابتدا گزینه/واریانت را در صفحه محصول انتخاب کنید');
      return;
    }

    const hasSession = await ensureSession();
    if (hasSession === null) {
      toast.info('در حال بررسی نشست کاربری... لطفاً دوباره تلاش کنید');
      return;
    }

    setCartStatus('loading');
    try {
      await cartService.addToCart({ variantId, quantity: 1 });
      await queryClient.invalidateQueries({ queryKey: ['cart'] });
      setCartStatus('success');
      toast.success('محصول به سبد خرید اضافه شد');
      setTimeout(() => setCartStatus('idle'), 1500);
    } catch (error) {
      setCartStatus('idle');
      const errorMessage = getErrorMessage(error);
      if (errorMessage.includes('رزرو')) {
        toast.warning(errorMessage, {
          description: 'موجودی فعلی برای پرداخت کاربر دیگری رزرو شده است.',
        });
      } else {
        toast.error(errorMessage || 'خطا در افزودن به سبد خرید');
      }
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setTimeout(() => {
        setCurrentImageIndex(0);
        setCartStatus('idle');
      }, 300);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-5xl sm:max-w-5xl md:max-w-5xl w-[95vw] p-0 overflow-hidden bg-white/95 dark:bg-zinc-950/95 backdrop-blur-xl border-zinc-200/60 dark:border-zinc-800/60 rounded-[2rem] gap-0 shadow-2xl [&>button]:hidden">
        <DialogTitle className="sr-only">مشاهده سریع {productData.title}</DialogTitle>

        <ProductQuickViewContent
          productData={productData}
          currentImageIndex={currentImageIndex}
          setCurrentImageIndex={setCurrentImageIndex}
          images={images}
          handlePrevImage={handlePrevImage}
          handleNextImage={handleNextImage}
          safeDiscountPrice={safeDiscountPrice}
          safePrice={safePrice}
          handleAddToCart={handleAddToCart}
          cartStatus={cartStatus}
        />

        <DialogClose className="absolute top-4 left-4 md:top-6 md:left-6 p-2 md:p-2.5 rounded-full bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md shadow-sm border border-zinc-200/50 dark:border-zinc-700/50 hover:bg-rose-50 hover:text-rose-500 dark:hover:bg-rose-500/20 dark:hover:text-rose-400 transition-all z-50 group">
          <X className="w-4 h-4 md:w-5 md:h-5 text-zinc-600 dark:text-zinc-400 group-hover:scale-110 transition-transform" />
        </DialogClose>
      </DialogContent>
    </Dialog>
  );
}
