import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment } from './entities/payment.entity';
import { PaymentStatus } from './enums/payment-status.enum';

// ──────────────────────────────────────────────────────
// ریپازیتوری پرداخت — لایه دسترسی به دیتابیس
// ──────────────────────────────────────────────────────
@Injectable()
export class PaymentsRepository {
  constructor(
    @InjectRepository(Payment)
    private readonly repo: Repository<Payment>,
  ) {}

  create(data: Partial<Payment>): Payment {
    return this.repo.create(data);
  }

  async save(payment: Payment): Promise<Payment> {
    return this.repo.save(payment);
  }

  async findById(id: string): Promise<Payment | null> {
    return this.repo.findOne({ where: { id } });
  }

  async findByProviderTrackId(trackId: string): Promise<Payment | null> {
    return this.repo.findOne({
      where: { provider_track_id: trackId },
      relations: ['order'],
    });
  }

  async findByProviderRefId(refId: string): Promise<Payment | null> {
    return this.repo.findOne({
      where: { provider_ref_id: refId },
      relations: ['order'],
    });
  }

  async findPendingByOrderId(orderId: string): Promise<Payment | null> {
    return this.repo.findOne({
      where: {
        order_id: orderId,
        status: PaymentStatus.PENDING,
      },
      order: { created_at: 'DESC' },
    });
  }

  async findAllByOrderId(orderId: string): Promise<Payment[]> {
    return this.repo.find({
      where: { order_id: orderId },
      order: { created_at: 'DESC' },
    });
  }

  async findAllWithPagination(params: {
    page: number;
    limit: number;
    status?: PaymentStatus;
  }): Promise<{ data: Payment[]; total: number }> {
    const where = params.status ? { status: params.status } : {};

    const [data, total] = await this.repo.findAndCount({
      where,
      order: { created_at: 'DESC' },
      skip: (params.page - 1) * params.limit,
      take: params.limit,
    });

    return { data, total };
  }
}
