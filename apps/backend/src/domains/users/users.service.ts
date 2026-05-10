// apps/backend/src/domains/users/users.service.ts

import { Injectable, NotFoundException } from '@nestjs/common';
import { UsersRepository } from './users.repository';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { User } from './entities/user.entity';

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
}
