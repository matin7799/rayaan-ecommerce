// backend/src/domains/users/addresses.controller.ts

import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
  NotFoundException,
} from '@nestjs/common';
import { Auth } from '../../common/decorators/auth.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AddressesRepository } from './addresses.repository';
import { CreateAddressDto } from './dto/create-address.dto';

@Auth()
@Controller('addresses')
export class AddressesController {
  constructor(private readonly addressesRepo: AddressesRepository) {}

  @Get()
  async getMyAddresses(@CurrentUser('id') userId: string) {
    return this.addressesRepo.findByUserId(userId);
  }

  @Get(':id')
  async getAddressById(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('id') userId: string,
  ) {
    const address = await this.addressesRepo.findById(id, userId);
    if (!address) {
      throw new NotFoundException('آدرس یافت نشد');
    }
    return address;
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createAddress(
    @CurrentUser('id') userId: string,
    @Body() dto: CreateAddressDto,
  ) {
    return this.addressesRepo.create(userId, dto);
  }

  @Patch(':id')
  async updateAddress(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('id') userId: string,
    @Body() dto: Partial<CreateAddressDto>,
  ) {
    const address = await this.addressesRepo.update(id, userId, dto);
    if (!address) {
      throw new NotFoundException('آدرس یافت نشد');
    }
    return address;
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteAddress(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('id') userId: string,
  ) {
    const deleted = await this.addressesRepo.delete(id, userId);
    if (!deleted) {
      throw new NotFoundException('آدرس یافت نشد');
    }
  }

  @Patch(':id/set-default')
  async setDefaultAddress(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('id') userId: string,
  ) {
    const address = await this.addressesRepo.setDefault(id, userId);
    if (!address) {
      throw new NotFoundException('آدرس یافت نشد');
    }
    return address;
  }
}
