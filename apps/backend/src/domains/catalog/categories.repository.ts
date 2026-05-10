// backend/src/domains/catalog/categories.repository.ts

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull, DataSource } from 'typeorm';
import { Category } from './entities/category.entity';
import { ProductAttribute } from './entities/product-attribute.entity';
import { ProductOption } from './entities/product-option.entity';

@Injectable()
export class CategoriesRepository {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepo: Repository<Category>,
    private readonly dataSource: DataSource,
  ) {}

  // ساخت دسته‌بندی جدید
  create(data: Partial<Category>): Category {
    return this.categoryRepo.create(data);
  }

  // ذخیره در دیتابیس
  async save(category: Category): Promise<Category> {
    return this.categoryRepo.save(category);
  }

  // دریافت همه دسته‌بندی‌ها به صورت درختی (فقط ریشه‌ها + فرزندان)
  async findRoots(): Promise<Category[]> {
    return this.categoryRepo.find({
      where: { parent: IsNull() },
      relations: ['children'],
      order: { name: 'ASC' },
    });
  }

  // دریافت همه دسته‌بندی‌ها (لیست ساده)
  async findAll(): Promise<Category[]> {
    return this.categoryRepo.find({
      relations: ['children', 'parent'],
      order: { name: 'ASC' },
    });
  }

  // پیدا کردن با آیدی + بارگذاری فرزندان
  async findById(id: string): Promise<Category | null> {
    return this.categoryRepo.findOne({
      where: { id },
      relations: ['children', 'parent'],
    });
  }

  // پیدا کردن با اسلاگ
  async findBySlug(slug: string): Promise<Category | null> {
    return this.categoryRepo.findOne({
      where: { slug },
      relations: ['children', 'parent'],
    });
  }

  // بررسی وجود اسلاگ تکراری
  async existsBySlug(slug: string): Promise<boolean> {
    const count = await this.categoryRepo.count({ where: { slug } });
    return count > 0;
  }

  // حذف دسته‌بندی
  async remove(category: Category): Promise<void> {
    await this.categoryRepo.remove(category);
  }

  async replaceProductAttributes(
    productId: string,
    attributes: { key: string; value: string }[],
  ): Promise<void> {
    await this.dataSource.transaction(async (manager) => {
      // حذف همه attributes قبلی این محصول
      await manager.delete(ProductAttribute, { product_id: productId });

      // درج attributes جدید
      if (attributes.length > 0) {
        const newAttributes = attributes.map((attr) =>
          manager.create(ProductAttribute, {
            product_id: productId,
            key: attr.key,
            value: attr.value,
          }),
        );
        await manager.save(ProductAttribute, newAttributes);
      }
    });
  }

  /**
   * جایگزینی کامل options یک محصول
   * نکته مهم: حذف options قدیمی ممکنه روی سبدهای خرید فعال تأثیر بذاره
   * در فاز بعدی (Orders) باید snapshot قیمت در لحظه سفارش ذخیره بشه
   */
  async replaceProductOptions(
    productId: string,
    options: { option_name: string; price_modifier: number }[],
  ): Promise<void> {
    await this.dataSource.transaction(async (manager) => {
      // حذف همه options قبلی این محصول
      await manager.delete(ProductOption, { product_id: productId });

      // درج options جدید
      if (options.length > 0) {
        const newOptions = options.map((opt) =>
          manager.create(ProductOption, {
            product_id: productId,
            option_name: opt.option_name,
            price_modifier: opt.price_modifier,
          }),
        );
        await manager.save(ProductOption, newOptions);
      }
    });
  }
}
