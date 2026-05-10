// apps/backend/src/domains/banners/banners.service.ts

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Banner, BannerPosition } from './entities/banner.entity';
import { CreateBannerDto } from './dto/create-banner.dto';
import { UpdateBannerDto } from './dto/update-banner.dto';

@Injectable()
export class BannersService {
  constructor(
    @InjectRepository(Banner)
    private readonly bannerRepository: Repository<Banner>,
  ) {}

  async create(createBannerDto: CreateBannerDto): Promise<Banner> {
    const banner = this.bannerRepository.create(createBannerDto);
    return await this.bannerRepository.save(banner);
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
    const now = new Date();
    return await this.bannerRepository
      .createQueryBuilder('banner')
      .where('banner.position = :position', { position })
      .andWhere('banner.is_active = :isActive', { isActive: true })
      .andWhere('(banner.start_date IS NULL OR banner.start_date <= :now)', {
        now,
      })
      .andWhere('(banner.end_date IS NULL OR banner.end_date >= :now)', { now })
      .orderBy('banner.order', 'ASC')
      .getMany();
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
    return await this.bannerRepository.save(banner);
  }

  async remove(id: string): Promise<void> {
    const banner = await this.findOne(id);
    await this.bannerRepository.remove(banner);
  }

  async incrementView(id: string): Promise<void> {
    await this.bannerRepository.increment({ id }, 'viewCount', 1);
  }

  async incrementClick(id: string): Promise<void> {
    await this.bannerRepository.increment({ id }, 'clickCount', 1);
  }
}
