// apps/backend/src/domains/media/dto/upload-media.dto.ts

import { IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { MediaUsage } from '../entities/media.entity';

export class UploadMediaDto {
  @IsOptional()
  @IsEnum(MediaUsage)
  usage?: MediaUsage;

  @IsOptional()
  @IsUUID()
  entityId?: string;

  @IsOptional()
  @IsString()
  alt?: string;

  @IsOptional()
  @IsString()
  caption?: string;
}
