"use client"

import { useMemo, useState } from "react"
import { Loader2, MapPin } from "lucide-react"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Address, CreateAddressPayload } from "@/services/address.service"

const addressSchema = z.object({
  full_name: z.string().trim().min(3, "نام گیرنده باید حداقل ۳ کاراکتر باشد"),
  phone: z.string().trim().regex(/^09\d{9}$/, "شماره موبایل معتبر نیست (مثال: 09123456789)"),
  province: z.string().trim().min(2, "استان را وارد کنید"),
  city: z.string().trim().min(2, "شهر را وارد کنید"),
  postal_code: z
    .string()
    .trim()
    .refine((value) => value === "" || /^\d{10}$/.test(value), "کد پستی باید ۱۰ رقم باشد"),
  address: z.string().trim().min(10, "آدرس دقیق باید حداقل ۱۰ کاراکتر باشد"),
  is_default: z.boolean(),
})

type AddressFormValues = z.infer<typeof addressSchema>

const defaultValues: AddressFormValues = {
  full_name: "",
  phone: "",
  province: "",
  city: "",
  postal_code: "",
  address: "",
  is_default: false,
}

interface AddressDialogProps {
  children: React.ReactElement
  mode?: "create" | "edit"
  address?: Address
  open?: boolean
  onOpenChange?: (open: boolean) => void
  onSubmit: (payload: CreateAddressPayload) => Promise<void> | void
  isSubmitting?: boolean
}

export function AddressDialog({
  children,
  mode = "create",
  address,
  open,
  onOpenChange,
  onSubmit,
  isSubmitting = false,
}: AddressDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false)
  const [values, setValues] = useState<AddressFormValues>(defaultValues)
  const [errors, setErrors] = useState<Partial<Record<keyof AddressFormValues, string>>>({})

  const isControlled = typeof open === "boolean"
  const isOpen = isControlled ? open : internalOpen

  const initialValues = useMemo<AddressFormValues>(
    () => ({
      full_name: address?.full_name ?? "",
      phone: address?.phone ?? "",
      province: address?.province ?? "",
      city: address?.city ?? "",
      postal_code: address?.postal_code ?? "",
      address: address?.address ?? "",
      is_default: address?.is_default ?? false,
    }),
    [address]
  )

  const setOpen = (nextOpen: boolean) => {
    if (nextOpen) {
      setValues(initialValues)
      setErrors({})
    }

    if (!isControlled) {
      setInternalOpen(nextOpen)
    }
    onOpenChange?.(nextOpen)
  }

  const handleChange = (field: keyof AddressFormValues, value: string | boolean) => {
    setValues((current) => ({
      ...current,
      [field]: value,
    }))

    setErrors((current) => {
      if (!current[field]) {
        return current
      }

      const nextErrors = { ...current }
      delete nextErrors[field]
      return nextErrors
    })
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const result = addressSchema.safeParse(values)

    if (!result.success) {
      const formattedErrors: Partial<Record<keyof AddressFormValues, string>> = {}
      result.error.issues.forEach((issue) => {
        const field = issue.path[0] as keyof AddressFormValues
        formattedErrors[field] = issue.message
      })
      setErrors(formattedErrors)
      return
    }

    setErrors({})

    await onSubmit({
      ...result.data,
      postal_code: result.data.postal_code || undefined,
    })

    setOpen(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setOpen}>
      <DialogTrigger render={children} />
      <DialogContent className="max-w-[calc(100%-2rem)] rounded-2xl sm:max-w-2xl bg-gray-100/60" showCloseButton={!isSubmitting}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <MapPin className="h-5 w-5 text-primary" />
            {mode === "edit" ? "ویرایش آدرس" : "ثبت آدرس جدید"}
          </DialogTitle>
          <DialogDescription>
            اطلاعات گیرنده و آدرس را با دقت وارد کنید تا سفارش بدون مشکل ارسال شود.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="mt-4 space-y-5">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="full_name">نام و نام خانوادگی گیرنده</Label>
              <Input
                id="full_name"
                value={values.full_name}
                onChange={(event) => handleChange("full_name", event.target.value)}
                placeholder="علی احمدی"
                className="h-11 rounded-xl"
                disabled={isSubmitting}
                aria-invalid={!!errors.full_name}
              />
              {errors.full_name && <p className="text-xs text-rose-500">{errors.full_name}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">شماره موبایل گیرنده</Label>
              <Input
                id="phone"
                dir="ltr"
                value={values.phone}
                onChange={(event) => handleChange("phone", event.target.value)}
                placeholder="09123456789"
                className="h-11 rounded-xl text-left"
                disabled={isSubmitting}
                aria-invalid={!!errors.phone}
              />
              {errors.phone && <p className="text-xs text-rose-500">{errors.phone}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="province">استان</Label>
              <Input
                id="province"
                value={values.province}
                onChange={(event) => handleChange("province", event.target.value)}
                placeholder="تهران"
                className="h-11 rounded-xl"
                disabled={isSubmitting}
                aria-invalid={!!errors.province}
              />
              {errors.province && <p className="text-xs text-rose-500">{errors.province}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="city">شهر</Label>
              <Input
                id="city"
                value={values.city}
                onChange={(event) => handleChange("city", event.target.value)}
                placeholder="تهران"
                className="h-11 rounded-xl"
                disabled={isSubmitting}
                aria-invalid={!!errors.city}
              />
              {errors.city && <p className="text-xs text-rose-500">{errors.city}</p>}
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="address">آدرس دقیق</Label>
              <Textarea
                id="address"
                value={values.address}
                onChange={(event) => handleChange("address", event.target.value)}
                placeholder="خیابان، کوچه، پلاک، طبقه و واحد..."
                className="min-h-[120px] rounded-xl resize-none"
                disabled={isSubmitting}
                aria-invalid={!!errors.address}
              />
              {errors.address && <p className="text-xs text-rose-500">{errors.address}</p>}
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="postal_code">کد پستی</Label>
              <Input
                id="postal_code"
                dir="ltr"
                value={values.postal_code}
                onChange={(event) => handleChange("postal_code", event.target.value)}
                placeholder="1234567890"
                className="h-11 rounded-xl text-left"
                disabled={isSubmitting}
                aria-invalid={!!errors.postal_code}
              />
              {errors.postal_code && <p className="text-xs text-rose-500">{errors.postal_code}</p>}
            </div>
          </div>

          <label className="flex items-center gap-3 rounded-xl border border-border/60 bg-muted/30 px-4 py-3 text-sm">
            <Checkbox
              checked={values.is_default}
              onCheckedChange={(checked) => handleChange("is_default", checked === true)}
              disabled={isSubmitting}
            />
            <span>این آدرس به عنوان آدرس پیش‌فرض ذخیره شود</span>
          </label>

          <div className="flex flex-col-reverse gap-3 border-t border-border/60 pt-4 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              className="h-11 rounded-xl"
              onClick={() => setOpen(false)}
              disabled={isSubmitting}
            >
              انصراف
            </Button>
            <Button type="submit" className="h-11 rounded-xl min-w-32" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                  در حال ذخیره...
                </>
              ) : mode === "edit" ? (
                "ذخیره تغییرات"
              ) : (
                "ثبت آدرس"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
