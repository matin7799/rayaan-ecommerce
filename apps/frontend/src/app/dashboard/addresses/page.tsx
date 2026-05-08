"use client"

import { useMemo, useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  Edit3,
  Loader2,
  MapPin,
  Navigation,
  Phone,
  Plus,
  Star,
  Trash2,
  User,
} from "lucide-react"
import { toast } from "sonner"

import { AddressDialog } from "@/components/dashboard/address-dialog"
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
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { getErrorMessage } from "@/lib/api/error-handler"
import { addressService, Address, CreateAddressPayload } from "@/services/address.service"

export default function AddressesPage() {
  const queryClient = useQueryClient()
  const [editingAddress, setEditingAddress] = useState<Address | null>(null)

  const {
    data: addresses = [],
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["addresses"],
    queryFn: () => addressService.getAddresses(),
  })

  const sortedAddresses = useMemo(
    () => [...addresses].sort((a, b) => Number(b.is_default) - Number(a.is_default)),
    [addresses]
  )

  const invalidateAddresses = async () => {
    await queryClient.invalidateQueries({ queryKey: ["addresses"] })
  }

  const createMutation = useMutation({
    mutationFn: (payload: CreateAddressPayload) => addressService.createAddress(payload),
    onSuccess: async () => {
      toast.success("آدرس جدید با موفقیت ثبت شد")
      await invalidateAddresses()
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error) || "ثبت آدرس با خطا مواجه شد")
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: CreateAddressPayload }) =>
      addressService.updateAddress(id, payload),
    onSuccess: async () => {
      toast.success("آدرس با موفقیت ویرایش شد")
      setEditingAddress(null)
      await invalidateAddresses()
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error) || "ویرایش آدرس با خطا مواجه شد")
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => addressService.deleteAddress(id),
    onSuccess: async () => {
      toast.success("آدرس حذف شد")
      await invalidateAddresses()
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error) || "حذف آدرس با خطا مواجه شد")
    },
  })

  const setDefaultMutation = useMutation({
    mutationFn: (id: string) => addressService.setDefaultAddress(id),
    onSuccess: async () => {
      toast.success("آدرس پیش‌فرض به‌روزرسانی شد")
      await invalidateAddresses()
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error) || "تنظیم آدرس پیش‌فرض با خطا مواجه شد")
    },
  })

  const isBusy =
    createMutation.isPending ||
    updateMutation.isPending ||
    deleteMutation.isPending ||
    setDefaultMutation.isPending

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (isError) {
    return (
      <div className="rounded-3xl border border-destructive/20 bg-destructive/5 p-6 text-center">
        <h2 className="mb-2 text-lg font-semibold">دریافت آدرس‌ها انجام نشد</h2>
        <p className="mb-4 text-sm text-muted-foreground">
          در دریافت اطلاعات آدرس‌ها مشکلی رخ داده است. دوباره تلاش کنید.
        </p>
        <Button onClick={() => refetch()} className="rounded-xl">
          تلاش مجدد
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-10 lg:space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="mb-2 text-2xl font-bold">آدرس‌های من</h1>
          <p className="text-muted-foreground">مدیریت آدرس‌های ارسال سفارش و انتخاب آدرس پیش‌فرض</p>
        </div>

        <AddressDialog onSubmit={async (payload) => {
          await createMutation.mutateAsync(payload)
        }} isSubmitting={createMutation.isPending}>
          <Button className="h-12 rounded-xl px-6">
            <Plus className="ml-2 h-5 w-5" />
            ثبت آدرس جدید
          </Button>
        </AddressDialog>
      </div>

      {sortedAddresses.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-border/80 bg-card/60 px-6 py-16 text-center">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-muted">
            <MapPin className="h-10 w-10 text-muted-foreground" />
          </div>
          <h2 className="mb-2 text-lg font-semibold">هنوز آدرسی ثبت نشده است</h2>
          <p className="mx-auto max-w-md text-sm text-muted-foreground">
            برای ارسال سریع‌تر سفارش‌ها، آدرس‌های خود را اینجا ذخیره کنید و یکی از آن‌ها را به عنوان پیش‌فرض انتخاب کنید.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          {sortedAddresses.map((address) => {
            const isDeleting = deleteMutation.isPending && deleteMutation.variables === address.id
            const isSettingDefault = setDefaultMutation.isPending && setDefaultMutation.variables === address.id
            const isEditing = updateMutation.isPending && updateMutation.variables?.id === address.id

            return (
              <div
                key={address.id}
                className={[
                  "rounded-3xl border bg-card/80 p-6 shadow-sm transition-colors",
                  address.is_default ? "border-primary/40 bg-primary/5" : "border-border/70 hover:border-primary/30",
                ].join(" ")}
              >
                <div className="mb-5 flex items-start justify-between gap-3">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-primary" />
                      <h2 className="text-lg font-semibold">{address.full_name}</h2>
                    </div>
                    <p className="text-sm text-muted-foreground">{address.province}، {address.city}</p>
                  </div>

                  {address.is_default ? (
                    <Badge className="rounded-full px-3 py-1">پیش‌فرض</Badge>
                  ) : (
                    <Badge variant="outline" className="rounded-full px-3 py-1">
                      آدرس ذخیره‌شده
                    </Badge>
                  )}
                </div>

                <div className="space-y-4 text-sm">
                  <div className="flex items-start gap-3">
                    <User className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                    <span>{address.full_name}</span>
                  </div>

                  <div className="flex items-start gap-3">
                    <Phone className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                    <span dir="ltr">{address.phone}</span>
                  </div>

                  <div className="flex items-start gap-3">
                    <Navigation className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                    <div className="space-y-1">
                      <p>{address.address}</p>
                      {address.postal_code ? (
                        <p className="text-xs text-muted-foreground">کد پستی: {address.postal_code}</p>
                      ) : null}
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex flex-col gap-3 border-t border-border/60 pt-5 sm:flex-row sm:items-center">
                  {!address.is_default ? (
                    <Button
                      variant="outline"
                      className="rounded-xl"
                      onClick={() => setDefaultMutation.mutate(address.id)}
                      disabled={isBusy}
                    >
                      {isSettingDefault ? (
                        <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Star className="ml-2 h-4 w-4" />
                      )}
                      تنظیم به عنوان پیش‌فرض
                    </Button>
                  ) : (
                    <div className="text-sm font-medium text-primary">این آدرس پیش‌فرض شماست</div>
                  )}

                  <div className="flex-1" />

                  <AddressDialog
                    mode="edit"
                    address={address}
                    onSubmit={async (payload) => {
                      await updateMutation.mutateAsync({ id: address.id, payload })
                    }}
                    isSubmitting={isEditing}
                    open={editingAddress?.id === address.id}
                    onOpenChange={(open) => setEditingAddress(open ? address : null)}
                  >
                    <Button variant="ghost" className="rounded-xl" disabled={isBusy && !isEditing}>
                      <Edit3 className="ml-2 h-4 w-4" />
                      ویرایش
                    </Button>
                  </AddressDialog>

                  <AlertDialog>
                    <AlertDialogTrigger render={<Button variant="ghost" className="rounded-xl text-destructive hover:text-destructive" disabled={isBusy}>
                      <Trash2 className="ml-2 h-4 w-4" />
                      حذف
                    </Button>} />
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>حذف آدرس</AlertDialogTitle>
                        <AlertDialogDescription>
                          این آدرس از حساب شما حذف می‌شود و این عملیات قابل بازگشت نیست.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className="rounded-xl">انصراف</AlertDialogCancel>
                        <AlertDialogAction
                          className="rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          onClick={() => deleteMutation.mutate(address.id)}
                          disabled={isDeleting}
                        >
                          {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : "حذف آدرس"}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
