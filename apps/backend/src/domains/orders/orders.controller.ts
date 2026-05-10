// apps/backend/src/domains/orders/orders.controller.ts

import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Query,
  Body,
  Req,
  Res,
  ParseUUIDPipe,
  ParseIntPipe,
  DefaultValuePipe,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import type { Request, Response } from 'express';
import { OrdersService } from './orders.service';
import { Auth } from '../../common/decorators/auth.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { OrderStatus } from './entities/order.entity';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { CreateOrderDto } from './dto/create-order.dto';
import { Role } from '../auth/enums/role.enum';
import { CreateOrderCancelRequestDto } from './dto/create-order-cancel-request.dto';
import { ReviewOrderCancelRequestDto } from './dto/review-order-cancel-request.dto';
import { refreshTorobAttribution } from '../../common/utils/torob-attribution.util';

@Auth()
@UseGuards(ThrottlerGuard)
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @HttpCode(HttpStatus.CREATED)
  create(
    @CurrentUser('id') userId: string,
    @Body() dto: CreateOrderDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    refreshTorobAttribution(req, res);
    return this.ordersService.checkout(userId, dto, req);
  }

  @Get()
  getMyOrders(@CurrentUser('id') userId: string) {
    return this.ordersService.findByUserId(userId);
  }

  @Get(':id')
  getOrderById(
    @Param('id', ParseUUIDPipe) orderId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.ordersService.findById(orderId, userId);
  }

  @Patch(':id/cancel')
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  cancelOrder(
    @Param('id', ParseUUIDPipe) orderId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.ordersService.cancelOrder(orderId, userId);
  }

  @Post(':id/cancel-request')
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  requestCancelOrder(
    @Param('id', ParseUUIDPipe) orderId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: CreateOrderCancelRequestDto,
  ) {
    return this.ordersService.requestCancelOrder(orderId, userId, dto.reason);
  }

  @Get(':id/cancel-request')
  getOrderCancelRequest(
    @Param('id', ParseUUIDPipe) orderId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.ordersService.getCancelRequestForOrder(orderId, userId);
  }

  @Get('admin/all')
  @Roles(Role.ADMIN)
  getAllForAdmin(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
    @Query('status') status?: string,
  ) {
    const validStatus =
      status && Object.values(OrderStatus).includes(status as OrderStatus)
        ? (status as OrderStatus)
        : undefined;

    return this.ordersService.findAll({ page, limit, status: validStatus });
  }

  @Patch('admin/:id/status')
  @Roles(Role.ADMIN)
  @Throttle({ default: { limit: 30, ttl: 60000 } })
  updateStatus(
    @Param('id', ParseUUIDPipe) orderId: string,
    @Body() dto: UpdateOrderStatusDto,
  ) {
    return this.ordersService.updateStatus(orderId, dto.status);
  }

  @Get('admin/cancel-requests/all')
  @Roles(Role.ADMIN)
  getAllCancelRequestsForAdmin() {
    return this.ordersService.getAllCancelRequests();
  }

  @Patch('admin/cancel-requests/:id/review')
  @Roles(Role.ADMIN)
  @Throttle({ default: { limit: 30, ttl: 60000 } })
  reviewCancelRequest(
    @Param('id', ParseUUIDPipe) requestId: string,
    @Body() dto: ReviewOrderCancelRequestDto,
  ) {
    return this.ordersService.reviewCancelRequest(
      requestId,
      dto.status,
      dto.adminNote,
    );
  }
}
