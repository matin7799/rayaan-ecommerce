'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { blogService, Blog } from '@/services/blog.service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { getErrorMessage } from '@/lib/api/error-handler';
import {
  Plus, Pencil, Trash2, BookOpen, Eye, Clock,
  Loader2, X, Filter, Sparkles,
} from 'lucide-react';

type BlogStatus = 'draft' | 'published' | 'archived';

const STATUS_CONFIG: Record<BlogStatus, { label: string; color: string }> = {
  draft:     { label: 'پیش‌نویس',  color: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400' },
  published: { label: 'منتشر شده', color: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' },
  archived:  { label: 'آرشیو',      color: 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500' },
};

const EMPTY_FORM: Partial<Blog> = {
  title: '',
  content: '',
  excerpt: '',
  featuredImage: '',
  status: 'draft',
};

/** Convert a title to a URL-safe ASCII slug (browser-safe, no Node Buffer) */
function generateSlug(title: string): string {
  return title
    .trim()
    .toLowerCase()
    // Transliterate Persian/Arabic chars to latin via encodeURIComponent hex
    .replace(/[\u0600-\u06FF\u0750-\u077F]/g, (c) => {
      const code = c.charCodeAt(0).toString(16);
      return `x${code}`;
    })
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 190) || `blog-${Date.now()}`;
}

/**
 * If the URL is a Next.js image proxy (/_next/image?url=...),
 * decode and return the original upstream URL instead.
 * The backend @IsUrl() rejects proxy URLs.
 */
function sanitizeImageUrl(url: string): string {
  if (!url) return url;
  try {
    const parsed = new URL(url);
    if (parsed.pathname === '/_next/image') {
      const inner = parsed.searchParams.get('url');
      if (inner) return decodeURIComponent(inner);
    }
  } catch {
    // not a valid URL — return as-is and let the backend validate
  }
  return url;
}

function StoryFormModal({
  initial,
  onClose,
  onSave,
  isSaving,
}: {
  initial: Partial<Blog>;
  onClose: () => void;
  onSave: (data: Partial<Blog>) => void;
  isSaving: boolean;
}) {
  const [form, setForm] = useState<Partial<Blog>>({
    ...initial,
    // Pre-fill slug on edit; leave empty for new so user can see it auto-fill
    slug: initial.slug ?? '',
  });
  const set = (key: keyof Blog, val: unknown) => setForm(p => ({ ...p, [key]: val }));

  // When title changes on a new blog, auto-generate slug
  const handleTitleChange = (val: string) => {
    set('title', val);
    if (!initial.id) set('slug', generateSlug(val));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-3xl w-full max-w-2xl shadow-2xl p-6 space-y-5 overflow-y-auto max-h-[90vh]">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-black flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-500" />
            {initial.id ? 'ویرایش استوری / مقاله' : 'استوری / مقاله جدید'}
          </h2>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-zinc-500">عنوان *</Label>
            <Input value={form.title || ''} onChange={e => handleTitleChange(e.target.value)} className="h-11 rounded-xl" placeholder="عنوان مقاله یا استوری" />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-zinc-500">Slug (لینک یکتا) *</Label>
            <Input
              dir="ltr"
              value={form.slug || ''}
              onChange={e => set('slug', e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-+|-+$/g, ''))}
              className="h-11 rounded-xl font-mono text-sm"
              placeholder="my-blog-post"
            />
            <p className="text-[10px] text-zinc-400">فقط حروف انگلیسی، اعداد و خط‌تیره. به‌صورت خودکار از عنوان تولید می‌شود.</p>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-zinc-500">خلاصه (Excerpt)</Label>
            <Input value={form.excerpt || ''} onChange={e => set('excerpt', e.target.value)} className="h-11 rounded-xl" placeholder="خلاصه کوتاه برای نمایش در لیست" />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-zinc-500">تصویر شاخص</Label>
            <Input dir="ltr" value={form.featuredImage || ''} onChange={e => set('featuredImage', e.target.value)} className="h-11 rounded-xl font-mono text-sm" placeholder="https://..." />
            {form.featuredImage && (
              <div className="w-full h-32 rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-700 mt-2">
                <img src={form.featuredImage} alt="" className="w-full h-full object-cover" onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
              </div>
            )}
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-zinc-500">محتوا *</Label>
            <textarea
              value={form.content || ''}
              onChange={e => set('content', e.target.value)}
              rows={6}
              className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-4 py-3 text-sm resize-y focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              placeholder="محتوای کامل مقاله یا استوری را اینجا بنویسید..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-zinc-500">وضعیت</Label>
              <select
                value={form.status}
                onChange={e => set('status', e.target.value as BlogStatus)}
                className="w-full h-11 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-3 text-sm"
              >
                {Object.entries(STATUS_CONFIG).map(([val, cfg]) => (
                  <option key={val} value={val}>{cfg.label}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-zinc-500">کلمات کلیدی SEO</Label>
              <Input
                dir="ltr"
                value={(form.metaKeywords || []).join(', ')}
                onChange={e => set('metaKeywords', e.target.value.split(',').map(k => k.trim()))}
                className="h-11 rounded-xl text-sm"
                placeholder="keyword1, keyword2"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-zinc-500">عنوان SEO</Label>
            <Input value={form.metaTitle || ''} onChange={e => set('metaTitle', e.target.value)} className="h-11 rounded-xl" placeholder="عنوان برای موتورهای جستجو" />
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <Button
            onClick={() => {
              const slug = form.slug?.trim() || generateSlug(form.title ?? '');
              const featuredImage = form.featuredImage ? sanitizeImageUrl(form.featuredImage) : undefined;
              onSave({ ...form, slug, featuredImage: featuredImage || undefined });
            }}
            disabled={isSaving || !form.title || !form.content || !form.slug}
            className="flex-1 h-11 rounded-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-90 transition-opacity"
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'ذخیره استوری'}
          </Button>
          <Button variant="outline" onClick={onClose} className="h-11 rounded-xl px-6">انصراف</Button>
        </div>
      </div>
    </div>
  );
}

export default function AdminStoriesPage() {
  const queryClient = useQueryClient();
  const [filterStatus, setFilterStatus] = useState<BlogStatus | 'all'>('all');
  const [search, setSearch] = useState('');
  const [modalData, setModalData] = useState<Partial<Blog> | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-blogs'],
    queryFn: () => blogService.getBlogs({ page: 1, limit: 50 }),
  });

  const allBlogs: Blog[] = data?.items ?? [];

  const createMutation = useMutation({
    mutationFn: (d: Partial<Blog>) => blogService.createBlog(d),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-blogs'] }); setModalData(null); toast.success('مقاله / استوری ایجاد شد'); },
    onError: (e) => toast.error(getErrorMessage(e)),
  });

  const updateMutation = useMutation({
    mutationFn: (d: Partial<Blog>) => blogService.updateBlog(d.id!, d),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-blogs'] }); setModalData(null); toast.success('مقاله بروزرسانی شد'); },
    onError: (e) => toast.error(getErrorMessage(e)),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => blogService.deleteBlog(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-blogs'] }); toast.success('مقاله حذف شد'); },
    onError: (e) => toast.error(getErrorMessage(e)),
  });

  const handleSave = (data: Partial<Blog>) => {
    if (data.id) updateMutation.mutate(data);
    else createMutation.mutate(data);
  };

  const filtered = allBlogs.filter(b => {
    const matchStatus = filterStatus === 'all' || b.status === filterStatus;
    const matchSearch = !search || b.title.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  const isSaving = createMutation.isPending || updateMutation.isPending;

  const stats = {
    total: allBlogs.length,
    published: allBlogs.filter(b => b.status === 'published').length,
    draft: allBlogs.filter(b => b.status === 'draft').length,
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {modalData && (
        <StoryFormModal
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
            <span className="p-2 bg-purple-500/10 rounded-xl"><Sparkles className="w-6 h-6 text-purple-600" /></span>
            مدیریت استوری‌ها و مقالات
          </h1>
          <p className="text-sm text-zinc-500 mt-1">{stats.total} مقاله • {stats.published} منتشر شده • {stats.draft} پیش‌نویس</p>
        </div>
        <Button onClick={() => setModalData(EMPTY_FORM)} className="h-11 px-6 rounded-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 flex items-center gap-2">
          <Plus className="w-4 h-4" /> استوری جدید
        </Button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'کل محتوا', value: stats.total, color: 'text-indigo-600', bg: 'bg-indigo-50 dark:bg-indigo-950/20 border-indigo-100 dark:border-indigo-900/40' },
          { label: 'منتشر شده', value: stats.published, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-100 dark:border-emerald-900/40' },
          { label: 'پیش‌نویس', value: stats.draft, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-950/20 border-amber-100 dark:border-amber-900/40' },
        ].map(s => (
          <div key={s.label} className={`p-4 rounded-2xl border ${s.bg} flex flex-col`}>
            <span className="text-[10px] text-zinc-400 font-bold mb-1">{s.label}</span>
            <span className={`text-2xl font-black ${s.color}`}>{s.value}</span>
          </div>
        ))}
      </div>

      {/* Search + Filter Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="relative flex-1 w-full">
          <BookOpen className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <Input value={search} onChange={e => setSearch(e.target.value)} className="h-11 rounded-xl pr-10" placeholder="جستجو در عنوان مقالات..." />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Filter className="w-4 h-4 text-zinc-400 shrink-0" />
          {[{ value: 'all', label: 'همه' }, ...Object.entries(STATUS_CONFIG).map(([v, c]) => ({ value: v, label: c.label }))].map(f => (
            <button
              key={f.value}
              onClick={() => setFilterStatus(f.value as BlogStatus | 'all')}
              className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${filterStatus === f.value ? 'bg-purple-600 text-white border-purple-600' : 'border-zinc-200 dark:border-zinc-700 hover:border-purple-400 text-zinc-600 dark:text-zinc-300'}`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Blog List */}
      {isLoading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-purple-500" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-zinc-400">
          <Sparkles className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="font-bold">محتوایی یافت نشد</p>
          <p className="text-sm mt-1">اولین استوری یا مقاله را ایجاد کنید</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filtered.map(blog => (
            <div key={blog.id} className="group flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 hover:border-purple-300 dark:hover:border-purple-700 transition-all hover:shadow-md">
              {/* Thumbnail */}
              <div className="w-full sm:w-28 h-20 rounded-xl overflow-hidden bg-zinc-100 dark:bg-zinc-800 shrink-0 border border-zinc-200 dark:border-zinc-700">
                {blog.featuredImage ? (
                  <img src={blog.featuredImage} alt={blog.title} className="w-full h-full object-cover" onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                ) : (
                  <div className="w-full h-full flex items-center justify-center"><Sparkles className="w-6 h-6 text-zinc-400" /></div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <h3 className="font-bold text-zinc-900 dark:text-white truncate">{blog.title}</h3>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${STATUS_CONFIG[blog.status].color}`}>
                    {STATUS_CONFIG[blog.status].label}
                  </span>
                </div>
                {blog.excerpt && <p className="text-xs text-zinc-500 truncate">{blog.excerpt}</p>}
                <div className="flex items-center gap-4 mt-2 text-xs text-zinc-400">
                  <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{blog.viewCount.toLocaleString('fa-IR')} بازدید</span>
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{blog.readingTime} دقیقه مطالعه</span>
                  {blog.author && <span>{blog.author.firstName} {blog.author.lastName}</span>}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 shrink-0">
                <Button variant="outline" size="sm" onClick={() => setModalData(blog)} className="h-9 px-3 rounded-xl text-xs font-bold">
                  <Pencil className="w-3.5 h-3.5 ml-1" />ویرایش
                </Button>
                <Button variant="outline" size="sm" onClick={() => deleteMutation.mutate(blog.id)} disabled={deleteMutation.isPending} className="h-9 px-3 rounded-xl text-xs font-bold text-red-500 hover:text-red-600 hover:border-red-300">
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
