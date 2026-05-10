// backend/src/domains/users/addresses.repository.ts

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Address } from './entities/address.entity';
import { CreateAddressDto } from './dto/create-address.dto';

@Injectable()
export class AddressesRepository {
  constructor(
    @InjectRepository(Address)
    private readonly addressRepo: Repository<Address>,
  ) {}

  async findByUserId(userId: string): Promise<Address[]> {
    return this.addressRepo.find({
      where: { user_id: userId },
      order: { is_default: 'DESC', created_at: 'DESC' },
    });
  }

  async findById(id: string, userId: string): Promise<Address | null> {
    return this.addressRepo.findOne({
      where: { id, user_id: userId },
    });
  }

  async create(userId: string, dto: CreateAddressDto): Promise<Address> {
    // If this is set as default, unset other defaults
    if (dto.is_default) {
      await this.addressRepo.update(
        { user_id: userId, is_default: true },
        { is_default: false },
      );
    }

    const address = this.addressRepo.create({
      user_id: userId,
      full_name: dto.full_name,
      phone: dto.phone,
      province: dto.province,
      city: dto.city,
      address: dto.address,
      postal_code: dto.postal_code || null,
      is_default: dto.is_default || false,
    });

    return this.addressRepo.save(address);
  }

  async update(
    id: string,
    userId: string,
    dto: Partial<CreateAddressDto>,
  ): Promise<Address | null> {
    const address = await this.findById(id, userId);
    if (!address) return null;

    // If setting as default, unset other defaults
    if (dto.is_default) {
      await this.addressRepo.update(
        { user_id: userId, is_default: true },
        { is_default: false },
      );
    }

    Object.assign(address, dto);
    return this.addressRepo.save(address);
  }

  async delete(id: string, userId: string): Promise<boolean> {
    const result = await this.addressRepo.delete({ id, user_id: userId });
    return (result.affected ?? 0) > 0;
  }

  async setDefault(id: string, userId: string): Promise<Address | null> {
    const address = await this.findById(id, userId);
    if (!address) return null;

    // Unset all other defaults
    await this.addressRepo.update(
      { user_id: userId, is_default: true },
      { is_default: false },
    );

    address.is_default = true;
    return this.addressRepo.save(address);
  }
}
