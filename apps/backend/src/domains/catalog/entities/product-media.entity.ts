import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { Product } from './product.entity';
import { Media } from '../../media/entities/media.entity';

@Entity('product_media')
@Unique('UQ_product_media_product_media', ['productId', 'mediaId'])
export class ProductMedia {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index('IDX_product_media_product_id')
  @Column({ type: 'uuid', name: 'product_id' })
  productId!: string;

  @Index('IDX_product_media_media_id')
  @Column({ type: 'uuid', name: 'media_id' })
  mediaId!: string;

  @Column({ type: 'int', default: 0 })
  order!: number;

  @Column({ type: 'varchar', nullable: true })
  alt!: string | null;

  @Column({ type: 'varchar', nullable: true })
  caption!: string | null;

  @ManyToOne(() => Product, (product) => product.productMedia, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'product_id' })
  product!: Product;

  @ManyToOne(() => Media, (media) => media.productMedia, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'media_id' })
  media!: Media;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
