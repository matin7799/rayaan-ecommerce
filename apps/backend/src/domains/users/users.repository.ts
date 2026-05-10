// apps/backend/src/domains/users/users.repository.ts

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';

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
}
