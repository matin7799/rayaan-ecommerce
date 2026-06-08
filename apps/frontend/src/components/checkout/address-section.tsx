'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Check, Loader2, MapPin, Plus, Star, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

import { AddressDialog } from '@/components/dashboard/address-dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getErrorMessage } from '@/lib/api/error-handler';
import { Address, addressService, CreateAddressPayload } from '@/services/address.service';

interface AddressSectionProps {
  addresses: Address[];
  selectedAddressId: string;
  onAddressSelect: (id: string) => void;
}

export function AddressSection({ addresses, selectedAddressId, onAddressSelect }: AddressSectionProps) {
  const queryClient = useQueryClient();
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);

  const invalidateAddresses = async () => {
    await queryClient.invalidateQueries({ queryKey: ['addresses'] });
  };

  const createMutation = useMutation({
    mutationFn: (payload: CreateAddressPayload) => addressService.createAddress(payload),
    onSuccess: async (createdAddress) => {
      toast.success('آدرس جدید با موفقیت ثبت شد');
      await invalidateAddresses();
      onAddressSelect(createdAddress.id);
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error) || 'ثبت آدرس با خطا مواجه شد');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: CreateAddressPayload }) =>
      addressService.updateAddress(id, payload),
    onSuccess: async (updatedAddress) => {
      toast.success('آدرس با موفقیت ویرایش شد');
      setEditingAddress(null);
      await invalidateAddresses();
      if (selectedAddressId === updatedAddress.id || updatedAddress.is_default) {
        onAddressSelect(updatedAddress.id);
      }
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error) || 'ویرایش آدرس با خطا مواجه شد');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => addressService.deleteAddress(id),
    onSuccess: async (_, deletedId) => {
      toast.success('آدرس حذف شد');
      const remainingAddresses = addresses.filter((address) => address.id !== deletedId);
      if (selectedAddressId === deletedId) {
        const nextAddress = remainingAddresses.find((address) => address.is_default) || remainingAddresses[0];
        onAddressSelect(nextAddress?.id ?? '');
      }
      await invalidateAddresses();
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error) || 'حذف آدرس با خطا مواجه شد');
    },
  });

  const setDefaultMutation = useMutation({
    mutationFn: (id: string) => addressService.setDefaultAddress(id),
    onSuccess: async (updatedAddress) => {
      toast.success('آدرس پیش‌فرض به‌روزرسانی شد');
      await invalidateAddresses();
      onAddressSelect(updatedAddress.id);
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error) || 'تنظیم آدرس پیش‌فرض با خطا مواجه شد');
    },
  });

  const isBusy =
    createMutation.isPending ||
    updateMutation.isPending ||
    deleteMutation.isPending ||
    setDefaultMutation.isPending;

  return (
    <section className="bg-white/40 dark:bg-zinc-950/40 backdrop-blur-xl border border-white/40 dark:border-white/5 rounded-3xl p-6.5 shadow-[0_8px_32px_rgba(0,0,0,0.03)] dark:shadow-[0_16px_48px_rgba(0,0,0,0.3)] relative overflow-hidden" dir="rtl">
      {/* Dynamic ambient highlight */}
      <div className="absolute top-[-25%] right-[-15%] w-36 h-36 bg-[#008080]/5 rounded-full blur-[40px] pointer-events-none" />

      <div className="mb-6 flex items-center justify-between gap-3 font-bold">
        <div className="flex items-center gap-2.5 text-[#008080] dark:text-[#20B2AA]">
          <div className="p-2 rounded-xl bg-[#008080]/10 border border-[#008080]/15 dark:border-white/5">
            <MapPin className="h-5 w-5" />
          </div>
          <h2 className="text-base font-black text-zinc-800 dark:text-zinc-100">آدرس تحویل سفارش</h2>
        </div>

        <AddressDialog
          onSubmit={async (payload) => {
            await createMutation.mutateAsync(payload);
          }}
          isSubmitting={createMutation.isPending}
        >
          <Button variant="outline" size="sm" className="gap-1.5 rounded-xl text-xs font-black border-white/50 dark:border-white/10 hover:bg-[#008080]/10 hover:text-[#008080] dark:hover:text-[#20B2AA] h-9 transition-colors shadow-sm">
            <Plus className="h-4 w-4" />
            ثبت آدرس جدید
          </Button>
        </AddressDialog>
      </div>

      {addresses.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-zinc-200/60 dark:border-white/5 bg-white/25 dark:bg-zinc-900/10 px-4 py-10 text-center text-zinc-500 dark:text-zinc-400 font-extrabold text-xs">
          <p>شما هنوز آدرسی در حساب خود ثبت نکرده‌اید</p>
          <p className="mt-2 text-[10px] font-bold text-zinc-400 dark:text-zinc-500">برای تکمیل و ارسال سفارش، لطفا یک آدرس معتبر وارد نمایید.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {addresses.map((address) => {
            const isSelected = selectedAddressId === address.id;
            const isDeleting = deleteMutation.isPending && deleteMutation.variables === address.id;
            const isSettingDefault = setDefaultMutation.isPending && setDefaultMutation.variables === address.id;
            const isEditing = updateMutation.isPending && updateMutation.variables?.id === address.id;

            return (
              <motion.div
                key={address.id}
                onClick={() => onAddressSelect(address.id)}
                whileHover={{ scale: 1.006 }}
                whileTap={{ scale: 0.996 }}
                className={`
                  relative rounded-2xl border-2 p-4.5 transition-all cursor-pointer flex flex-col justify-between gap-4.5
                  ${isSelected
                    ? 'border-[#008080]/50 bg-[#008080]/5 ring-2 ring-[#008080]/15'
                    : 'border-zinc-200/50 dark:border-white/5 bg-white/20 dark:bg-white/5 hover:border-[#008080]/30'
                  }
                `}
              >
                {isSelected && (
                  <div className="absolute top-4 left-4 w-5 h-5 rounded-full bg-[#008080] flex items-center justify-center shadow-md shadow-[#008080]/20 animate-in zoom-in duration-200">
                    <Check className="h-3 w-3 text-white" />
                  </div>
                )}

                <div className="space-y-3 pl-8">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-extrabold text-sm text-zinc-800 dark:text-zinc-200">{address.full_name}</p>
                    {address.is_default && <Badge className="rounded-lg bg-[#008080]/10 text-[#008080] dark:text-[#20B2AA] border border-[#008080]/15 text-[9px] font-black px-2 py-0.5">آدرس پیش‌فرض</Badge>}
                    {isSelected && <Badge variant="outline" className="rounded-lg border-[#008080]/25 text-[#008080] dark:text-[#20B2AA] text-[9px] font-black px-2 py-0.5">تحویل به این آدرس</Badge>}
                  </div>

                  <div className="space-y-1 text-xs font-bold text-zinc-600 dark:text-zinc-400">
                    <p className="text-zinc-500" dir="ltr">{address.phone}</p>
                    <p>{address.province}، {address.city}</p>
                    <p className="text-zinc-500 dark:text-zinc-400 leading-relaxed font-normal">{address.address}</p>
                    {address.postal_code && (
                      <p className="text-[10px] text-zinc-400 dark:text-zinc-500 font-bold">کد پستی: {address.postal_code}</p>
                    )}
                  </div>

                  <div
                    className="flex flex-wrap items-center gap-2 border-t border-zinc-200/50 dark:border-white/5 pt-3.5"
                    onClick={(event) => event.stopPropagation()}
                  >
                    {!address.is_default && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="rounded-xl text-[11px] font-black text-[#008080] hover:text-[#008080] hover:bg-[#008080]/10 dark:hover:bg-[#008080]/20 h-8"
                        onClick={() => setDefaultMutation.mutate(address.id)}
                        disabled={isBusy}
                      >
                        {isSettingDefault ? (
                          <Loader2 className="ml-1.5 h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Star className="ml-1.5 h-3.5 w-3.5" />
                        )}
                        انتخاب پیش‌فرض
                      </Button>
                    )}

                    <AddressDialog
                      mode="edit"
                      address={address}
                      open={editingAddress?.id === address.id}
                      onOpenChange={(open) => setEditingAddress(open ? address : null)}
                      onSubmit={async (payload) => {
                        await updateMutation.mutateAsync({ id: address.id, payload });
                      }}
                      isSubmitting={isEditing}
                    >
                      <Button variant="ghost" size="sm" className="rounded-xl text-[11px] font-black h-8 hover:bg-zinc-100 dark:hover:bg-zinc-900" disabled={isBusy && !isEditing}>
                        ویرایش مشخصات
                      </Button>
                    </AddressDialog>

                    <AlertDialog>
                      <AlertDialogTrigger
                        render={
                          <Button
                            variant="ghost"
                            size="sm"
                            className="rounded-xl text-[11px] font-black text-rose-500 hover:text-rose-600 hover:bg-rose-500/10 dark:hover:bg-rose-500/20 h-8"
                            disabled={isBusy}
                          >
                            <Trash2 className="ml-1.5 h-3.5 w-3.5" />
                            حذف آدرس
                          </Button>
                        }
                      />
                      <AlertDialogContent className="rounded-3xl border border-white/10 dark:border-white/5 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-2xl" dir="rtl">
                        <AlertDialogHeader className="text-right">
                          <AlertDialogTitle className="font-black text-zinc-900 dark:text-white">آیا از حذف این آدرس مطمئن هستید؟</AlertDialogTitle>
                          <AlertDialogDescription className="text-xs font-bold text-zinc-500 dark:text-zinc-400 mt-2 leading-relaxed">
                            این آدرس به‌طور کامل از لیست آدرس‌های شما حذف می‌شود و قابل بازیابی نخواهد بود.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter className="flex-row-reverse justify-end gap-2 mt-5">
                          <AlertDialogCancel className="rounded-xl text-xs font-bold h-9.5 border-zinc-200 dark:border-white/5">انصراف</AlertDialogCancel>
                          <AlertDialogAction
                            className="rounded-xl bg-rose-500 text-white hover:bg-rose-600 text-xs font-black h-9.5 border-none shadow-md shadow-rose-500/10"
                            onClick={() => deleteMutation.mutate(address.id)}
                            disabled={isDeleting}
                          >
                            {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'بله، حذف شود'}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </section>
  );
}
