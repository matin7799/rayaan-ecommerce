// apps/backend/src/domains/campaign/dto/create-campaign.dto.ts

import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsNumber,
  Min,
  IsOptional,
  IsBoolean,
  IsDateString,
} from 'class-validator';
import { CampaignType } from '../entities/campaign.entity';

export class CreateCampaignDto {
  @IsString()
  @IsNotEmpty({ message: 'عنوان کمپین الزامی است.' })
  title!: string;

  @IsEnum(CampaignType, {
    message: 'نوع تخفیف باید percentage یا fixed باشد.',
  })
  type!: CampaignType;

  @IsNumber({}, { message: 'مقدار تخفیف باید عدد باشد.' })
  @Min(0, { message: 'مقدار تخفیف نمی‌تواند منفی باشد.' })
  value!: number;

  @IsDateString({}, { message: 'تاریخ شروع معتبر نیست.' })
  startsAt!: string;

  @IsDateString({}, { message: 'تاریخ پایان معتبر نیست.' })
  endsAt!: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
