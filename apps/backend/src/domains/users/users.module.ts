// apps/backend/src/domains/users/users.module.ts

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Address } from './entities/address.entity';
import { UsersRepository } from './users.repository';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { AddressesRepository } from './addresses.repository';
import { AddressesController } from './addresses.controller';

@Module({
  imports: [TypeOrmModule.forFeature([User, Address])],
  controllers: [UsersController, AddressesController],
  providers: [UsersRepository, UsersService, AddressesRepository],
  exports: [UsersRepository, UsersService, AddressesRepository],
})
export class UsersModule {}
