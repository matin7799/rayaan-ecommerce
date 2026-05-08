import { OrderStatus, PaymentMethod, PaymentStatus, PaymentProvider } from './enums'

export interface OrderItem {
  id: string
  productId: string
  productName: string
  quantity: number
  price: number
  discountPrice?: number
  subtotal: number
}

export interface ShippingAddress {
  fullName: string
  phoneNumber: string
  province: string
  city: string
  addressLine: string
  postalCode: string
}

export interface PaymentInfo {
  method: PaymentMethod
  status: PaymentStatus
  provider?: PaymentProvider
  authority?: string
  refId?: string
  paidAt?: string
}

export interface Order {
  id: string
  userId: string
  items: OrderItem[]

  status: OrderStatus

  payment: PaymentInfo
  shippingAddress: ShippingAddress

  subtotal: number
  discountAmount: number
  shippingAmount: number
  totalAmount: number

  createdAt: string
  updatedAt: string
}
