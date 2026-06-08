// product.entity.ts
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Brand } from './brand.entity';
import { Category } from './category.entity';
import { ProductVariant } from './product-variant.entity';
import { ProductAttribute } from './product-attribute.entity';
import { ProductOption } from './product-option.entity';
import { Tag } from './tag.entity';
import { ProductMedia } from './product-media.entity';

@Entity('products')
@Index(['slug'], { unique: true })
@Index(['sku'], { unique: true })
@Index(['isActive', 'isOnSale'])
@Index(['brandId'])
@Index(['name'])
@Index(['createdAt'])
@Index(['isActive', 'createdAt'])
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 255, name: 'title' })
  name!: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  slug!: string;

  @Column({ type: 'varchar', length: 6, unique: true })
  sku!: string;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Column({ type: 'text', nullable: true, name: 'short_description' })
  shortDescription!: string | null;

  @Column({
    type: 'bigint',
    name: 'base_price',
    select: false,
  })
  basePrice!: number;

  @Column({
    type: 'bigint',
    nullable: true,
    name: 'sale_price',
    select: false,
  })
  salePrice!: number | null;

  @Column({
    type: 'decimal',
    precision: 5,
    scale: 2,
    default: 0,
    name: 'partner_discount_percent',
    select: false,
  })
  partnerDiscountPercent!: number;

  @Column({
    type: 'boolean',
    default: false,
    name: 'is_on_sale',
    select: false,
  })
  isOnSale!: boolean;

  @Column({
    type: 'timestamp',
    nullable: true,
    name: 'sale_start_date',
    select: false,
  })
  saleStartDate!: Date | null;

  @Column({
    type: 'timestamp',
    nullable: true,
    name: 'sale_end_date',
    select: false,
  })
  saleEndDate!: Date | null;

  @Column({ type: 'int', default: 0, name: 'stock_quantity', select: false })
  stockQuantity!: number;

  @Column({
    type: 'boolean',
    default: true,
    name: 'track_inventory',
    select: false,
  })
  trackInventory!: boolean;

  @Column({
    type: 'int',
    default: 5,
    name: 'low_stock_threshold',
    select: false,
  })
  lowStockThreshold!: number;

  @Column({ type: 'varchar', length: 255, nullable: true, name: 'meta_title' })
  metaTitle!: string | null;

  @Column({ type: 'text', nullable: true, name: 'meta_description' })
  metaDescription!: string | null;

  @Column({ type: 'text', nullable: true, name: 'meta_keywords' })
  metaKeywords!: string | null;

  @Column({
    type: 'varchar',
    length: 500,
    nullable: true,
    name: 'featured_image',
  })
  featuredImage!: string | null;

  @Column({ type: 'boolean', default: true, name: 'is_active' })
  isActive!: boolean;

  @Column({ type: 'boolean', default: false, name: 'is_featured' })
  isFeatured!: boolean;

  @Column({ type: 'uuid', nullable: true, name: 'brand_id' })
  brandId!: string | null;

  @ManyToOne(() => Brand, (brand) => brand.products, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'brand_id' })
  brand!: Brand | null;

  @ManyToMany(() => Category, (category) => category.products)
  @JoinTable({
    name: 'product_categories',
    joinColumn: { name: 'product_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'category_id', referencedColumnName: 'id' },
  })
  categories!: Category[];

  @ManyToMany(() => Tag, (tag) => tag.products)
  @JoinTable({
    name: 'product_tags',
    joinColumn: { name: 'product_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'tag_id', referencedColumnName: 'id' },
  })
  tags!: Tag[];

  @OneToMany(() => ProductMedia, (productMedia) => productMedia.product, {
    cascade: true,
  })
  productMedia!: ProductMedia[];

  @OneToMany(() => ProductVariant, (variant) => variant.product)
  variants!: ProductVariant[];

  @OneToMany(() => ProductAttribute, (attribute) => attribute.product, {
    cascade: true,
  })
  attributes!: ProductAttribute[];

  @OneToMany(() => ProductOption, (option) => option.product, {
    cascade: true,
  })
  options!: ProductOption[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
