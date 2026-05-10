// apps/backend/src/domains/users/entities/user.entity.ts

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

import { Role } from '../../auth/enums/role.enum';

// وضعیت کاربر
export enum UserStatus {
  ACTIVE = 'active',
  BLOCKED = 'blocked',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  // شماره موبایل - یکتا و اجباری
  @Column({ type: 'varchar', length: 11, unique: true })
  @Index()
  phone!: string;

  // ایمیل - یکتا و اختیاری
  @Column({ type: 'varchar', length: 255, unique: true, nullable: true })
  @Index()
  email!: string | null;

  // رمز عبور هش‌شده
  @Column({
    type: 'varchar',
    length: 255,
    name: 'password_hash',
  })
  password!: string;

  // نام
  @Column({ type: 'varchar', length: 50, name: 'first_name' })
  firstName!: string;

  // نام خانوادگی
  @Column({ type: 'varchar', length: 50, name: 'last_name' })
  lastName!: string;

  // وضعیت کاربر
  @Column({
    type: 'enum',
    enum: UserStatus,
    default: UserStatus.ACTIVE,
  })
  status!: UserStatus;

  // نقش کاربر
  @Column({
    type: 'enum',
    enum: Role,
    default: Role.CUSTOMER,
  })
  role!: Role;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
