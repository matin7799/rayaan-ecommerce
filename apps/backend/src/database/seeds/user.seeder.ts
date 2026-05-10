// apps/backend/src/database/seeds/user.seeder.ts

import { DataSource } from 'typeorm';
import { User, UserStatus } from '../../domains/users/entities/user.entity';
import { Role } from '../../domains/auth/enums/role.enum';
import * as bcrypt from 'bcrypt';

const userData = [
  {
    phone: '09139685946',
    email: 'admin@rayaantech.ir',
    password: 'Admin@123',
    firstName: 'مدیر',
    lastName: 'سیستم',
    partner_discount_percent: '',
    role: Role.ADMIN,
    status: UserStatus.ACTIVE,
  },
  {
    phone: '09134300926',
    email: 'customer1@example.com',
    password: 'Customer@123',
    firstName: 'علی',
    lastName: 'احمدی',
    role: Role.CUSTOMER,
    status: UserStatus.ACTIVE,
  },
  {
    phone: '09121234567',
    email: 'customer2@example.com',
    password: 'Customer@123',
    firstName: 'سارا',
    lastName: 'محمدی',
    role: Role.CUSTOMER,
    status: UserStatus.ACTIVE,
  },
  {
    phone: '09131234567',
    email: 'customer3@example.com',
    password: 'Customer@123',
    firstName: 'رضا',
    lastName: 'کریمی',
    role: Role.PARTNER,
    status: UserStatus.ACTIVE,
  },
];

export async function seedUsers(dataSource: DataSource): Promise<void> {
  const userRepo = dataSource.getRepository(User);

  console.log('🌱 Seeding users...');

  for (const data of userData) {
    const existing = await userRepo.findOne({
      where: { phone: data.phone },
    });

    if (!existing) {
      const passwordHash = await bcrypt.hash(data.password, 10);

      const user = userRepo.create({
        phone: data.phone,
        email: data.email,
        password: passwordHash,
        firstName: data.firstName,
        lastName: data.lastName,
        role: data.role,
        status: data.status,
      });

      await userRepo.save(user);
      console.log(
        `  ✓ Created user: ${user.firstName} ${user.lastName} (${user.phone}) - ${user.role}`,
      );
    } else {
      console.log(`  ⊙ User already exists: ${data.phone}`);
    }
  }

  console.log('✅ Users seeded successfully!\n');
}
