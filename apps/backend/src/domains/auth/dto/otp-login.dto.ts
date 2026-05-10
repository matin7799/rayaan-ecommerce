// apps/backend/src/domains/auth/dto/otp-login.dto.ts

import { IsString, Matches, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class OtpLoginDto {
  @ApiProperty({
    description: 'شماره موبایل کاربر',
    example: '09121234567',
  })
  @IsString()
  @Matches(/^09[0-9]{9}$/, {
    message: 'فرمت شماره موبایل صحیح نیست',
  })
  phone!: string;

  @ApiProperty({
    description: 'کد OTP پنج رقمی',
    example: '12345',
  })
  @IsString()
  @Length(5, 5, { message: 'کد OTP باید ۵ رقم باشد' })
  @Matches(/^[0-9]{5}$/, { message: 'کد OTP فقط شامل اعداد است' })
  code!: string;
}
