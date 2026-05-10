import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { OrderCancelRequestStatus } from '../entities/order-cancel-request.entity';

export class ReviewOrderCancelRequestDto {
  @IsEnum(OrderCancelRequestStatus)
  status!: OrderCancelRequestStatus.APPROVED | OrderCancelRequestStatus.REJECTED;

  @IsString()
  @IsOptional()
  @MaxLength(1000)
  adminNote?: string;
}
