// apps/backend/src/domains/users/users.repository.ts

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { Role } from '../auth/enums/role.enum';

@Injectable()
export class UsersRepository {
  constructor(
    @InjectRepository(User)
    private readonly repo: Repository<User>,
  ) {}

  async findByPhone(phone: string): Promise<User | null> {
    return this.repo.findOne({ where: { phone } });
  }

  async findById(id: string): Promise<User | null> {
    return this.repo.findOne({ where: { id } });
  }

  // بدون فیلد حساس password
  async findByIdSafe(id: string): Promise<Omit<User, 'password'> | null> {
    return this.repo.findOne({
      where: { id },
      select: [
        'id',
        'phone',
        'email',
        'firstName',
        'lastName',
        'role',
        'status',
        'createdAt',
        'updatedAt',
      ],
    });
  }

  async create(data: Partial<User>): Promise<User> {
    const user = this.repo.create(data);
    return this.repo.save(user);
  }

  async update(id: string, data: Partial<User>): Promise<User | null> {
    await this.repo.update(id, data);
    return this.findById(id);
  }

  async findAllForAdmin(limit = 100): Promise<Omit<User, 'password'>[]> {
    return this.repo.find({
      select: [
        'id',
        'phone',
        'email',
        'firstName',
        'lastName',
        'role',
        'status',
        'createdAt',
        'updatedAt',
      ],
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  async updateRole(
    userId: string,
    role: Role,
  ): Promise<Omit<User, 'password'> | null> {
    await this.repo.update(userId, { role });
    return this.findByIdSafe(userId);
  }
}
