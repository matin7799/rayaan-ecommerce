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
import type { ICartItem } from '../cart/interfaces/cart-item.interface';
import {
  OrderCancelRequest,
  OrderCancelRequestStatus,
} from './entities/order-cancel-request.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { isTorobAttributed } from '../../common/utils/torob-attribution.util';
import { PricingChannel } from '../catalog/services/price-calculator.service';
import { User } from '../users/entities/user.entity';

interface ValidatedCartItem {
  productId: string | null;
  productTitle: string;
  productSlug: string;
  optionName: string | null;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
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
    @InjectRepository(OrderCancelRequest)
    private readonly cancelRequestRepo: Repository<OrderCancelRequest>,
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

    const validatedItems = await this.validateAndRecalculateItems(
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

    // Don't clear cart here - only clear after successful payment
    // await this.cartService.clearCart(cartId);

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
    return this.ordersRepository.cancelOrder(orderId, userId);
  }

  async requestCancelOrder(
    orderId: string,
    userId: string,
    reason: string,
  ): Promise<OrderCancelRequest> {
    const order = await this.ordersRepository.findById(orderId);
    if (!order || order.user_id !== userId) {
      throw new NotFoundException('سفارش یافت نشد.');
    }

    if (order.status !== OrderStatus.PAID) {
      throw new BadRequestException(
        'درخواست لغو فقط برای سفارش پرداخت شده قابل ثبت است.',
      );
    }

    const existingPending = await this.cancelRequestRepo.findOne({
      where: {
        order_id: orderId,
        status: OrderCancelRequestStatus.PENDING,
      },
    });

    if (existingPending) {
      throw new BadRequestException('درخواست لغو در حال بررسی است.');
    }

    const request = this.cancelRequestRepo.create({
      order_id: orderId,
      user_id: userId,
      reason: reason.trim(),
      status: OrderCancelRequestStatus.PENDING,
      admin_note: null,
    });

    return this.cancelRequestRepo.save(request);
  }

  async getCancelRequestForOrder(orderId: string, userId: string) {
    const order = await this.ordersRepository.findById(orderId);
    if (!order || order.user_id !== userId) {
      throw new NotFoundException('سفارش یافت نشد.');
    }
    return this.cancelRequestRepo.findOne({
      where: { order_id: orderId },
      order: { created_at: 'DESC' },
    });
  }

  async getAllCancelRequests() {
    return this.cancelRequestRepo.find({
      order: { created_at: 'DESC' },
    });
  }

  async reviewCancelRequest(
    requestId: string,
    status: OrderCancelRequestStatus.APPROVED | OrderCancelRequestStatus.REJECTED,
    adminNote?: string,
  ) {
    const request = await this.cancelRequestRepo.findOne({
      where: { id: requestId },
    });
    if (!request) {
      throw new NotFoundException('درخواست لغو یافت نشد.');
    }
    if (request.status !== OrderCancelRequestStatus.PENDING) {
      throw new BadRequestException('این درخواست قبلاً بررسی شده است.');
    }

    request.status = status;
    request.admin_note = adminNote?.trim() || null;
    await this.cancelRequestRepo.save(request);

    if (status === OrderCancelRequestStatus.APPROVED) {
      const order = await this.ordersRepository.findById(request.order_id);
      if (order && order.status === OrderStatus.PAID) {
        await this.ordersRepository.updateStatus(order.id, OrderStatus.CANCELLED);
      }
    }

    return request;
  }

  async findAll(params: {
    page: number;
    limit: number;
    status?: OrderStatus;
  }): Promise<{ data: Order[]; total: number }> {
    return this.ordersRepository.findAll(
      params.page,
      params.limit,
      params.status,
    );
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
    this.validateStatusTransition(order.status, status);
    return this.ordersRepository.updateStatus(orderId, status);
  }

  private async validateAndRecalculateItems(
    cartItems: ICartItem[],
    isTorobUser = false,
    user?: User,
  ): Promise<ValidatedCartItem[]> {
    const validatedItems: ValidatedCartItem[] = [];

    for (const item of cartItems) {
      const product = await this.catalogService.findByVariantId(item.variantId);
      if (!product || !product.isActive) {
        throw new BadRequestException(
          `محصول مرتبط با واریانت "${item.variantId}" یافت نشد یا غیرفعال شده است.`,
        );
      }

      const variant = product.variants.find((v) => v.id === item.variantId);
      const unitPrice = variant
        ? Number(variant.price)
        : this.catalogService.getProductUnitPriceForChannel(
            product,
            user,
            isTorobUser ? PricingChannel.TOROB : PricingChannel.PUBLIC,
          );
      const totalPrice = unitPrice * item.quantity;

      validatedItems.push({
        productId: product.id,
        productTitle: product.name,
        productSlug: product.slug,
        optionName: null,
        quantity: item.quantity,
        unitPrice,
        totalPrice,
      });
    }

    return validatedItems;
  }

  private validateStatusTransition(
    currentStatus: OrderStatus,
    newStatus: OrderStatus,
  ): void {
    const allowedTransitions: Record<OrderStatus, OrderStatus[]> = {
      [OrderStatus.PENDING]: [OrderStatus.PAID, OrderStatus.CANCELLED],
      [OrderStatus.PAID]: [OrderStatus.SHIPPED, OrderStatus.CANCELLED],
      [OrderStatus.SHIPPED]: [OrderStatus.DELIVERED],
      [OrderStatus.DELIVERED]: [],
      [OrderStatus.CANCELLED]: [],
    };

    const allowed = allowedTransitions[currentStatus];
    if (!allowed || !allowed.includes(newStatus)) {
      throw new BadRequestException(
        `تغییر وضعیت از "${currentStatus}" به "${newStatus}" مجاز نیست.`,
      );
    }
  }
}
