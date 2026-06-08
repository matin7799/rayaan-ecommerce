"use client"

import { useMemo, useState } from "react"
import { Loader2 } from "lucide-react"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { CreateAddressPayload } from "@/services/address.service"

// Validation schema for Iranian delivery addresses
export const addressSchema = z.object({
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

export type AddressFormValues = z.infer<typeof addressSchema>

export const defaultAddressFormValues: AddressFormValues = {
  full_name: "",
  phone: "",
  province: "",
  city: "",
  postal_code: "",
  address: "",
  is_default: false,
}

interface AddressFormProps {
  initialValues?: Partial<AddressFormValues>
  mode?: "create" | "edit"
  onSubmit: (payload: CreateAddressPayload) => Promise<void> | void
  onCancel: () => void
  isSubmitting?: boolean
}

export function AddressForm({
  initialValues,
  mode = "create",
  onSubmit,
  onCancel,
  isSubmitting = false,
}: AddressFormProps) {
  // Merge default values with any initial values passed down (e.g. for edit mode)
  const mergedInitialValues = useMemo<AddressFormValues>(
    () => ({
      full_name: initialValues?.full_name ?? "",
      phone: initialValues?.phone ?? "",
      province: initialValues?.province ?? "",
      city: initialValues?.city ?? "",
      postal_code: initialValues?.postal_code ?? "",
      address: initialValues?.address ?? "",
      is_default: initialValues?.is_default ?? false,
    }),
    [initialValues]
  )

  const [values, setValues] = useState<AddressFormValues>(mergedInitialValues)
  const [errors, setErrors] = useState<Partial<Record<keyof AddressFormValues, string>>>({})

  const handleChange = (field: keyof AddressFormValues, value: string | boolean) => {
    setValues((current) => ({
      ...current,
      [field]: value,
    }))

    // Clear error for field when it is changed
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
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
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
          {errors.full_name && <p className="text-xs text-rose-500 font-bold">{errors.full_name}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">شماره موبایل گیرنده</Label>
          <Input
            id="phone"
            dir="ltr"
            value={values.phone}
            onChange={(event) => handleChange("phone", event.target.value)}
            placeholder="09123456789"
            className="h-11 rounded-xl text-left font-sans"
            disabled={isSubmitting}
            aria-invalid={!!errors.phone}
          />
          {errors.phone && <p className="text-xs text-rose-500 font-bold">{errors.phone}</p>}
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
          {errors.province && <p className="text-xs text-rose-500 font-bold">{errors.province}</p>}
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
          {errors.city && <p className="text-xs text-rose-500 font-bold">{errors.city}</p>}
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="address">آدرس دقیق</Label>
          <Textarea
            id="address"
            value={values.address}
            onChange={(event) => handleChange("address", event.target.value)}
            placeholder="خیابان، کوچه، پلاک، طبقه و واحد..."
            className="min-h-24 rounded-xl resize-none leading-relaxed"
            disabled={isSubmitting}
            aria-invalid={!!errors.address}
          />
          {errors.address && <p className="text-xs text-rose-500 font-bold">{errors.address}</p>}
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="postal_code">کد پستی (اختیاری)</Label>
          <Input
            id="postal_code"
            dir="ltr"
            value={values.postal_code}
            onChange={(event) => handleChange("postal_code", event.target.value)}
            placeholder="1234567890"
            className="h-11 rounded-xl text-left font-sans"
            disabled={isSubmitting}
            aria-invalid={!!errors.postal_code}
          />
          {errors.postal_code && <p className="text-xs text-rose-500 font-bold">{errors.postal_code}</p>}
        </div>
      </div>

      <label className="flex items-center gap-3 rounded-xl border border-border/60 bg-muted/30 px-4 py-3 text-sm cursor-pointer select-none">
        <Checkbox
          checked={values.is_default}
          onCheckedChange={(checked) => handleChange("is_default", checked === true)}
          disabled={isSubmitting}
        />
        <span className="font-bold text-xs text-zinc-700 dark:text-zinc-300">
          این آدرس به عنوان آدرس پیش‌فرض ذخیره شود
        </span>
      </label>

      <div className="flex flex-col-reverse gap-3 border-t border-border/60 pt-4 sm:flex-row sm:justify-end">
        <Button
          type="button"
          variant="outline"
          className="h-11 rounded-xl font-bold"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          انصراف
        </Button>
        <Button type="submit" className="h-11 rounded-xl min-w-32 font-bold" disabled={isSubmitting}>
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
  )
}
