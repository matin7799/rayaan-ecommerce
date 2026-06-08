// apps/backend/src/domains/media/media.service.ts

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, In, Repository } from 'typeorm';
import { Media, MediaType, MediaUsage } from './entities/media.entity';
import { LiaraStorageService } from '../../shared/storage/liara-storage.service';
import { RegisterMediaByUrlDto } from './dto/register-media-by-url.dto';
import { ProductMedia } from '../catalog/entities/product-media.entity';
import {
  extractFilenameFromUrl,
  getMediaType,
  getMediaTypeFromMimeType,
  getMimeTypeFromUrl,
} from './media-utils';

@Injectable()
export class MediaService {
  constructor(
    @InjectRepository(Media)
    private readonly mediaRepository: Repository<Media>,
    @InjectRepository(ProductMedia)
    private readonly productMediaRepository: Repository<ProductMedia>,
    private readonly storageService: LiaraStorageService,
  ) {}

  async uploadFile(
    file: Express.Multer.File,
    usage?: MediaUsage,
    entityId?: string,
    alt?: string,
  ): Promise<Media> {
    const folder = usage ? `${usage}s` : 'uploads';

    const { url, filename } = await this.storageService.uploadFile(
      file,
      folder,
    );
    const mediaType = getMediaType(file.mimetype);

    const media = this.mediaRepository.create({
      filename,
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      url,
      type: mediaType,
      usage: usage ?? null,
      entityId: entityId ?? null,
      alt: alt ?? null,
    });

    return this.mediaRepository.save(media);
  }

  async uploadMultiple(
    files: Express.Multer.File[],
    usage?: MediaUsage,
    entityId?: string,
  ): Promise<Media[]> {
    const uploadedMedia = await Promise.all(
      files.map((file, index) =>
        this.uploadFile(
          file,
          usage,
          entityId,
          `${usage ?? 'image'}-${index + 1}`,
        ),
      ),
    );

    for (let index = 0; index < uploadedMedia.length; index++) {
      uploadedMedia[index].order = index;
    }

    return this.mediaRepository.save(uploadedMedia);
  }

  async registerByUrl(dto: RegisterMediaByUrlDto): Promise<Media> {
    const existingMedia = await this.mediaRepository.findOne({
      where: { url: dto.url },
    });

    if (existingMedia) {
      return existingMedia;
    }

    const filename = extractFilenameFromUrl(dto.url);
    const mimeType = getMimeTypeFromUrl(dto.url);
    const detectedType = getMediaTypeFromMimeType(mimeType);

    const media = this.mediaRepository.create({
      url: dto.url,
      filename,
      originalName: filename,
      mimeType,
      type: dto.type ?? detectedType ?? MediaType.IMAGE,
      size: 0,
      usage: dto.usage,
      entityId: dto.entityId ?? null,
      alt: dto.alt ?? null,
      caption: dto.caption ?? null,
      order: dto.order ?? 0,
    });

    return this.mediaRepository.save(media);
  }

  async findAll(params?: {
    usage?: MediaUsage;
    entityId?: string;
    type?: MediaType;
  }): Promise<Media[]> {
    const where: FindOptionsWhere<Media> = {};

    if (params?.usage) {
      where.usage = params.usage;
    }

    if (params?.entityId) {
      where.entityId = params.entityId;
    }

    if (params?.type) {
      where.type = params.type;
    }

    return this.mediaRepository.find({
      where,
      order: {
        order: 'ASC',
        createdAt: 'DESC',
      },
    });
  }

  async findOne(id: string): Promise<Media> {
    const media = await this.mediaRepository.findOne({
      where: { id },
    });

    if (!media) {
      throw new NotFoundException('Media not found');
    }

    return media;
  }

  async findAllByIds(ids: string[]): Promise<Media[]> {
    if (!ids.length) return [];
    return this.mediaRepository.find({
      where: { id: In(ids) },
    });
  }

  async findByEntity(usage: MediaUsage, entityId: string): Promise<Media[]> {
    return this.mediaRepository.find({
      where: { usage, entityId },
      order: {
        order: 'ASC',
        createdAt: 'DESC',
      },
    });
  }

  async findByEntities(
    usage: MediaUsage,
    entityIds: string[],
  ): Promise<Media[]> {
    if (entityIds.length === 0) {
      return [];
    }

    return this.mediaRepository.find({
      where: {
        usage,
        entityId: In(entityIds),
      },
      order: {
        order: 'ASC',
        createdAt: 'DESC',
      },
    });
  }

  async getProductMediaMap(
    productIds: string[],
  ): Promise<Record<string, Media[]>> {
    const output: Record<string, Media[]> = {};
    if (!productIds.length) return output;

    const rows = await this.productMediaRepository.find({
      where: {
        productId: In(productIds),
      },
      relations: {
        media: true,
      },
      order: {
        order: 'ASC',
        createdAt: 'ASC',
      },
    });

    for (const row of rows) {
      if (!output[row.productId]) {
        output[row.productId] = [];
      }

      const media = row.media;
      media.order = row.order;
      media.alt = row.alt ?? media.alt;
      media.caption = row.caption ?? media.caption;
      output[row.productId].push(media);
    }

    return output;
  }

  async attachMediaToProduct(
    productId: string,
    mediaId: string,
    order = 0,
    alt?: string | null,
    caption?: string | null,
  ): Promise<ProductMedia> {
    const existing = await this.productMediaRepository.findOne({
      where: {
        productId,
        mediaId,
      },
    });

    if (existing) {
      existing.order = order;
      existing.alt = alt ?? existing.alt;
      existing.caption = caption ?? existing.caption;
      return this.productMediaRepository.save(existing);
    }

    const row = this.productMediaRepository.create({
      productId,
      mediaId,
      order,
      alt: alt ?? null,
      caption: caption ?? null,
    });
    return this.productMediaRepository.save(row);
  }

  async getProductMedia(productId: string): Promise<Media[]> {
    const rows = await this.productMediaRepository.find({
      where: {
        productId,
      },
      relations: {
        media: true,
      },
      order: {
        order: 'ASC',
        createdAt: 'ASC',
      },
    });

    return rows.map((row) => {
      const media = row.media;
      media.order = row.order;
      media.alt = row.alt ?? media.alt;
      media.caption = row.caption ?? media.caption;
      return media;
    });
  }

  async reorderProductMedia(
    productId: string,
    mediaIds: string[],
  ): Promise<void> {
    const rows = await this.productMediaRepository.find({
      where: { productId },
    });
    const rowByMediaId = new Map(rows.map((row) => [row.mediaId, row]));

    for (let index = 0; index < mediaIds.length; index += 1) {
      const mediaId = mediaIds[index];
      const row = rowByMediaId.get(mediaId);
      if (!row) continue;
      row.order = index;
      await this.productMediaRepository.save(row);
    }
  }

  async updateMedia(
    id: string,
    data: {
      alt?: string;
      caption?: string;
      order?: number;
      entityId?: string;
      usage?: MediaUsage;
    },
  ): Promise<Media> {
    const media = await this.findOne(id);

    Object.assign(media, {
      ...data,
      entityId: data.entityId ?? media.entityId,
      usage: data.usage ?? media.usage,
    });

    return this.mediaRepository.save(media);
  }

  async delete(id: string): Promise<void> {
    const media = await this.findOne(id);

    const key = this.storageService.extractKeyFromUrl(media.url);

    if (key) {
      await this.storageService.deleteFile(key);
    }

    await this.mediaRepository.remove(media);
  }

  async deleteByEntity(usage: MediaUsage, entityId: string): Promise<void> {
    const mediaList = await this.findByEntity(usage, entityId);

    for (const media of mediaList) {
      await this.delete(media.id);
    }
  }

  async reorderMedia(mediaIds: string[]): Promise<void> {
    for (let index = 0; index < mediaIds.length; index++) {
      await this.mediaRepository.update(mediaIds[index], { order: index });
    }
  }
}
