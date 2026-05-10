// backend/src/domains/catalog/entities/product-attribute.entity.ts

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Product } from './product.entity';

// ویژگی‌های ثابت محصول - مثل رنگ، وزن، جنس
// این‌ها فقط اطلاعاتی هستند و روی قیمت تاثیر ندارند
@Entity('product_attributes')
export class ProductAttribute {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  product_id!: string;

  // کلید ویژگی - مثلاً "رنگ"
  @Column({ type: 'varchar' })
  key!: string;

  // مقدار ویژگی - مثلاً "قرمز"
  @Column({ type: 'varchar' })
  value!: string;

  @ManyToOne(() => Product, (product) => product.attributes, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'product_id' })
  product!: Product;
}
