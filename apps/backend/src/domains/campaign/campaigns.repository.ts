// apps/backend/src/domains/campaign/campaigns.repository.ts

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Campaign } from './entities/campaign.entity';
import { CampaignProduct } from './entities/campaign-product.entity';

@Injectable()
export class CampaignsRepository {
  constructor(
    @InjectRepository(Campaign)
    private readonly campaignRepo: Repository<Campaign>,

    @InjectRepository(CampaignProduct)
    private readonly campaignProductRepo: Repository<CampaignProduct>,
  ) {}

  // ساخت کمپین جدید
  async create(data: Partial<Campaign>): Promise<Campaign> {
    const campaign = this.campaignRepo.create(data);
    return this.campaignRepo.save(campaign);
  }

  // دریافت لیست کمپین‌ها با صفحه‌بندی
  async findAll(
    page: number,
    limit: number,
  ): Promise<{ data: Campaign[]; total: number }> {
    const [data, total] = await this.campaignRepo.findAndCount({
      order: { created_at: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { data, total };
  }

  // پیدا کردن کمپین با آیدی
  async findById(id: string): Promise<Campaign | null> {
    return this.campaignRepo.findOne({ where: { id } });
  }

  // پیدا کردن کمپین با آیدی به همراه محصولات مرتبط
  async findByIdWithProducts(id: string): Promise<Campaign | null> {
    return this.campaignRepo.findOne({
      where: { id },
      relations: ['campaign_products'],
    });
  }

  // ذخیره تغییرات کمپین
  async save(campaign: Campaign): Promise<Campaign> {
    return this.campaignRepo.save(campaign);
  }

  // حذف کمپین
  async remove(campaign: Campaign): Promise<void> {
    await this.campaignRepo.remove(campaign);
  }

  // دریافت کمپین‌های فعال برای یک محصول خاص
  async findActiveCampaignsForProduct(productId: string): Promise<Campaign[]> {
    const now = new Date();

    return this.campaignRepo
      .createQueryBuilder('c')
      .innerJoin('c.campaign_products', 'cp')
      .where('cp.product_id = :productId', { productId })
      .andWhere('c.is_active = :active', { active: true })
      .andWhere('c.starts_at <= :now', { now })
      .andWhere('c.ends_at >= :now', { now })
      .getMany();
  }

  // افزودن محصول به کمپین
  async addProduct(
    campaignId: string,
    productId: string,
  ): Promise<CampaignProduct> {
    const cp = this.campaignProductRepo.create({
      campaign_id: campaignId,
      product_id: productId,
    });
    return this.campaignProductRepo.save(cp);
  }

  // حذف محصول از کمپین
  async removeProduct(campaignId: string, productId: string): Promise<void> {
    await this.campaignProductRepo.delete({
      campaign_id: campaignId,
      product_id: productId,
    });
  }

  // دریافت لیست محصولات یک کمپین
  async findProductsByCampaignId(
    campaignId: string,
  ): Promise<CampaignProduct[]> {
    return this.campaignProductRepo.find({
      where: { campaign_id: campaignId },
    });
  }
}
