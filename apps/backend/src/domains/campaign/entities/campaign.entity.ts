// apps/backend/src/domains/campaign/campaign.entity.ts

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { CampaignProduct } from './campaign-product.entity';

// نوع تخفیف کمپین: درصدی یا مبلغ ثابت
export enum CampaignType {
  PERCENTAGE = 'percentage',
  FIXED = 'fixed',
}

@Entity('campaign')
export class Campaign {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 255 })
  title!: string;

  @Column({
    type: 'enum',
    enum: CampaignType,
  })
  type!: CampaignType;

  // مقدار تخفیف: درصد یا مبلغ ثابت بسته به type
  @Column('bigint')
  value!: number;

  @Column({ name: 'starts_at', type: 'timestamp' })
  starts_at!: Date;

  @Column({ name: 'ends_at', type: 'timestamp' })
  ends_at!: Date;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  is_active!: boolean;

  @CreateDateColumn({ name: 'created_at' })
  created_at!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at!: Date;

  // رابطه یک‌به‌چند با جدول واسط campaign_products
  @OneToMany(() => CampaignProduct, (cp) => cp.campaign)
  campaign_products!: CampaignProduct[];

  // بررسی فعال بودن کمپین در لحظه فعلی
  isCurrentlyActive(): boolean {
    if (!this.is_active) return false;
    const now = new Date();
    return now >= this.starts_at && now <= this.ends_at;
  }

  // محاسبه مبلغ تخفیف بر اساس نوع کمپین
  calculateDiscount(price: number): number {
    if (!this.isCurrentlyActive()) return 0;

    if (this.type === CampaignType.PERCENTAGE) {
      const discount = (price * Number(this.value)) / 100;
      return Math.min(discount, price);
    }

    return Math.min(Number(this.value), price);
  }
}
