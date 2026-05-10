import { Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUrl,
  IsUUID,
  Min,
} from 'class-validator';
import { MediaType, MediaUsage } from '../entities/media.entity';

export class RegisterMediaByUrlDto {
  @IsUrl({
    require_protocol: true,
  })
  url!: string;

  @IsOptional()
  @IsEnum(MediaUsage)
  usage?: MediaUsage;

  @IsOptional()
  @IsUUID()
  entityId?: string;

  @IsOptional()
  @IsEnum(MediaType)
  type?: MediaType;

  @IsOptional()
  @IsString()
  alt?: string;

  @IsOptional()
  @IsString()
  caption?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  order?: number;
}
