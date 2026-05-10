// backend/src/domains/auth/dto/send-otp.dto.ts

import { IsNotEmpty, IsString, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SendOtpDto {
  @ApiProperty({
    example: '09121234567',
    description: 'شماره موبایل کاربر',
  })
  @IsNotEmpty({ message: 'شماره موبایل الزامی است' })
  @IsString()
  @Matches(/^09[0-9]{9}$/, {
    message: 'فرمت شماره موبایل صحیح نیست (مثال: 09121234567)',
  })
  phone!: string;
}
