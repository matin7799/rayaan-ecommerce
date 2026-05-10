import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Req,
  Headers,
  UseGuards,
  BadRequestException,
  Res,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { ThrottlerGuard } from '@nestjs/throttler';
import {
  ThrottleAuth,
  ThrottleOtp,
} from '../../common/decorators/throttle.decorator';
import type { Request } from 'express';
import type { Response } from 'express';

import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RequestOtpDto } from './dto/request-otp.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';

@UseGuards(ThrottlerGuard)
@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  private setAuthCookies(res: Response, refreshToken: string): void {
    const isProduction = process.env.NODE_ENV === 'production';
    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      path: '/api/v1/auth',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
  }

  // ==================== OTP Endpoints ====================

  @Post('otp/request')
  @ThrottleOtp()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'درخواست ارسال کد OTP' })
  @ApiResponse({ status: 200, description: 'کد OTP ارسال شد' })
  @ApiResponse({ status: 429, description: 'محدودیت تعداد درخواست' })
  async requestOtp(@Body() dto: RequestOtpDto, @Req() req: Request) {
    const clientIp = req.ip || req.socket.remoteAddress || 'unknown';
    return this.authService.requestOtp(dto, clientIp);
  }

  @Post('otp/verify')
  @ThrottleOtp()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'تایید کد OTP' })
  @ApiResponse({ status: 200, description: 'کد OTP تایید شد' })
  @ApiResponse({ status: 400, description: 'کد OTP نامعتبر یا منقضی شده' })
  @ApiResponse({ status: 404, description: 'درخواست OTP یافت نشد' })
  @ApiResponse({ status: 429, description: 'تعداد تلاش‌های ناموفق بیش از حد' })
  async verifyOtp(
    @Body() dto: VerifyOtpDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.verifyOtp(dto);
    if (!result.needsRegistration && result.refreshToken) {
      this.setAuthCookies(res, result.refreshToken);
    }
    return result;
  }

  // ==================== Register Endpoints ====================

  @Post('register')
  @ThrottleAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'ثبت‌نام کاربر جدید' })
  @ApiBearerAuth()
  @ApiResponse({ status: 201, description: 'ثبت‌نام موفق' })
  @ApiResponse({ status: 401, description: 'tempToken نامعتبر' })
  @ApiResponse({ status: 409, description: 'شماره موبایل تکراری' })
  async register(
    @Body() dto: RegisterDto,
    @Res({ passthrough: true }) res: Response,
    @Headers('authorization') authHeader?: string,
  ) {
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const tempToken = authHeader.substring(7);
      const result = await this.authService.registerWithTempToken(tempToken, dto);
      if (result.refreshToken) {
        this.setAuthCookies(res, result.refreshToken);
      }
      return result;
    }
    if (dto.phone) {
      const result = await this.authService.register(dto);
      if (result.refreshToken) {
        this.setAuthCookies(res, result.refreshToken);
      }
      return result;
    }
    throw new BadRequestException({
      code: 'VALIDATION_ERROR',
      message: 'Either provide tempToken or phone number',
    });
  }

  // ==================== Login Endpoints ====================

  @Post('login')
  @ThrottleAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'ورود با رمز عبور' })
  @ApiResponse({ status: 200, description: 'ورود موفق' })
  @ApiResponse({ status: 401, description: 'اطلاعات ورود نامعتبر' })
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.login(dto);
    if (result.refreshToken) {
      this.setAuthCookies(res, result.refreshToken);
    }
    return result;
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'تمدید توکن' })
  @ApiResponse({ status: 200, description: 'توکن جدید صادر شد' })
  async refresh(
    @Body() dto: RefreshTokenDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const cookieToken = req.cookies?.refresh_token as string | undefined;
    const refreshToken = dto.refreshToken || cookieToken || '';
    const result = await this.authService.refreshToken({ refreshToken });
    if (result.refreshToken) {
      this.setAuthCookies(res, result.refreshToken);
    }
    return result;
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'خروج از سیستم' })
  logout(
    @Body('refreshToken') _refreshToken: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    res.clearCookie('refresh_token', { path: '/api/v1/auth' });
    return { message: 'Logged out successfully' };
  }
}
