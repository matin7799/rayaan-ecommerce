'use client'

import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Check, Loader2, MapPin, Plus, Star, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

import { AddressDialog } from '@/components/dashboard/address-dialog'
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
} from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { getErrorMessage } from '@/lib/api/error-handler'
import { Address, addressService, CreateAddressPayload } from '@/services/address.service'

interface AddressSectionProps {
  addresses: Address[]
  selectedAddressId: string
  onAddressSelect: (id: string) => void
}

export function AddressSection({ addresses, selectedAddressId, onAddressSelect }: AddressSectionProps) {
  const queryClient = useQueryClient()
  const [editingAddress, setEditingAddress] = useState<Address | null>(null)

  const invalidateAddresses = async () => {
    await queryClient.invalidateQueries({ queryKey: ['addresses'] })
  }

  const createMutation = useMutation({
    mutationFn: (payload: CreateAddressPayload) => addressService.createAddress(payload),
    onSuccess: async (createdAddress) => {
      toast.success('آدرس جدید با موفقیت ثبت شد')
      await invalidateAddresses()
      onAddressSelect(createdAddress.id)
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error) || 'ثبت آدرس با خطا مواجه شد')
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: CreateAddressPayload }) =>
      addressService.updateAddress(id, payload),
    onSuccess: async (updatedAddress) => {
      toast.success('آدرس با موفقیت ویرایش شد')
      setEditingAddress(null)
      await invalidateAddresses()
      if (selectedAddressId === updatedAddress.id || updatedAddress.is_default) {
        onAddressSelect(updatedAddress.id)
      }
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error) || 'ویرایش آدرس با خطا مواجه شد')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => addressService.deleteAddress(id),
    onSuccess: async (_, deletedId) => {
      toast.success('آدرس حذف شد')
      const remainingAddresses = addresses.filter((address) => address.id !== deletedId)
      if (selectedAddressId === deletedId) {
        const nextAddress = remainingAddresses.find((address) => address.is_default) || remainingAddresses[0]
        onAddressSelect(nextAddress?.id ?? '')
      }
      await invalidateAddresses()
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error) || 'حذف آدرس با خطا مواجه شد')
    },
  })

  const setDefaultMutation = useMutation({
    mutationFn: (id: string) => addressService.setDefaultAddress(id),
    onSuccess: async (updatedAddress) => {
      toast.success('آدرس پیش‌فرض به‌روزرسانی شد')
      await invalidateAddresses()
      onAddressSelect(updatedAddress.id)
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error) || 'تنظیم آدرس پیش‌فرض با خطا مواجه شد')
    },
  })

  const isBusy =
    createMutation.isPending ||
    updateMutation.isPending ||
    deleteMutation.isPending ||
    setDefaultMutation.isPending

  return (
    <section className="rounded-2xl border border-border/50 bg-card p-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-primary">
          <MapPin className="h-5 w-5" />
          <h2 className="text-lg font-bold text-foreground">آدرس تحویل سفارش</h2>
        </div>

        <AddressDialog
          onSubmit={async (payload) => {
            await createMutation.mutateAsync(payload)
          }}
          isSubmitting={createMutation.isPending}
        >
          <Button variant="outline" size="sm" className="gap-2 rounded-xl">
            <Plus className="h-4 w-4" />
            آدرس جدید
          </Button>
        </AddressDialog>
      </div>

      {addresses.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border/70 bg-muted/20 px-4 py-10 text-center text-muted-foreground">
          <p>هنوز آدرسی ثبت نکرده‌اید</p>
          <p className="mt-2 text-sm">برای ثبت سفارش، ابتدا یک آدرس جدید اضافه کنید.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {addresses.map((address) => {
            const isSelected = selectedAddressId === address.id
            const isDeleting = deleteMutation.isPending && deleteMutation.variables === address.id
            const isSettingDefault = setDefaultMutation.isPending && setDefaultMutation.variables === address.id
            const isEditing = updateMutation.isPending && updateMutation.variables?.id === address.id

            return (
              <div
                key={address.id}
                onClick={() => onAddressSelect(address.id)}
                className={[
                  'relative rounded-2xl border-2 p-4 transition-all',
                  isSelected ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/40',
                ].join(' ')}
              >
                {isSelected ? (
                  <div className="absolute left-3 top-3 flex h-6 w-6 items-center justify-center rounded-full bg-primary">
                    <Check className="h-4 w-4 text-white" />
                  </div>
                ) : null}

                <div className="space-y-3 pl-8">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold">{address.full_name}</p>
                    {address.is_default ? <Badge className="rounded-full px-2.5">پیش‌فرض</Badge> : null}
                    {isSelected ? <Badge variant="outline" className="rounded-full px-2.5">انتخاب‌شده</Badge> : null}
                  </div>

                  <div className="space-y-1 text-sm">
                    <p className="text-muted-foreground" dir="ltr">{address.phone}</p>
                    <p>{address.province}، {address.city}</p>
                    <p className="text-muted-foreground">{address.address}</p>
                    {address.postal_code ? (
                      <p className="text-xs text-muted-foreground">کد پستی: {address.postal_code}</p>
                    ) : null}
                  </div>

                  <div
                    className="flex flex-wrap items-center gap-2 border-t border-border/60 pt-3"
                    onClick={(event) => event.stopPropagation()}
                  >
                    {!address.is_default ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="rounded-xl text-primary hover:text-primary"
                        onClick={() => setDefaultMutation.mutate(address.id)}
                        disabled={isBusy}
                      >
                        {isSettingDefault ? (
                          <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                        ) : (
                          <Star className="ml-2 h-4 w-4" />
                        )}
                        پیش‌فرض
                      </Button>
                    ) : null}

                    <AddressDialog
                      mode="edit"
                      address={address}
                      open={editingAddress?.id === address.id}
                      onOpenChange={(open) => setEditingAddress(open ? address : null)}
                      onSubmit={async (payload) => {
                        await updateMutation.mutateAsync({ id: address.id, payload })
                      }}
                      isSubmitting={isEditing}
                    >
                      <Button variant="ghost" size="sm" className="rounded-xl" disabled={isBusy && !isEditing}>
                        ویرایش
                      </Button>
                    </AddressDialog>

                    <AlertDialog>
                      <AlertDialogTrigger
                        render={
                          <Button
                            variant="ghost"
                            size="sm"
                            className="rounded-xl text-destructive hover:text-destructive"
                            disabled={isBusy}
                          >
                            <Trash2 className="ml-2 h-4 w-4" />
                            حذف
                          </Button>
                        }
                      />
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>حذف آدرس</AlertDialogTitle>
                          <AlertDialogDescription>
                            این آدرس از لیست آدرس‌های شما حذف می‌شود و قابل بازگشت نیست.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel className="rounded-xl">انصراف</AlertDialogCancel>
                          <AlertDialogAction
                            className="rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            onClick={() => deleteMutation.mutate(address.id)}
                            disabled={isDeleting}
                          >
                            {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'حذف آدرس'}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </section>
  )
}
