import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DataSource, EntityManager } from 'typeorm';
import Redis from 'ioredis';
import { REDIS_CLIENT } from '../../shared/redis/redis.constants';
import { OrderItem } from '../orders/entities/order-item.entity';

type ReservationEntry = {
  sku: string;
  quantity: number;
  productId: string | null;
};

@Injectable()
export class PaymentsInventoryService {
  private readonly reservationTtlSec: number;

  constructor(
    private readonly dataSource: DataSource,
    private readonly configService: ConfigService,
    @Inject(REDIS_CLIENT) private readonly redis: Redis,
  ) {
    this.reservationTtlSec = Number(
      this.configService.get<string>('PAYMENT_RESERVATION_TTL_SEC', '900'),
    );
  }

  async validateStock(orderItems: OrderItem[]): Promise<void> {
    for (const item of orderItems) {
      const sku =
        typeof item.variant_sku === 'string' ? item.variant_sku.trim() : '';
      const quantity =
        typeof item.quantity === 'number'
          ? item.quantity
          : Number(item.quantity ?? 0);
      const productId =
        typeof item.product_id === 'string' ? item.product_id : null;

      if (!sku || quantity <= 0) {
        continue;
      }

      const currentStock =
        (await this.getVariantStockBySku(sku)) ??
        (productId ? await this.getProductStockById(productId) : null);

      if (currentStock === null) {
        continue;
      }

      const reservedRaw = await this.redis.get(`stock:reserved:sku:${sku}`);
      const reserved = Number(reservedRaw ?? 0);
      const available = currentStock - reserved;

      if (available < quantity) {
        throw new BadRequestException(`موجودی SKU ${sku} کافی نیست.`);
      }
    }
  }

  async reserveInventoryForPayment(
    paymentId: string,
    orderItems: OrderItem[],
  ): Promise<void> {
    const reservations: ReservationEntry[] = [];

    for (const item of orderItems) {
      const sku =
        typeof item.variant_sku === 'string' ? item.variant_sku.trim() : '';

      const quantity =
        typeof item.quantity === 'number'
          ? item.quantity
          : Number(item.quantity ?? 0);
      const productId =
        typeof item.product_id === 'string' ? item.product_id : null;

      if (!sku || quantity <= 0) {
        continue;
      }

      const currentStock =
        (await this.getVariantStockBySku(sku)) ??
        (productId ? await this.getProductStockById(productId) : null);
      if (currentStock === null) {
        continue;
      }

      const reservedRaw = await this.redis.get(`stock:reserved:sku:${sku}`);
      const reserved = Number(reservedRaw ?? 0);
      const available = currentStock - reserved;

      if (available < quantity) {
        throw new BadRequestException(`موجودی SKU ${sku} کافی نیست.`);
      }

      await this.redis.incrby(`stock:reserved:sku:${sku}`, quantity);
      await this.redis.expire(
        `stock:reserved:sku:${sku}`,
        this.reservationTtlSec,
      );

      reservations.push({ sku, quantity, productId });
    }

    await this.redis.set(
      `stock:reservation:payment:${paymentId}`,
      JSON.stringify(reservations),
      'EX',
      this.reservationTtlSec,
    );
  }

  async releaseInventoryReservation(paymentId: string): Promise<void> {
    const key = `stock:reservation:payment:${paymentId}`;
    const raw = await this.redis.get(key);

    if (!raw) {
      return;
    }

    const reservations = JSON.parse(raw) as ReservationEntry[];

    for (const entry of reservations) {
      const reservedKey = `stock:reserved:sku:${entry.sku}`;
      const current = Number((await this.redis.get(reservedKey)) ?? 0);
      const next = Math.max(0, current - entry.quantity);

      if (next === 0) {
        await this.redis.del(reservedKey);
      } else {
        await this.redis.set(
          reservedKey,
          String(next),
          'EX',
          this.reservationTtlSec,
        );
      }
    }

    await this.redis.del(key);
  }

  async consumeInventoryReservation(
    paymentId: string,
    manager: EntityManager,
  ): Promise<void> {
    const key = `stock:reservation:payment:${paymentId}`;
    const raw = await this.redis.get(key);

    if (!raw) {
      throw new BadRequestException(
        'Inventory reservation not found or expired for this payment.',
      );
    }

    let reservations = JSON.parse(raw) as ReservationEntry[];

    if (!reservations.length) {
      reservations = await this.buildReservationsFromOrderItems(
        paymentId,
        manager,
      );
    }

    if (!reservations.length) {
      throw new BadRequestException(
        'No reservable SKU found for this payment order.',
      );
    }

    for (const entry of reservations) {
      const variantResult = await manager.query(
        `UPDATE inventory_stock inv
         SET stock = stock - $1, updated_at = NOW()
         FROM product_variants pv
         WHERE pv.id = inv.variant_id
           AND pv.sku = $2
           AND inv.stock >= $1
         RETURNING pv.product_id`,
        [entry.quantity, entry.sku],
      );

      if (this.hasAffectedRows(variantResult)) {
        await this.decrementProductStockSnapshot(entry, manager, false);
        continue;
      }

      const productResult = await this.decrementProductStockSnapshot(
        entry,
        manager,
        true,
      );
      if (!this.hasAffectedRows(productResult)) {
        throw new BadRequestException(
          `کاهش موجودی برای SKU ${entry.sku} ناموفق بود.`,
        );
      }
    }
  }

  private async buildReservationsFromOrderItems(
    paymentId: string,
    manager: EntityManager,
  ): Promise<ReservationEntry[]> {
    const rows = await manager.query(
      `SELECT
         oi.product_id,
         oi.variant_sku,
         SUM(oi.quantity)::int AS quantity
       FROM payments p
       INNER JOIN order_items oi ON oi.order_id = p.order_id
       WHERE p.id = $1
         AND oi.variant_sku IS NOT NULL
         AND TRIM(oi.variant_sku) <> ''
       GROUP BY oi.product_id, oi.variant_sku`,
      [paymentId],
    );

    if (!Array.isArray(rows) || rows.length === 0) {
      return [];
    }

    return rows
      .map(
        (row: {
          product_id?: unknown;
          variant_sku?: unknown;
          quantity?: unknown;
        }) => ({
          productId: typeof row.product_id === 'string' ? row.product_id : null,
          sku:
            typeof row.variant_sku === 'string' ? row.variant_sku.trim() : '',
          quantity: Number(row.quantity ?? 0),
        }),
      )
      .filter((entry) => entry.sku.length > 0 && entry.quantity > 0);
  }

  private async getVariantStockBySku(sku: string): Promise<number | null> {
    const rows = await this.dataSource.query(
      `SELECT inv.stock
       FROM inventory_stock inv
       INNER JOIN product_variants pv ON pv.id = inv.variant_id
       WHERE pv.sku = $1
       LIMIT 1`,
      [sku],
    );

    if (!rows?.length) {
      return null;
    }

    return Number(rows[0].stock ?? 0);
  }

  private async getProductStockById(productId: string): Promise<number | null> {
    const rows = await this.dataSource.query(
      `SELECT stock_quantity
       FROM products
       WHERE id = $1
       LIMIT 1`,
      [productId],
    );

    if (!rows?.length) {
      return null;
    }

    return Number(rows[0].stock_quantity ?? 0);
  }

  private async decrementProductStockSnapshot(
    entry: ReservationEntry,
    manager: EntityManager,
    requireAvailableStock: boolean,
  ): Promise<unknown> {
    if (entry.productId) {
      return manager.query(
        `UPDATE products
         SET stock_quantity = ${
           requireAvailableStock
             ? 'stock_quantity - $1'
             : 'GREATEST(stock_quantity - $1, 0)'
         },
             updated_at = NOW()
         WHERE id = $2
           ${requireAvailableStock ? 'AND stock_quantity >= $1' : ''}
         RETURNING id`,
        [entry.quantity, entry.productId],
      );
    }

    return manager.query(
      `UPDATE products p
       SET stock_quantity = GREATEST(p.stock_quantity - $1, 0),
           updated_at = NOW()
       FROM product_variants pv
       WHERE pv.product_id = p.id
         AND pv.sku = $2
       RETURNING p.id`,
      [entry.quantity, entry.sku],
    );
  }

  private hasAffectedRows(result: unknown): boolean {
    if (Array.isArray(result)) {
      return result.length > 0;
    }

    if (result && typeof result === 'object' && 'rowCount' in result) {
      return Number((result as any).rowCount) > 0;
    }

    return false;
  }
}
