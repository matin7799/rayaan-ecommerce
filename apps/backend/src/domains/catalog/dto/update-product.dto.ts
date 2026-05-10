// backend/src/domains/catalog/dto/update-product.dto.ts

import { PartialType } from '@nestjs/mapped-types';
import {
  CreateProductAttributeDto,
  CreateProductDto,
  CreateProductOptionDto,
} from './create-product.dto';

// همه فیلدها اختیاری می‌شوند - فقط فیلدهای ارسال‌شده آپدیت می‌شوند
export class UpdateProductDto extends PartialType(CreateProductDto) {
  declare slug?: string;
  declare options?: CreateProductOptionDto[];
  declare attributes?: CreateProductAttributeDto[];
}
