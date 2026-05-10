// backend/src/domains/catalog/dto/create-category.dto.ts

import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsUUID,
  Matches,
  MaxLength,
} from 'class-validator';

export class CreateCategoryDto {
  @IsString()
  @IsNotEmpty({ message: 'نام دسته‌بندی الزامی است' })
  @MaxLength(100)
  name!: string;

  // اسلاگ فقط حروف کوچک انگلیسی، اعداد و خط تیره مجاز است
  @IsString()
  @IsNotEmpty({ message: 'اسلاگ الزامی است' })
  @MaxLength(120)
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message:
      'اسلاگ فقط شامل حروف کوچک، اعداد و خط تیره باشد (مثال: digital-products)',
  })
  slug!: string;

  // آیدی دسته‌بندی والد (اختیاری — اگر نباشد، دسته ریشه است)
  @IsOptional()
  @IsUUID('4', { message: 'آیدی والد باید UUID معتبر باشد' })
  parent_id?: string;
}
