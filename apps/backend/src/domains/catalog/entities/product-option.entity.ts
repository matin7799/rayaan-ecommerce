// backend/src/domains/catalog/entities/product-option.entity.ts

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Product } from './product.entity';

// آپشن‌های قیمت‌ساز - مثل گارانتی طلایی، بسته‌بندی ویژه
// این‌ها مبلغی را به قیمت پایه اضافه یا کم می‌کنند
@Entity('product_options')
export class ProductOption {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  product_id!: string;

  // نام آپشن - مثلاً "گارانتی طلایی"
  @Column({ type: 'varchar' })
  option_name!: string;

  // مبلغ تغییر قیمت - مثبت: افزایش / منفی: کاهش
  @Column({ type: 'bigint' })
  price_modifier!: number;

  @ManyToOne(() => Product, (product) => product.options, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'product_id' })
  product!: Product;
}
