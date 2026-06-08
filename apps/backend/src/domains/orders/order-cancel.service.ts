import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrdersRepository } from './orders.repository';
import { Order, OrderStatus } from './entities/order.entity';
import {
  OrderCancelRequest,
  OrderCancelRequestStatus,
} from './entities/order-cancel-request.entity';

@Injectable()
export class OrderCancelService {
  constructor(
    private readonly ordersRepository: OrdersRepository,
    @InjectRepository(OrderCancelRequest)
    private readonly cancelRequestRepo: Repository<OrderCancelRequest>,
  ) {}

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
    status:
      | OrderCancelRequestStatus.APPROVED
      | OrderCancelRequestStatus.REJECTED,
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
        await this.ordersRepository.updateStatus(
          order.id,
          OrderStatus.CANCELLED,
        );
      }
    }

    return request;
  }
}
