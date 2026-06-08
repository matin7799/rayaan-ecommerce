// apps/backend/src/domains/users/users.controller.ts

import {
  Controller,
  Get,
  Patch,
  Body,
  Param,
  ParseUUIDPipe,
  Query,
  DefaultValuePipe,
  ParseIntPipe,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { Auth } from '../../common/decorators/auth.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../auth/enums/role.enum';
import { UpdateUserPartnerDto } from './dto/update-user-partner.dto';

@Auth()
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  getProfile(@CurrentUser('id') userId: string) {
    return this.usersService.getProfile(userId);
  }

  @Patch('me')
  updateProfile(
    @CurrentUser('id') userId: string,
    @Body() dto: UpdateProfileDto,
  ) {
    return this.usersService.updateProfile(userId, dto);
  }

  @Get('admin')
  @Get('admin/all')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  getAllForAdmin(
    @Query('limit', new DefaultValuePipe(100), ParseIntPipe) limit: number,
  ) {
    return this.usersService.getAllForAdmin(limit);
  }

  @Patch('admin/:id/theme-partner')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  updateThemePartner(
    @Param('id', ParseUUIDPipe) userId: string,
    @Body() dto: UpdateUserPartnerDto,
  ) {
    return this.usersService.updatePartnerRole(userId, dto.isPartner);
  }
}
