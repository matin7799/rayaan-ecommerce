// apps/backend/src/domains/campaign/campaign-product.entity.ts

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Campaign } from './campaign.entity';

@Entity('campaign_products')
@Index('IDX_campaign_products_unique', ['campaign_id', 'product_id'], {
  unique: true,
})
export class CampaignProduct {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'campaign_id', type: 'uuid' })
  campaign_id!: string;

  @Column({ name: 'product_id', type: 'uuid' })
  product_id!: string;

  @ManyToOne(() => Campaign, (c) => c.campaign_products, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'campaign_id' })
  campaign!: Campaign;
}
