// backend/src/domains/catalog/dto/update-category.dto.ts

import { PartialType } from '@nestjs/mapped-types';
import { CreateCategoryDto } from './create-category.dto';

// همه فیلدهای CreateCategoryDto اختیاری می‌شوند
// PartialType از mapped-types این کار را خودکار انجام می‌دهد
export class UpdateCategoryDto extends PartialType(CreateCategoryDto) {}
