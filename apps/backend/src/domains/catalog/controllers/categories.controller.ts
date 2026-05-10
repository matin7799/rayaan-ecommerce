// backend/src/domains/catalog/categories.controller.ts

import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  ParseUUIDPipe,
  UseGuards,
} from '@nestjs/common';
import { Roles } from '../../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Role } from '../../auth/enums/role.enum';
import { CreateCategoryDto } from '../dto/create-category.dto';
import { UpdateCategoryDto } from '../dto/update-category.dto';
import { CategoriesService } from '../services/categories.service';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  // ===== روت‌های عمومی (بدون احراز هویت) =====

  // دریافت درخت دسته‌بندی‌ها (برای منوی فرانت‌اند)
  @Get('tree')
  async getTree() {
    const data = await this.categoriesService.findTree();
    return { message: 'درخت دسته‌بندی‌ها', data };
  }

  // دریافت لیست ساده همه دسته‌بندی‌ها

  // دریافت دسته‌بندی با اسلاگ (برای صفحه دسته‌بندی در فرانت)
  @Get('slug/:slug')
  async findBySlug(@Param('slug') slug: string) {
    const data = await this.categoriesService.findBySlug(slug);
    return { message: 'دسته‌بندی', data };
  }

  @Get()
  async findAll() {
    const data = await this.categoriesService.findTree();
    return { message: 'لیست دسته‌بندی‌ها', data };
  }

  // دریافت دسته‌بندی با آیدی
  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    const data = await this.categoriesService.findOne(id);
    return { message: 'دسته‌بندی', data };
  }

  // ===== روت‌های ادمین (نیاز به احراز هویت + نقش ADMIN) =====

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async create(@Body() dto: CreateCategoryDto) {
    const data = await this.categoriesService.create(dto);
    return { message: 'دسته‌بندی با موفقیت ساخته شد', data };
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCategoryDto,
  ) {
    const data = await this.categoriesService.update(id, dto);
    return { message: 'دسته‌بندی با موفقیت ویرایش شد', data };
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.categoriesService.remove(id);
    return { message: 'دسته‌بندی با موفقیت حذف شد' };
  }
}
