import { IsBoolean } from 'class-validator';

export class UpdateUserPartnerDto {
  @IsBoolean()
  isPartner!: boolean;
}
