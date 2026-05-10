// backend/src/domains/catalog/categories.service.ts

import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { CategoriesRepository } from '../categories.repository';
import { CreateCategoryDto } from '../dto/create-category.dto';
import { UpdateCategoryDto } from '../dto/update-category.dto';
import { Category } from '../entities/category.entity';

@Injectable()
export class CategoriesService {
  constructor(private readonly categoriesRepo: CategoriesRepository) {}

  // ساخت دسته‌بندی جدید
  async create(dto: CreateCategoryDto): Promise<Category> {
    // بررسی تکراری نبودن اسلاگ
    const slugExists = await this.categoriesRepo.existsBySlug(dto.slug);
    if (slugExists) {
      throw new ConflictException(`اسلاگ «${dto.slug}» قبلاً استفاده شده است`);
    }

    // اگر parent_id داده شده، مطمئن شو والد وجود دارد
    if (dto.parent_id) {
      const parent = await this.categoriesRepo.findById(dto.parent_id);
      if (!parent) {
        throw new BadRequestException('دسته‌بندی والد یافت نشد');
      }
    }

    const parent = dto.parent_id
      ? await this.categoriesRepo.findById(dto.parent_id)
      : null;

    const category = this.categoriesRepo.create({
      name: dto.name,
      slug: dto.slug,
      parent,
    });

    return this.categoriesRepo.save(category);
  }

  // دریافت همه دسته‌بندی‌ها به صورت درختی (فقط ریشه‌ها با فرزندان)
  async findTree(): Promise<Category[]> {
    return this.categoriesRepo.findRoots();
  }

  // دریافت لیست ساده همه دسته‌بندی‌ها
  async findAll(): Promise<Category[]> {
    return this.categoriesRepo.findAll();
  }

  // دریافت یک دسته‌بندی با آیدی
  async findOne(id: string): Promise<Category> {
    const category = await this.categoriesRepo.findById(id);
    if (!category) {
      throw new NotFoundException('دسته‌بندی یافت نشد');
    }
    return category;
  }

  // دریافت یک دسته‌بندی با اسلاگ (برای فرانت‌اند)
  async findBySlug(slug: string): Promise<Category> {
    const category = await this.categoriesRepo.findBySlug(slug);
    if (!category) {
      throw new NotFoundException('دسته‌بندی یافت نشد');
    }
    return category;
  }

  // ویرایش دسته‌بندی
  async update(id: string, dto: UpdateCategoryDto): Promise<Category> {
    const category = await this.findOne(id);

    // اگر اسلاگ تغییر کرده، بررسی تکراری نبودن
    if (dto.slug && dto.slug !== category.slug) {
      const slugExists = await this.categoriesRepo.existsBySlug(dto.slug);
      if (slugExists) {
        throw new ConflictException(
          `اسلاگ «${dto.slug}» قبلاً استفاده شده است`,
        );
      }
    }

    // جلوگیری از اینکه یک دسته والد خودش بشه
    if (dto.parent_id && dto.parent_id === id) {
      throw new BadRequestException('یک دسته‌بندی نمی‌تواند والد خودش باشد');
    }

    // اگر parent_id جدید داده شده، بررسی وجود والد
    if (dto.parent_id) {
      const parent = await this.categoriesRepo.findById(dto.parent_id);
      if (!parent) {
        throw new BadRequestException('دسته‌بندی والد یافت نشد');
      }
    }

    const parent = dto.parent_id
      ? await this.categoriesRepo.findById(dto.parent_id)
      : category.parent;

    if (dto.name !== undefined) category.name = dto.name;
    if (dto.slug !== undefined) category.slug = dto.slug;
    category.parent = parent;

    return this.categoriesRepo.save(category);
  }

  // حذف دسته‌بندی
  async remove(id: string): Promise<void> {
    const category = await this.categoriesRepo.findById(id);
    if (!category) {
      throw new NotFoundException('دسته‌بندی یافت نشد');
    }

    // اگر فرزند دارد، اجازه حذف نده (حفاظت از یکپارچگی داده)
    if (category.children && category.children.length > 0) {
      throw new BadRequestException(
        'این دسته‌بندی دارای زیرمجموعه است. ابتدا زیرمجموعه‌ها را حذف یا جابجا کنید',
      );
    }

    await this.categoriesRepo.remove(category);
  }
}
