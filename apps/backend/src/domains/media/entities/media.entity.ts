// apps/backend/src/domains/media/entities/media.entity.ts

import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ProductMedia } from '../../catalog/entities/product-media.entity';

export enum MediaType {
  IMAGE = 'image',
  VIDEO = 'video',
  DOCUMENT = 'document',
}

export enum MediaUsage {
  PRODUCT = 'product',
  BRAND = 'brand',
  CATEGORY = 'category',
  USER = 'user',
  BANNER = 'banner',
  BLOG = 'blog',
}

@Entity('media')
export class Media {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar' })
  filename!: string;

  @Column({ type: 'varchar', name: 'original_name' })
  originalName!: string;

  @Column({ type: 'varchar', name: 'mime_type' })
  mimeType!: string;

  @Column({ type: 'bigint' })
  size!: number;

  @Column({ type: 'varchar', unique: true })
  url!: string;

  @Column({ type: 'varchar', nullable: true, name: 'thumbnail_url' })
  thumbnailUrl!: string | null;

  @Column({
    type: 'enum',
    enum: MediaType,
    default: MediaType.IMAGE,
  })
  type!: MediaType;

  @Column({
    type: 'enum',
    enum: MediaUsage,
    nullable: true,
  })
  @Index()
  usage!: MediaUsage | null;

  @Column({ type: 'varchar', nullable: true, name: 'entity_id' })
  @Index()
  entityId!: string | null;

  @Column({ type: 'int', nullable: true })
  width!: number | null;

  @Column({ type: 'int', nullable: true })
  height!: number | null;

  @Column({ type: 'varchar', nullable: true })
  alt!: string | null;

  @Column({ type: 'varchar', nullable: true })
  caption!: string | null;

  @Column({ type: 'int', default: 0 })
  order!: number;

  @OneToMany(() => ProductMedia, (productMedia) => productMedia.media)
  productMedia!: ProductMedia[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
