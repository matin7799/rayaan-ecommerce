'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { userService, type AdminUser } from '@/services/user.service';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { getErrorMessage } from '@/lib/api/error-handler';
import {
  Users, Search, Filter, CheckCircle, XCircle,
  ShieldCheck, UserCheck, User, Loader2,
} from 'lucide-react';

const ROLE_CONFIG: Record<AdminUser['role'], { label: string; color: string; icon: React.ElementType }> = {
  super_admin: { label: 'سوپر ادمین', color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400', icon: ShieldCheck },
  admin:       { label: 'ادمین',       color: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400', icon: ShieldCheck },
  partner:     { label: 'همکار',       color: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400', icon: UserCheck },
  customer:    { label: 'مشتری',       color: 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400', icon: User },
  guest:       { label: 'مهمان',       color: 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500', icon: User },
};

type FilterRole = AdminUser['role'] | 'all';
type FilterStatus = 'all' | 'active' | 'blocked';

export default function AdminUsersPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState<FilterRole>('all');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => userService.getAdminUsers(500),
  });

  const updatePartnerMutation = useMutation({
    mutationFn: ({ userId, isPartner }: { userId: string; isPartner: boolean }) =>
      userService.updateThemePartner(userId, isPartner),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast.success(vars.isPartner ? 'کاربر به همکار تبدیل شد' : 'نقش همکار حذف شد');
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });

  const filtered = users.filter(u => {
    const matchRole = filterRole === 'all' || u.role === filterRole;
    const matchStatus = filterStatus === 'all' || u.status === filterStatus;
    const matchSearch = !search ||
      `${u.firstName ?? ''} ${u.lastName ?? ''}`.toLowerCase().includes(search.toLowerCase()) ||
      u.phone.includes(search) ||
      (u.email ?? '').toLowerCase().includes(search.toLowerCase());
    return matchRole && matchStatus && matchSearch;
  });

  const stats = {
    total: users.length,
    partners: users.filter(u => u.role === 'partner').length,
    admins: users.filter(u => ['admin', 'super_admin'].includes(u.role)).length,
    blocked: users.filter(u => u.status === 'blocked').length,
  };

  if (isLoading) return (
    <div className="flex items-center justify-center py-32">
      <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
    </div>
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black flex items-center gap-2">
          <span className="p-2 bg-purple-500/10 rounded-xl"><Users className="w-6 h-6 text-purple-600" /></span>
          مدیریت کاربران
        </h1>
        <p className="text-sm text-zinc-500 mt-1">فعال‌سازی نقش همکار و مدیریت دسترسی‌ها</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'کل کاربران', value: stats.total, color: 'text-indigo-600', bg: 'bg-indigo-50 dark:bg-indigo-950/20 border-indigo-100 dark:border-indigo-900/40' },
          { label: 'همکاران', value: stats.partners, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-950/20 border-amber-100 dark:border-amber-900/40' },
          { label: 'ادمین‌ها', value: stats.admins, color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-950/20 border-purple-100 dark:border-purple-900/40' },
          { label: 'مسدود شده', value: stats.blocked, color: 'text-red-600', bg: 'bg-red-50 dark:bg-red-950/20 border-red-100 dark:border-red-900/40' },
        ].map(s => (
          <div key={s.label} className={`p-4 rounded-2xl border ${s.bg}`}>
            <p className="text-[10px] text-zinc-400 font-bold">{s.label}</p>
            <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Search + Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <Input value={search} onChange={e => setSearch(e.target.value)} className="h-11 rounded-xl pr-10" placeholder="جستجو نام، موبایل، ایمیل..." />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Filter className="w-4 h-4 text-zinc-400 shrink-0" />
          {(['all', 'customer', 'partner', 'admin', 'super_admin'] as FilterRole[]).map(r => (
            <button key={r} onClick={() => setFilterRole(r)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${filterRole === r ? 'bg-purple-600 text-white border-purple-600' : 'border-zinc-200 dark:border-zinc-700 hover:border-purple-400 text-zinc-600 dark:text-zinc-300'}`}>
              {r === 'all' ? 'همه' : ROLE_CONFIG[r as AdminUser['role']]?.label ?? r}
            </button>
          ))}
          <div className="w-px h-4 bg-zinc-200 dark:bg-zinc-700" />
          {(['all', 'active', 'blocked'] as FilterStatus[]).map(s => (
            <button key={s} onClick={() => setFilterStatus(s)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${filterStatus === s ? 'bg-zinc-700 text-white border-zinc-700 dark:bg-zinc-200 dark:text-zinc-900 dark:border-zinc-200' : 'border-zinc-200 dark:border-zinc-700 hover:border-zinc-400 text-zinc-600 dark:text-zinc-300'}`}>
              {s === 'all' ? 'همه وضعیت‌ها' : s === 'active' ? 'فعال' : 'مسدود'}
            </button>
          ))}
        </div>
      </div>

      {/* Results count */}
      <p className="text-xs text-zinc-400">{filtered.length} کاربر نمایش داده می‌شود</p>

      {/* Users List */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-zinc-400">
          <Users className="w-10 h-10 mx-auto mb-2 opacity-30" />
          <p className="font-bold text-sm">کاربری یافت نشد</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((user) => {
            const isAdmin = ['admin', 'super_admin'].includes(user.role);
            const isPartner = user.role === 'partner';
            const roleConfig = ROLE_CONFIG[user.role];
            const RoleIcon = roleConfig?.icon ?? User;
            const displayName = `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() || '—';

            return (
              <div
                key={user.id}
                className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 hover:border-purple-200 dark:hover:border-purple-800 hover:shadow-sm transition-all"
              >
                {/* Avatar */}
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${roleConfig?.color ?? 'bg-zinc-100 text-zinc-500'}`}>
                  <RoleIcon className="w-4 h-4" />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-0.5">
                    <span className="font-bold text-sm text-zinc-900 dark:text-white">{displayName}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${roleConfig?.color ?? ''}`}>
                      {roleConfig?.label ?? user.role}
                    </span>
                    {user.status === 'active'
                      ? <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 flex items-center gap-0.5"><CheckCircle className="w-2.5 h-2.5" />فعال</span>
                      : <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 flex items-center gap-0.5"><XCircle className="w-2.5 h-2.5" />مسدود</span>
                    }
                  </div>
                  <div className="flex items-center gap-3 text-xs text-zinc-400">
                    <span dir="ltr" className="font-mono">{user.phone}</span>
                    {user.email && <span>{user.email}</span>}
                    <span>{new Date(user.createdAt).toLocaleDateString('fa-IR')}</span>
                  </div>
                </div>

                {/* Partner Toggle */}
                <div className="shrink-0">
                  {isAdmin ? (
                    <span className="text-xs text-zinc-400 px-3 py-1.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">ادمین</span>
                  ) : (
                    <Button
                      variant={isPartner ? 'default' : 'outline'}
                      size="sm"
                      disabled={updatePartnerMutation.isPending}
                      onClick={() => updatePartnerMutation.mutate({ userId: user.id, isPartner: !isPartner })}
                      className={`h-8 px-3 rounded-xl text-xs font-bold transition-all ${isPartner ? 'bg-amber-500 hover:bg-amber-600 text-white border-amber-500' : ''}`}
                    >
                      {updatePartnerMutation.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : isPartner ? 'لغو همکاری' : 'تبدیل به همکار'}
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
