import { IsString, Matches, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
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
    example: 'StrongPassword123',
    description: 'رمز عبور کاربر',
  })
  @IsString()
  @MinLength(8, { message: 'رمز عبور باید حداقل 8 کاراکتر باشد' })
  password!: string;
}
