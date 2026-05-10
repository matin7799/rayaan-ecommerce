// apps/backend/src/domains/campaign/campaigns.service.ts

import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { CampaignsRepository } from './campaigns.repository';
import { CreateCampaignDto } from './dto/create-campaign.dto';
import { UpdateCampaignDto } from './dto/update-campaign.dto';
import { Campaign } from './entities/campaign.entity';

@Injectable()
export class CampaignsService {
  constructor(private readonly campaignsRepository: CampaignsRepository) {}

  // ساخت کمپین جدید
  async create(dto: CreateCampaignDto): Promise<Campaign> {
    // اعتبارسنجی: تاریخ پایان باید بعد از تاریخ شروع باشد
    if (new Date(dto.endsAt) <= new Date(dto.startsAt)) {
      throw new BadRequestException('تاریخ پایان باید بعد از تاریخ شروع باشد');
    }

    return this.campaignsRepository.create({
      title: dto.title,
      type: dto.type,
      value: dto.value,
      starts_at: new Date(dto.startsAt),
      ends_at: new Date(dto.endsAt),
      is_active: dto.isActive ?? true,
    });
  }

  // دریافت لیست کمپین‌ها
  async findAll(
    page = 1,
    limit = 20,
  ): Promise<{ data: Campaign[]; total: number }> {
    return this.campaignsRepository.findAll(page, limit);
  }

  // دریافت یک کمپین با آیدی
  async findById(id: string): Promise<Campaign> {
    const campaign = await this.campaignsRepository.findById(id);
    if (!campaign) {
      throw new NotFoundException('کمپین یافت نشد');
    }
    return campaign;
  }

  // بروزرسانی کمپین
  async update(id: string, dto: UpdateCampaignDto): Promise<Campaign> {
    const campaign = await this.findById(id);

    // بروزرسانی فیلدها فقط در صورت ارسال شدن
    if (dto.title !== undefined) campaign.title = dto.title;
    if (dto.type !== undefined) campaign.type = dto.type;
    if (dto.value !== undefined) campaign.value = dto.value;
    if (dto.startsAt !== undefined) campaign.starts_at = new Date(dto.startsAt);
    if (dto.endsAt !== undefined) campaign.ends_at = new Date(dto.endsAt);
    if (dto.isActive !== undefined) campaign.is_active = dto.isActive;

    // اعتبارسنجی مجدد تاریخ‌ها بعد از بروزرسانی
    if (campaign.ends_at <= campaign.starts_at) {
      throw new BadRequestException('تاریخ پایان باید بعد از تاریخ شروع باشد');
    }

    return this.campaignsRepository.save(campaign);
  }

  // حذف کمپین
  async remove(id: string): Promise<void> {
    const campaign = await this.findById(id);
    await this.campaignsRepository.remove(campaign);
  }

  // افزودن محصول به کمپین
  async addProduct(campaignId: string, productId: string) {
    // اطمینان از وجود کمپین
    await this.findById(campaignId);
    return this.campaignsRepository.addProduct(campaignId, productId);
  }

  // حذف محصول از کمپین
  async removeProduct(campaignId: string, productId: string): Promise<void> {
    await this.findById(campaignId);
    await this.campaignsRepository.removeProduct(campaignId, productId);
  }

  // محاسبه تخفیف برای یک محصول خاص
  async calculateDiscountForProduct(
    productId: string,
    price: number,
  ): Promise<{ discount: number; campaign: Campaign | null }> {
    const campaigns =
      await this.campaignsRepository.findActiveCampaignsForProduct(productId);

    if (campaigns.length === 0) {
      return { discount: 0, campaign: null };
    }

    // بهترین تخفیف (بیشترین مبلغ) انتخاب می‌شود
    let bestDiscount = 0;
    let bestCampaign: Campaign | null = null;

    for (const campaign of campaigns) {
      const discount = campaign.calculateDiscount(price);
      if (discount > bestDiscount) {
        bestDiscount = discount;
        bestCampaign = campaign;
      }
    }

    return { discount: bestDiscount, campaign: bestCampaign };
  }
}
