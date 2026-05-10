import { IsString, Matches, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class VerifyOtpDto {
  @ApiProperty({
    example: '09123456789',
    description: 'شماره موبایل کاربر',
  })
  @IsString()
  @Matches(/^09\d{9}$/, {
    message: 'شماره موبایل باید با 09 شروع شده و 11 رقم باشد',
  })
  phone!: string;

  @ApiProperty({
    example: '123456',
    description: 'کد 6 رقمی OTP',
  })
  @IsString()
  @Length(6, 6, { message: 'کد OTP باید دقیقاً 6 رقم باشد' })
  code!: string;
}
