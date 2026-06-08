// apps/backend/src/domains/orders/orders.module.ts

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { OrdersRepository } from './orders.repository';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { OrderCancelRequest } from './entities/order-cancel-request.entity';
import { CatalogModule } from '../catalog/catalog.module';
import { CartModule } from '../cart/cart.module';
import { UsersModule } from '../users/users.module';
import { ShippingModule } from '../shipping/shipping.module';
import { OrderCancelService } from './order-cancel.service';
import { DigipayModule } from '../payments/providers/digipay/digipay.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, OrderItem, OrderCancelRequest]),
    CatalogModule,
    CartModule,
    UsersModule,
    ShippingModule,
    DigipayModule,
  ],
  controllers: [OrdersController],
  providers: [OrdersService, OrdersRepository, OrderCancelService],
  exports: [OrdersService, OrderCancelService],
})
export class OrdersModule {}
