import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { InventoryStock } from './inventory-stock.entity';
import { Product } from './product.entity';
import { ProductVariantOption } from './product-variant-option.entity';

@Entity('product_variants')
export class ProductVariant {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', name: 'product_id' })
  productId!: string;

  @ManyToOne(() => Product, (product) => product.variants, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'product_id' })
  product!: Product;

  @Column({ type: 'varchar', length: 255, unique: true })
  sku!: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  title!: string | null;

  @Column({ type: 'bigint' })
  price!: number;

  @Column({
    type: 'bigint',
    nullable: true,
    name: 'compare_price',
  })
  comparePrice!: number | null;

  @OneToMany(() => ProductVariantOption, (option) => option.variant, {
    cascade: true,
  })
  options!: ProductVariantOption[];

  @OneToOne(() => InventoryStock, (stock) => stock.variant, {
    cascade: true,
  })
  inventory!: InventoryStock;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
