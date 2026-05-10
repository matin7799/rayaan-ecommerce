// apps/backend/src/domains/media/media.module.ts

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MediaService } from './media.service';
import { MediaController } from './media.controller';
import { Media } from './entities/media.entity';
import { LiaraStorageService } from '../../shared/storage/liara-storage.service';
import { ProductMedia } from '../catalog/entities/product-media.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Media, ProductMedia])],
  controllers: [MediaController],
  providers: [MediaService, LiaraStorageService],
  exports: [MediaService, LiaraStorageService],
})
export class MediaModule {}
