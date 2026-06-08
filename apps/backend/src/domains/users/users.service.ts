// apps/backend/src/domains/users/users.service.ts

import { Injectable, NotFoundException } from '@nestjs/common';
import { UsersRepository } from './users.repository';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { User } from './entities/user.entity';
import { Role } from '../auth/enums/role.enum';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async getProfile(userId: string): Promise<Omit<User, 'password'>> {
    const user = await this.usersRepository.findByIdSafe(userId);
    if (!user) {
      throw new NotFoundException('کاربر یافت نشد');
    }
    return user;
  }

  async updateProfile(
    userId: string,
    dto: UpdateProfileDto,
  ): Promise<Omit<User, 'password'>> {
    const user = await this.usersRepository.findById(userId);
    if (!user) {
      throw new NotFoundException('کاربر یافت نشد');
    }

    const updated = await this.usersRepository.update(userId, dto);
    if (!updated) {
      throw new NotFoundException('کاربر یافت نشد');
    }

    // حذف فیلد حساس از خروجی
    const { password: _, ...result } = updated;
    return result;
  }

  async getAllForAdmin(limit = 100): Promise<Omit<User, 'password'>[]> {
    return this.usersRepository.findAllForAdmin(limit);
  }

  async updatePartnerRole(
    userId: string,
    isPartner: boolean,
  ): Promise<Omit<User, 'password'>> {
    const user = await this.usersRepository.findByIdSafe(userId);
    if (!user) {
      throw new NotFoundException('کاربر یافت نشد');
    }

    // Keep elevated roles intact; partner toggle is only for regular users.
    if ([Role.ADMIN, Role.SUPER_ADMIN].includes(user.role)) {
      return user;
    }

    const nextRole = isPartner ? Role.PARTNER : Role.CUSTOMER;
    const updated = await this.usersRepository.updateRole(userId, nextRole);
    if (!updated) {
      throw new NotFoundException('کاربر یافت نشد');
    }

    return updated;
  }
}
