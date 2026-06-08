// apps/backend/src/domains/orders/orders.repository.ts

import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, EntityManager } from 'typeorm';
import { Order, OrderStatus } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';

@Injectable()
export class OrdersRepository {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepo: Repository<Order>,

    @InjectRepository(OrderItem)
    private readonly orderItemRepo: Repository<OrderItem>,

    // ────────────────────────────────────────────
    // DataSource برای اجرای تراکنش‌های اتمیک
    // وقتی Order + OrderItems باید همزمان ذخیره بشن
    // ────────────────────────────────────────────
    private readonly dataSource: DataSource,
  ) {}

  // ════════════════════════════════════════════
  // 🔵 ساخت سفارش به‌همراه آیتم‌ها (اتمیک / Transactional)
  // این مهم‌ترین متد Repository هست
  // اگه هر بخشی خطا بده، کل عملیات rollback می‌شه
  // ════════════════════════════════════════════
  async createOrderWithItems(
    orderData: {
      user_id: string;
      total_price: number;
      status?: OrderStatus;
      payment_ref?: string | null;
      shipping_address?: string | null;
      shipping_method_id?: string | null;
      shipping_cost?: number;
      payment_method?: string | null;
    },
    itemsData: {
      product_id: string | null;
      product_title: string;
      product_slug: string;
      variant_sku?: string | null;
      option_name: string | null;
      quantity: number;
      unit_price: number;
      total_price: number;
    }[],
  ): Promise<Order> {
    return this.dataSource.transaction(async (manager: EntityManager) => {
      // ── مرحله ۱: ساخت و ذخیره سفارش ──
      const order = manager.create(Order, {
        user_id: orderData.user_id,
        total_price: orderData.total_price,
        status: orderData.status ?? OrderStatus.PENDING,
        payment_ref: orderData.payment_ref ?? null,
        shipping_address: orderData.shipping_address ?? null,
        shipping_method_id: orderData.shipping_method_id ?? null,
        shipping_cost: orderData.shipping_cost ?? 0,
        payment_method: orderData.payment_method ?? null,
      });
      const savedOrder = await manager.save(Order, order);

      // ── مرحله ۲: ساخت و ذخیره آیتم‌های سفارش ──
      // هر آیتم به order_id سفارش ساخته‌شده وصل می‌شه
      const orderItems = itemsData.map((item) =>
        manager.create(OrderItem, {
          order_id: savedOrder.id,
          product_id: item.product_id,
          product_title: item.product_title,
          product_slug: item.product_slug,
          variant_sku: item.variant_sku ?? null,
          option_name: item.option_name,
          quantity: item.quantity,
          unit_price: item.unit_price,
          total_price: item.total_price,
        }),
      );
      await manager.save(OrderItem, orderItems);

      // ── مرحله ۳: لود کردن سفارش با آیتم‌ها از داخل تراکنش ──
      const orderWithItems = await manager.findOne(Order, {
        where: { id: savedOrder.id },
        relations: ['items'],
      });

      if (!orderWithItems) {
        throw new Error('خطا در ایجاد سفارش');
      }

      return orderWithItems;
    });
  }

  // items به صورت eager لود می‌شن (تنظیم entity)
  // ════════════════════════════════════════════
  async findById(id: string): Promise<Order | null> {
    return this.orderRepo.findOne({
      where: { id },
      relations: ['items'],
      order: { created_at: 'DESC' },
    });
  }

  // ════════════════════════════════════════════
  // 🔵 لیست سفارشات یک کاربر خاص
  // برای پنل "سفارشات من" در داشبورد کاربر
  // مرتب‌سازی: جدیدترین اول
  // ════════════════════════════════════════════
  async findByUserId(userId: string): Promise<Order[]> {
    return this.orderRepo.find({
      where: { user_id: userId },
      relations: ['items'],
      order: { created_at: 'DESC' },
    });
  }

  // ════════════════════════════════════════════
  // 🔵 لیست تمام سفارشات (پنل ادمین)
  // با pagination و فیلتر اختیاری status
  // ════════════════════════════════════════════
  async findAll(
    page = 1,
    limit = 20,
    status?: OrderStatus,
  ): Promise<{ data: Order[]; total: number }> {
    const where = status ? { status } : {};

    const [data, total] = await this.orderRepo.findAndCount({
      where,
      relations: ['items', 'user'],
      order: { created_at: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return { data, total };
  }

  /**
   * ذخیره تغییرات یک سفارش موجود
   * (برای تغییر وضعیت، لغو سفارش و...)
   */
  async save(order: Order): Promise<Order> {
    return this.orderRepo.save(order);
  }

  // ════════════════════════════════════════════
  // 🔵 به‌روزرسانی وضعیت سفارش (برای ادمین)
  // ════════════════════════════════════════════
  async updateStatus(orderId: string, status: OrderStatus): Promise<Order> {
    const order = await this.findById(orderId);
    if (!order) {
      throw new NotFoundException(`سفارش با شناسه ${orderId} یافت نشد.`);
    }

    order.status = status;
    order.updated_at = new Date();

    return await this.orderRepo.save(order);
  }

  // ════════════════════════════════════════════
  // 🔵 لغو سفارش توسط کاربر (فقط اگر وضعیت PENDING باشد)
  // ════════════════════════════════════════════
  async cancelOrder(orderId: string, userId: string): Promise<Order> {
    const order = await this.orderRepo.findOne({
      where: { id: orderId, user_id: userId },
      relations: ['items'],
    });

    if (!order) {
      throw new NotFoundException('سفارش یافت نشد یا متعلق به شما نیست.');
    }

    if (order.status !== OrderStatus.PENDING) {
      throw new BadRequestException(
        'فقط سفارشات در وضعیت "در انتظار پرداخت" قابل لغو هستند.',
      );
    }

    order.status = OrderStatus.CANCELLED;
    order.updated_at = new Date();

    return await this.orderRepo.save(order);
  }
}
