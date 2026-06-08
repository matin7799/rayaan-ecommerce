"use client"

import React, { useEffect, useMemo, useState } from "react"
import { MapPin } from "lucide-react"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import { useIsMobile } from "@/hooks/use-mobile"
import { Address, CreateAddressPayload } from "@/services/address.service"
import { AddressForm } from "./address-form"

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
  const isMobile = useIsMobile()
  const [mounted, setMounted] = useState(false)
  const [internalOpen, setInternalOpen] = useState(false)

  // Prevent SSR/CSR hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  const isControlled = typeof open === "boolean"
  const isOpen = isControlled ? open : internalOpen

  const setOpen = (nextOpen: boolean) => {
    if (!isControlled) {
      setInternalOpen(nextOpen)
    }
    onOpenChange?.(nextOpen)
  }

  // Pre-fill values for the form when in edit mode
  const initialFormValues = useMemo(() => {
    if (!address) return undefined
    return {
      full_name: address.full_name,
      phone: address.phone,
      province: address.province,
      city: address.city,
      postal_code: address.postal_code ?? "",
      address: address.address,
      is_default: address.is_default,
    }
  }, [address])

  // Custom trigger handler that works uniformly for both Dialog and Drawer
  const trigger = useMemo(() => {
    const child = React.Children.only(children) as React.ReactElement<{
      onClick?: React.MouseEventHandler
    }>
    return React.cloneElement(child, {
      onClick: (e: React.MouseEvent) => {
        child.props.onClick?.(e)
        setOpen(true)
      },
    })
  }, [children])

  const handleFormSubmit = async (payload: CreateAddressPayload) => {
    await onSubmit(payload)
    setOpen(false)
  }

  const handleCancel = () => {
    setOpen(false)
  }

  // Before hydration, render trigger to match SSR markup
  if (!mounted) {
    return trigger
  }

  const titleText = mode === "edit" ? "ویرایش آدرس" : "ثبت آدرس جدید"
  const descriptionText = "اطلاعات گیرنده و آدرس را با دقت وارد کنید تا سفارش بدون مشکل ارسال شود."

  if (isMobile) {
    return (
      <Drawer open={isOpen} onOpenChange={setOpen}>
        {/* We trigger programmatically so we just render the cloned trigger directly */}
        {trigger}
        <DrawerContent className="px-4 pb-6 max-h-[85vh] bg-zinc-50 dark:bg-zinc-900 border-t rounded-t-[2rem]">
          <DrawerHeader className="text-right pb-4">
            <DrawerTitle className="flex items-center gap-2 text-lg font-black justify-start text-zinc-950 dark:text-zinc-50">
              <MapPin className="h-5 w-5 text-primary" />
              {titleText}
            </DrawerTitle>
            <DrawerDescription className="text-xs text-right mt-1 text-zinc-500 dark:text-zinc-400">
              {descriptionText}
            </DrawerDescription>
          </DrawerHeader>

          {/* Form scroll wrapper to handle dynamic viewports and software keyboards */}
          <div className="overflow-y-auto px-1 py-2 max-h-[calc(85vh-120px)] pb-12">
            <AddressForm
              initialValues={initialFormValues}
              mode={mode}
              onSubmit={handleFormSubmit}
              onCancel={handleCancel}
              isSubmitting={isSubmitting}
            />
          </div>
        </DrawerContent>
      </Drawer>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={setOpen}>
      <DialogTrigger render={trigger} />
      <DialogContent
        className="max-w-[calc(100%-2rem)] rounded-2xl sm:max-w-2xl bg-zinc-50/95 dark:bg-zinc-950/95 backdrop-blur-md border border-zinc-200/50 dark:border-white/5"
        showCloseButton={!isSubmitting}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-black text-zinc-950 dark:text-zinc-50">
            <MapPin className="h-5 w-5 text-primary" />
            {titleText}
          </DialogTitle>
          <DialogDescription className="text-zinc-500 dark:text-zinc-400 font-medium mt-1">
            {descriptionText}
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4">
          <AddressForm
            initialValues={initialFormValues}
            mode={mode}
            onSubmit={handleFormSubmit}
            onCancel={handleCancel}
            isSubmitting={isSubmitting}
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}
