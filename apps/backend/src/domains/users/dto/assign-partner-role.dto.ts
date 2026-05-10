import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsBoolean, IsNumber, Max, Min } from 'class-validator';

export class AssignPartnerRoleDto {
  @ApiProperty({ minimum: 0, maximum: 100 })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(100)
  partnerDiscountPercent!: number;

  @ApiProperty()
  @IsBoolean()
  isPartnerActive!: boolean;
}
