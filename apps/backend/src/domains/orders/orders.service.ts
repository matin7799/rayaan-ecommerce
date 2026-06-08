// apps/backend/src/domains/orders/orders.service.ts

import {
  Injectable,
  BadRequestException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import type { Request } from 'express';
import { OrdersRepository } from './orders.repository';
import { CartService } from '../cart/cart.service';
import { CatalogService } from '../catalog/services/catalog.service';
import { AddressesRepository } from '../users/addresses.repository';
import { ShippingRepository } from '../shipping/shipping.repository';
import { CreateOrderDto } from './dto/create-order.dto';
import { Order, OrderStatus } from './entities/order.entity';
import {
  OrderCancelRequest,
  OrderCancelRequestStatus,
} from './entities/order-cancel-request.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { isTorobAttributed } from '../../common/utils/torob-attribution.util';
import { User } from '../users/entities/user.entity';
import {
  validateAndRecalculateItems,
  validateStatusTransition,
} from './order-validation.helper';
import { OrderCancelService } from './order-cancel.service';
import { DigipayService } from '../payments/providers/digipay/digipay.service';
import { Payment } from '../payments/entities/payment.entity';
import { PaymentStatus } from '../payments/enums/payment-status.enum';

export interface AdminOrderResponse extends Order {
  user_summary?: {
    id: string;
    full_name: string;
    phone: string;
    role: string;
  };
  items_count?: number;
}

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  constructor(
    private readonly ordersRepository: OrdersRepository,
    private readonly cartService: CartService,
    private readonly catalogService: CatalogService,
    private readonly addressesRepo: AddressesRepository,
    private readonly shippingRepo: ShippingRepository,
    private readonly orderCancelService: OrderCancelService,
    private readonly digipayService: DigipayService,
    @InjectRepository(OrderCancelRequest)
    private readonly cancelRequestRepo: Repository<OrderCancelRequest>,
    private readonly dataSource: DataSource,
  ) {}

  async checkout(
    userId: string,
    dto: CreateOrderDto,
    req?: Request,
  ): Promise<Order> {
    this.logger.log(`شروع فرآیند checkout برای کاربر: ${userId}`);

    // Validate address
    const address = await this.addressesRepo.findById(dto.addressId, userId);
    if (!address) {
      throw new NotFoundException('آدرس انتخاب شده یافت نشد');
    }

    // Validate shipping method
    const shippingMethod = await this.shippingRepo.findById(
      dto.shippingMethodId,
    );
    if (!shippingMethod || !shippingMethod.is_active) {
      throw new NotFoundException('روش ارسال انتخاب شده یافت نشد');
    }

    // Use cart identifier format (user:userId)
    const cartId = `user:${userId}`;
    const cart = await this.cartService.getCart(cartId);

    if (!cart || !cart.items || cart.items.length === 0) {
      throw new BadRequestException('سبد خرید شما خالی است.');
    }

    const validatedItems = await validateAndRecalculateItems(
      this.catalogService,
      cart.items,
      isTorobAttributed(req),
      ((req as any)?.user as User | undefined) ?? undefined,
    );

    const itemsTotal = validatedItems.reduce(
      (sum, item) => sum + item.totalPrice,
      0,
    );

    const shippingCost = Number(shippingMethod.cost);
    const totalPrice = itemsTotal + shippingCost;

    const orderItemsData = validatedItems.map((item) => ({
      product_id: item.productId,
      product_title: item.productTitle,
      product_slug: item.productSlug,
      variant_sku: item.variantSku,
      option_name: item.optionName,
      quantity: item.quantity,
      unit_price: item.unitPrice,
      total_price: item.totalPrice,
    }));

    const order = await this.ordersRepository.createOrderWithItems(
      {
        user_id: userId,
        total_price: totalPrice,
        status: OrderStatus.PENDING,
        payment_ref: null,
        shipping_address: JSON.stringify({
          fullName: address.full_name,
          phone: address.phone,
          province: address.province,
          city: address.city,
          address: address.address,
          postalCode: address.postal_code,
        }),
        shipping_method_id: shippingMethod.id,
        shipping_cost: shippingCost,
        payment_method: dto.paymentMethod,
      },
      orderItemsData,
    );

    this.logger.log(`سفارش ${order.id} با موفقیت ایجاد شد.`);

    return order;
  }

  async findByUserId(userId: string): Promise<Order[]> {
    return this.ordersRepository.findByUserId(userId);
  }

  async findById(orderId: string, userId: string): Promise<Order> {
    const order = await this.ordersRepository.findById(orderId);
    if (!order || order.user_id !== userId) {
      throw new NotFoundException('سفارش یافت نشد.');
    }
    return order;
  }

  async cancelOrder(orderId: string, userId: string): Promise<Order> {
    return this.orderCancelService.cancelOrder(orderId, userId);
  }

  async requestCancelOrder(
    orderId: string,
    userId: string,
    reason: string,
  ): Promise<OrderCancelRequest> {
    return this.orderCancelService.requestCancelOrder(orderId, userId, reason);
  }

  async getCancelRequestForOrder(orderId: string, userId: string) {
    return this.orderCancelService.getCancelRequestForOrder(orderId, userId);
  }

  async getAllCancelRequests() {
    return this.orderCancelService.getAllCancelRequests();
  }

  async reviewCancelRequest(
    requestId: string,
    status:
      | OrderCancelRequestStatus.APPROVED
      | OrderCancelRequestStatus.REJECTED,
    adminNote?: string,
  ) {
    return this.orderCancelService.reviewCancelRequest(
      requestId,
      status,
      adminNote,
    );
  }

  async findAll(params: {
    page: number;
    limit: number;
    status?: OrderStatus;
  }): Promise<{ data: AdminOrderResponse[]; total: number }> {
    const result = await this.ordersRepository.findAll(
      params.page,
      params.limit,
      params.status,
    );

    const data = result.data.map((order) => {
      const user = order.user;
      return {
        ...order,
        items_count: order.items?.length ?? 0,
        user_summary: user
          ? {
              id: user.id,
              full_name:
                `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim(),
              phone: user.phone,
              role: user.role,
            }
          : undefined,
      };
    });

    return { data, total: result.total };
  }

  async findByIdForAdmin(orderId: string): Promise<Order> {
    const order = await this.ordersRepository.findById(orderId);
    if (!order) {
      throw new NotFoundException('سفارش یافت نشد.');
    }
    return order;
  }

  async updateStatus(orderId: string, status: OrderStatus): Promise<Order> {
    const order = await this.ordersRepository.findById(orderId);
    if (!order) {
      throw new NotFoundException('سفارش یافت نشد.');
    }
    validateStatusTransition(order.status, status);

    const updatedOrder = await this.ordersRepository.updateStatus(
      orderId,
      status,
    );

    // Auto-trigger DigiPay delivery report if status transitioned to DELIVERED
    if (status === OrderStatus.DELIVERED) {
      try {
        const payment = await this.dataSource.getRepository(Payment).findOne({
          where: {
            order_id: orderId,
            status: PaymentStatus.SUCCESS,
            provider: 'digipay' as any,
          },
        });

        if (payment && payment.provider_ref_id) {
          const callbackPayload = payment.callback_payload || {};
          const rawType =
            callbackPayload.type !== undefined
              ? callbackPayload.type
              : callbackPayload.Type;
          const type = rawType !== undefined ? Number(rawType) : undefined;

          // Deliver confirmation is required only for Credit (5) and BNPL (13)
          if (type === 5 || type === 13) {
            const productCodes = (order.items || []).map(
              (item) =>
                item.variant_sku ||
                item.product_slug ||
                String(item.product_id),
            );

            this.logger.log(
              `Auto-reporting delivery to DigiPay for orderId=${orderId}, trackingCode=${payment.provider_ref_id}`,
            );

            const deliverResult = await this.digipayService.deliverPurchase(
              {
                deliveryDate: Date.now(),
                invoiceNumber: `INV-${orderId.substring(0, 8).toUpperCase()}`,
                trackingCode: payment.provider_ref_id,
                products: productCodes,
              },
              type,
            );

            if (deliverResult.result.status === 0) {
              this.logger.log(
                `Auto-delivery successfully reported to DigiPay for orderId=${orderId}`,
              );
            } else {
              this.logger.warn(
                `Auto-delivery report to DigiPay failed: ${deliverResult.result.message}`,
              );
            }
          }
        }
      } catch (err: any) {
        this.logger.error(
          `Error reporting auto-delivery to DigiPay: ${err.message}`,
        );
      }
    }

    return updatedOrder;
  }
}
