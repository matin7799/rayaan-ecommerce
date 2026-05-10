import { IsUUID, IsArray, ArrayMinSize } from 'class-validator';

export class AttachProductDto {
  @IsArray()
  @ArrayMinSize(1, { message: 'حداقل یک محصول باید انتخاب شود' })
  @IsUUID('4', { each: true, message: 'شناسه محصولات باید UUID معتبر باشد' })
  productIds!: string[];
}
