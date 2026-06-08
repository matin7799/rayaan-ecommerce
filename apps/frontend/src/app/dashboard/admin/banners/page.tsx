'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { bannerService, Banner, BannerPosition } from '@/services/banner.service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { getErrorMessage } from '@/lib/api/error-handler';
import {
  Plus, Pencil, Trash2, Image as ImageIcon, Eye, MousePointerClick,
  Loader2, X, CheckCircle, XCircle, Filter,
} from 'lucide-react';

const POSITIONS: { value: BannerPosition; label: string }[] = [
  { value: BannerPosition.HOME_HERO, label: 'صفحه اصلی - هیرو' },
  { value: BannerPosition.HOME_SECONDARY, label: 'صفحه اصلی - ثانویه' },
  { value: BannerPosition.CATEGORY_TOP, label: 'بالای دسته‌بندی' },
  { value: BannerPosition.SIDEBAR, label: 'سایدبار' },
  { value: BannerPosition.FOOTER, label: 'فوتر' },
];

const EMPTY_FORM: Partial<Banner> = {
  title: '',
  description: '',
  imageUrl: '',
  mobileImageUrl: '',
  linkUrl: '',
  position: BannerPosition.HOME_HERO,
  order: 0,
  isActive: true,
};

function BannerFormModal({
  initial,
  onClose,
  onSave,
  isSaving,
}: {
  initial: Partial<Banner>;
  onClose: () => void;
  onSave: (data: Partial<Banner>) => void;
  isSaving: boolean;
}) {
  const [form, setForm] = useState<Partial<Banner>>(initial);
  const set = (key: keyof Banner, val: unknown) => setForm(p => ({ ...p, [key]: val }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-3xl w-full max-w-lg shadow-2xl p-6 space-y-5 overflow-y-auto max-h-[90vh]">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-black">{initial.id ? 'ویرایش بنر' : 'بنر جدید'}</h2>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-zinc-500">عنوان بنر *</Label>
            <Input value={form.title || ''} onChange={e => set('title', e.target.value)} className="h-11 rounded-xl" placeholder="عنوان را وارد کنید" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-zinc-500">توضیحات</Label>
            <Input value={form.description || ''} onChange={e => set('description', e.target.value)} className="h-11 rounded-xl" placeholder="توضیحات اختیاری" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-zinc-500">آدرس تصویر *</Label>
            <Input dir="ltr" value={form.imageUrl || ''} onChange={e => set('imageUrl', e.target.value)} className="h-11 rounded-xl font-mono text-sm" placeholder="https://..." />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-zinc-500">تصویر موبایل</Label>
            <Input dir="ltr" value={form.mobileImageUrl || ''} onChange={e => set('mobileImageUrl', e.target.value)} className="h-11 rounded-xl font-mono text-sm" placeholder="https://..." />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-zinc-500">لینک مقصد</Label>
            <Input dir="ltr" value={form.linkUrl || ''} onChange={e => set('linkUrl', e.target.value)} className="h-11 rounded-xl font-mono text-sm" placeholder="https://..." />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-zinc-500">موقعیت</Label>
              <select
                value={form.position}
                onChange={e => set('position', e.target.value as BannerPosition)}
                className="w-full h-11 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-3 text-sm"
              >
                {POSITIONS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-zinc-500">ترتیب نمایش</Label>
              <Input type="number" value={form.order ?? 0} onChange={e => set('order', Number(e.target.value))} className="h-11 rounded-xl" />
            </div>
          </div>
          <label className="flex items-center gap-3 p-3 rounded-xl border border-zinc-200 dark:border-zinc-700 cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
            <input type="checkbox" checked={!!form.isActive} onChange={e => set('isActive', e.target.checked)} className="w-4 h-4 accent-indigo-600" />
            <span className="text-sm font-bold">بنر فعال باشد</span>
          </label>
        </div>

        <div className="flex gap-3 pt-2">
          <Button onClick={() => onSave(form)} disabled={isSaving || !form.title || !form.imageUrl} className="flex-1 h-11 rounded-xl font-bold">
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'ذخیره بنر'}
          </Button>
          <Button variant="outline" onClick={onClose} className="h-11 rounded-xl px-6">انصراف</Button>
        </div>
      </div>
    </div>
  );
}

export default function AdminBannersPage() {
  const queryClient = useQueryClient();
  const [filterPos, setFilterPos] = useState<BannerPosition | 'all'>('all');
  const [modalData, setModalData] = useState<Partial<Banner> | null>(null);

  const { data: banners = [], isLoading } = useQuery({
    queryKey: ['admin-banners'],
    queryFn: bannerService.getActiveBanners,
  });

  const createMutation = useMutation({
    mutationFn: (d: Partial<Banner>) => bannerService.createBanner(d),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-banners'] }); setModalData(null); toast.success('بنر جدید ایجاد شد'); },
    onError: (e) => toast.error(getErrorMessage(e)),
  });

  const updateMutation = useMutation({
    mutationFn: (d: Partial<Banner>) => bannerService.updateBanner(d.id!, d),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-banners'] }); setModalData(null); toast.success('بنر بروزرسانی شد'); },
    onError: (e) => toast.error(getErrorMessage(e)),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => bannerService.deleteBanner(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-banners'] }); toast.success('بنر حذف شد'); },
    onError: (e) => toast.error(getErrorMessage(e)),
  });

  const handleSave = (data: Partial<Banner>) => {
    if (data.id) updateMutation.mutate(data);
    else createMutation.mutate(data);
  };

  const filtered = filterPos === 'all' ? banners : banners.filter(b => b.position === filterPos);
  const isSaving = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {modalData && (
        <BannerFormModal
          initial={modalData}
          onClose={() => setModalData(null)}
          onSave={handleSave}
          isSaving={isSaving}
        />
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black flex items-center gap-2">
            <span className="p-2 bg-indigo-500/10 rounded-xl"><ImageIcon className="w-6 h-6 text-indigo-600" /></span>
            مدیریت بنرها
          </h1>
          <p className="text-sm text-zinc-500 mt-1">{banners.length} بنر در سیستم</p>
        </div>
        <Button onClick={() => setModalData(EMPTY_FORM)} className="h-11 px-6 rounded-xl font-bold flex items-center gap-2">
          <Plus className="w-4 h-4" /> بنر جدید
        </Button>
      </div>

      {/* Filter Bar */}
      <div className="flex items-center gap-2 flex-wrap">
        <Filter className="w-4 h-4 text-zinc-400 shrink-0" />
        {[{ value: 'all', label: 'همه' }, ...POSITIONS].map(p => (
          <button
            key={p.value}
            onClick={() => setFilterPos(p.value as BannerPosition | 'all')}
            className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${filterPos === p.value ? 'bg-indigo-600 text-white border-indigo-600' : 'border-zinc-200 dark:border-zinc-700 hover:border-indigo-400 text-zinc-600 dark:text-zinc-300'}`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Banner List */}
      {isLoading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-indigo-500" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-zinc-400">
          <ImageIcon className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="font-bold">بنری یافت نشد</p>
          <p className="text-sm mt-1">اولین بنر را ایجاد کنید</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filtered.map(banner => (
            <div key={banner.id} className="group flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all hover:shadow-md">
              {/* Thumbnail */}
              <div className="w-full sm:w-32 h-20 rounded-xl overflow-hidden bg-zinc-100 dark:bg-zinc-800 shrink-0 border border-zinc-200 dark:border-zinc-700">
                {banner.imageUrl ? (
                  <img src={banner.imageUrl} alt={banner.title} className="w-full h-full object-cover" onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                ) : (
                  <div className="w-full h-full flex items-center justify-center"><ImageIcon className="w-6 h-6 text-zinc-400" /></div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <h3 className="font-bold text-zinc-900 dark:text-white truncate">{banner.title}</h3>
                  {banner.isActive
                    ? <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold"><CheckCircle className="w-3 h-3" />فعال</span>
                    : <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-[10px] font-bold"><XCircle className="w-3 h-3" />غیرفعال</span>
                  }
                  <span className="px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 text-[10px] font-bold">
                    {POSITIONS.find(p => p.value === banner.position)?.label ?? banner.position}
                  </span>
                </div>
                {banner.description && <p className="text-xs text-zinc-500 truncate">{banner.description}</p>}
                <div className="flex items-center gap-4 mt-2 text-xs text-zinc-400">
                  <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{banner.viewCount.toLocaleString('fa-IR')} بازدید</span>
                  <span className="flex items-center gap-1"><MousePointerClick className="w-3 h-3" />{banner.clickCount.toLocaleString('fa-IR')} کلیک</span>
                  <span>ترتیب: {banner.order}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 shrink-0">
                <Button variant="outline" size="sm" onClick={() => setModalData(banner)} className="h-9 px-3 rounded-xl text-xs font-bold">
                  <Pencil className="w-3.5 h-3.5 ml-1" />ویرایش
                </Button>
                <Button variant="outline" size="sm" onClick={() => deleteMutation.mutate(banner.id)} disabled={deleteMutation.isPending} className="h-9 px-3 rounded-xl text-xs font-bold text-red-500 hover:text-red-600 hover:border-red-300">
                  {deleteMutation.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
