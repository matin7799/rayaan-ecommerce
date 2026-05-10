// apps/backend/src/domains/banners/entities/banner.entity.ts

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum BannerPosition {
  HOME_HERO = 'home_hero',
  HOME_SECONDARY = 'home_secondary',
  CATEGORY_TOP = 'category_top',
  SIDEBAR = 'sidebar',
  FOOTER = 'footer',
}

@Entity('banners')
export class Banner {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar' })
  title!: string;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Column({ type: 'varchar', name: 'image_url' })
  imageUrl!: string;

  @Column({ type: 'varchar', nullable: true, name: 'mobile_image_url' })
  mobileImageUrl!: string | null;

  @Column({ type: 'varchar', nullable: true, name: 'link_url' })
  linkUrl!: string | null;

  @Column({
    type: 'enum',
    enum: BannerPosition,
    default: BannerPosition.HOME_HERO,
  })
  position!: BannerPosition;

  @Column({ type: 'int', default: 0 })
  order!: number;

  @Column({ type: 'boolean', default: true, name: 'is_active' })
  isActive!: boolean;

  @Column({ type: 'timestamp', nullable: true, name: 'start_date' })
  startDate!: Date | null;

  @Column({ type: 'timestamp', nullable: true, name: 'end_date' })
  endDate!: Date | null;

  @Column({ type: 'int', default: 0, name: 'click_count' })
  clickCount!: number;

  @Column({ type: 'int', default: 0, name: 'view_count' })
  viewCount!: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
