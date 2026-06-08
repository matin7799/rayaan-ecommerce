// apps/backend/src/domains/banners/banners.service.ts

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Banner, BannerPosition } from './entities/banner.entity';
import { CreateBannerDto } from './dto/create-banner.dto';
import { UpdateBannerDto } from './dto/update-banner.dto';
import { CacheService } from '../../shared/redis/cache.service';

@Injectable()
export class BannersService {
  constructor(
    @InjectRepository(Banner)
    private readonly bannerRepository: Repository<Banner>,
    private readonly cacheService: CacheService,
  ) {}

  async create(createBannerDto: CreateBannerDto): Promise<Banner> {
    const banner = this.bannerRepository.create(createBannerDto);
    const saved = await this.bannerRepository.save(banner);
    // Invalidate banner cache on create
    await this.cacheService.invalidatePattern('banners:*');
    return saved;
  }

  async findAll(): Promise<Banner[]> {
    return await this.bannerRepository.find({
      order: { position: 'ASC', order: 'ASC' },
    });
  }

  async findActive(): Promise<Banner[]> {
    const now = new Date();
    return await this.bannerRepository
      .createQueryBuilder('banner')
      .where('banner.is_active = :isActive', { isActive: true })
      .andWhere('(banner.start_date IS NULL OR banner.start_date <= :now)', {
        now,
      })
      .andWhere('(banner.end_date IS NULL OR banner.end_date >= :now)', { now })
      .orderBy('banner.position', 'ASC')
      .addOrderBy('banner.order', 'ASC')
      .getMany();
  }

  async findByPosition(position: BannerPosition): Promise<Banner[]> {
    const cacheKey = CacheService.bannersKey(position);
    const cached = await this.cacheService.get<Banner[]>(cacheKey);
    if (cached) return cached;

    const now = new Date();
    const result = await this.bannerRepository
      .createQueryBuilder('banner')
      .where('banner.position = :position', { position })
      .andWhere('banner.is_active = :isActive', { isActive: true })
      .andWhere('(banner.start_date IS NULL OR banner.start_date <= :now)', {
        now,
      })
      .andWhere('(banner.end_date IS NULL OR banner.end_date >= :now)', { now })
      .orderBy('banner.order', 'ASC')
      .getMany();

    // Cache banners for 5 minutes (they change infrequently)
    await this.cacheService.set(cacheKey, result, 300);
    return result;
  }

  async findOne(id: string): Promise<Banner> {
    const banner = await this.bannerRepository.findOne({ where: { id } });
    if (!banner) {
      throw new NotFoundException('Banner not found');
    }
    return banner;
  }

  async update(id: string, updateBannerDto: UpdateBannerDto): Promise<Banner> {
    const banner = await this.findOne(id);
    Object.assign(banner, updateBannerDto);
    const saved = await this.bannerRepository.save(banner);
    // Invalidate banner cache after update
    await this.cacheService.invalidatePattern('banners:*');
    return saved;
  }

  async remove(id: string): Promise<void> {
    const banner = await this.findOne(id);
    await this.bannerRepository.remove(banner);
    // Invalidate banner cache on delete
    await this.cacheService.invalidatePattern('banners:*');
  }

  async incrementView(id: string): Promise<void> {
    await this.bannerRepository.increment({ id }, 'viewCount', 1);
  }

  async incrementClick(id: string): Promise<void> {
    await this.bannerRepository.increment({ id }, 'clickCount', 1);
  }
}
