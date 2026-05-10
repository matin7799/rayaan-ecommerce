import { IsString, IsOptional, MinLength, Matches } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RegisterDto {
  @ApiPropertyOptional({
    example: '09123456789',
    description: 'شماره موبایل (فقط برای ثبت‌نام مستقیم بدون OTP)',
  })
  @IsOptional()
  @IsString()
  @Matches(/^09\d{9}$/, {
    message: 'شماره موبایل باید با 09 شروع شده و 11 رقم باشد',
  })
  phone?: string;

  @ApiProperty({
    example: 'علی',
    description: 'نام کاربر',
  })
  @IsString()
  @MinLength(2, { message: 'نام باید حداقل 2 کاراکتر باشد' })
  firstName!: string;

  @ApiProperty({
    example: 'احمدی',
    description: 'نام خانوادگی کاربر',
  })
  @IsString()
  @MinLength(2, { message: 'نام خانوادگی باید حداقل 2 کاراکتر باشد' })
  lastName!: string;

  @ApiProperty({
    example: 'StrongPassword123',
    description: 'رمز عبور (حداقل 8 کاراکتر)',
  })
  @IsString()
  @MinLength(8, { message: 'رمز عبور باید حداقل 8 کاراکتر باشد' })
  password!: string;
}
