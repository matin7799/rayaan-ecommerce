// backend/src/domains/shipping/shipping.module.ts

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ShippingMethod } from './entities/shipping-method.entity';
import { ShippingRepository } from './shipping.repository';
import { ShippingController } from './shipping.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ShippingMethod])],
  controllers: [ShippingController],
  providers: [ShippingRepository],
  exports: [ShippingRepository],
})
export class ShippingModule {}
