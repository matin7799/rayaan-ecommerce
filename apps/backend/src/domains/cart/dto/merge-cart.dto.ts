// apps/backend/src/domains/cart/dto/merge-cart.dto.ts

import { IsUUID, IsInt, Min, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class MergeCartItemDto {
  @ApiProperty({
    example: 'd3b07384-d113-4ec5-a5d7-be7c438c8c88',
    description: 'شناسه واریانت محصول',
  })
  @IsUUID(undefined, { message: 'شناسه واریانت نامعتبر است' })
  variantId!: string;

  @ApiProperty({
    example: 2,
    description: 'تعداد محصول جهت ادغام',
  })
  @IsInt({ message: 'تعداد باید عدد صحیح باشد' })
  @Min(1, { message: 'تعداد باید حداقل ۱ باشد' })
  quantity!: number;
}

export class MergeCartDto {
  @ApiProperty({
    type: [MergeCartItemDto],
    description: 'لیست آیتم‌های سبد خرید مهمان جهت ادغام',
  })
  @IsArray({ message: 'آیتم‌ها باید در قالب آرایه باشند' })
  @ValidateNested({ each: true })
  @Type(() => MergeCartItemDto)
  items!: MergeCartItemDto[];
}
