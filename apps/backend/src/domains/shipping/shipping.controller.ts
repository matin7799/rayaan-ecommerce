// backend/src/domains/shipping/shipping.controller.ts

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
import { ShippingRepository } from './shipping.repository';
import { CreateShippingMethodDto } from './dto/create-shipping-method.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { Auth } from '../../common/decorators/auth.decorator';
import { Role } from '../auth/enums/role.enum';

@Controller('shipping-methods')
export class ShippingController {
  constructor(private readonly shippingRepo: ShippingRepository) {}

  // Public endpoint - get active shipping methods
  @Get()
  async getShippingMethods() {
    return this.shippingRepo.findAll();
  }

  // Admin endpoints
  @Get('admin/all')
  @Auth()
  @Roles(Role.ADMIN)
  getAllForAdmin() {
    return this.shippingRepo.findAllForAdmin();
  }

  @Post()
  @Auth()
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  createShippingMethod(@Body() dto: CreateShippingMethodDto) {
    return this.shippingRepo.create(dto);
  }

  @Patch(':id')
  @Auth()
  @Roles(Role.ADMIN)
  async updateShippingMethod(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: Partial<CreateShippingMethodDto>,
  ) {
    const updated = await this.shippingRepo.update(id, dto);
    if (!updated) {
      throw new NotFoundException('روش ارسال یافت نشد');
    }
    return updated;
  }

  @Delete(':id')
  @Auth()
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteShippingMethod(@Param('id', ParseUUIDPipe) id: string) {
    const deleted = await this.shippingRepo.delete(id);
    if (!deleted) {
      throw new NotFoundException('روش ارسال یافت نشد');
    }
  }
}
