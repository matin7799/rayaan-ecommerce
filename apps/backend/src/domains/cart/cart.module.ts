// apps/backend/src/domains/cart/cart.module.ts

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CatalogModule } from '../catalog/catalog.module';
import { CartRepository } from './cart.repository';
import { CartService } from './cart.service';
import { CartController } from './cart.controller';
import { CartSnapshot } from './entities/cart-snapshot.entity';
import { MediaModule } from '../media/media.module';
import { CartLockService } from './cart-lock.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([CartSnapshot]),
    CatalogModule,
    MediaModule,
  ],
  controllers: [CartController],
  providers: [CartService, CartRepository, CartLockService],
  exports: [CartService, CartLockService],
})
export class CartModule {}
