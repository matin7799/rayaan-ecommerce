// backend/src/domains/shipping/shipping.repository.ts

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ShippingMethod } from './entities/shipping-method.entity';
import { CreateShippingMethodDto } from './dto/create-shipping-method.dto';

@Injectable()
export class ShippingRepository {
  constructor(
    @InjectRepository(ShippingMethod)
    private readonly shippingRepo: Repository<ShippingMethod>,
  ) {}

  async findAll(): Promise<ShippingMethod[]> {
    return this.shippingRepo.find({
      where: { is_active: true },
      order: { sort_order: 'ASC', name: 'ASC' },
    });
  }

  async findAllForAdmin(): Promise<ShippingMethod[]> {
    return this.shippingRepo.find({
      order: { sort_order: 'ASC', name: 'ASC' },
    });
  }

  async findById(id: string): Promise<ShippingMethod | null> {
    return this.shippingRepo.findOne({
      where: { id },
    });
  }

  async create(dto: CreateShippingMethodDto): Promise<ShippingMethod> {
    const shippingMethod = this.shippingRepo.create({
      name: dto.name,
      description: dto.description || null,
      cost: dto.cost,
      estimated_days: dto.estimated_days || null,
      is_active: dto.is_active ?? true,
      sort_order: dto.sort_order ?? 0,
    });

    return this.shippingRepo.save(shippingMethod);
  }

  async update(
    id: string,
    dto: Partial<CreateShippingMethodDto>,
  ): Promise<ShippingMethod | null> {
    const shippingMethod = await this.findById(id);
    if (!shippingMethod) return null;

    Object.assign(shippingMethod, dto);
    return this.shippingRepo.save(shippingMethod);
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.shippingRepo.delete({ id });
    return (result.affected ?? 0) > 0;
  }
}
