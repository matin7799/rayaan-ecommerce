// apps/backend/src/domains/auth/auth.service.ts

import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  NotFoundException,
  BadRequestException,
  HttpException,
  HttpStatus,
  Inject,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import Redis from 'ioredis';

import { User } from '../users/entities/user.entity';
import { Role } from './enums/role.enum';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RequestOtpDto } from './dto/request-otp.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @Inject('REDIS_CLIENT') private readonly redis: Redis,
  ) {}

  // ==================== OTP ====================

  /**
   * درخواست ارسال OTP
   * همیشه 200 برمی‌گرداند (جلوگیری از user enumeration)
   */
  async requestOtp(dto: RequestOtpDto, clientIp: string): Promise<any> {
    const { phone } = dto;

    await this.checkOtpRateLimit(phone, clientIp);

    const code = this.generateOtpCode();
    const otpKey = `otp:${phone}`;
    const attemptsKey = `otp:attempts:${phone}`;
    const otpTtl = this.configService.get<number>('redis.otpTtl') ?? 120;

    await this.redis.setex(otpKey, otpTtl, code);
    await this.redis.setex(attemptsKey, otpTtl, '0');

    // در production از سرویس پیامکی استفاده شود
    console.log(`[OTP] Code for ${phone}: ${code}`);

    return {
      otpExpiry: otpTtl,
      message: 'Verification code sent',
    };
  }

  /**
   * تأیید OTP
   * کاربر موجود → توکن‌های ورود
   * کاربر جدید → tempToken برای تکمیل ثبت‌نام
   */
  async verifyOtp(dto: VerifyOtpDto): Promise<any> {
    const { phone, code } = dto;

    const otpKey = `otp:${phone}`;
    const attemptsKey = `otp:attempts:${phone}`;

    const storedCode = await this.redis.get(otpKey);
    if (!storedCode) {
      throw new NotFoundException({
        code: 'OTP_NOT_FOUND',
        message: 'No OTP request found for this phone number',
      });
    }

    // بررسی حد مجاز تلاش‌های ناموفق
    const attempts = parseInt((await this.redis.get(attemptsKey)) || '0', 10);
    const maxAttempts =
      this.configService.get<number>('redis.otpMaxVerifyAttempts') ?? 5;

    if (attempts >= maxAttempts) {
      await this.redis.del(otpKey, attemptsKey);
      throw new HttpException(
        {
          code: 'OTP_MAX_ATTEMPTS',
          message: 'Too many failed attempts. Please request a new code.',
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    if (storedCode !== code) {
      await this.redis.incr(attemptsKey);
      throw new BadRequestException({
        code: 'OTP_INVALID',
        message: 'The verification code is invalid or expired',
      });
    }

    // کد صحیح - حذف از Redis
    await this.redis.del(otpKey, attemptsKey);

    const user = await this.userRepository.findOne({ where: { phone } });

    if (user) {
      // کاربر موجود → ورود مستقیم
      const tokens = this.generateTokens(user);
      return { needsRegistration: false, ...tokens };
    } else {
      // کاربر جدید → tempToken
      const tempToken = this.generateTempToken(phone);
      return { needsRegistration: true, tempToken };
    }
  }

  // ==================== Registration ====================

  /**
   * ثبت‌نام با tempToken (بعد از تأیید OTP)
   */
  async registerWithTempToken(
    tempToken: string,
    dto: RegisterDto,
  ): Promise<any> {
    let payload: { phone: string; type: string };
    try {
      payload = this.jwtService.verify(tempToken, {
        secret: this.configService.get<string>('jwt.tempSecret'),
      });
    } catch {
      throw new UnauthorizedException({
        code: 'TEMP_TOKEN_INVALID',
        message: 'Registration token is invalid or expired',
      });
    }

    const phone = payload.phone;

    const existingUser = await this.userRepository.findOne({
      where: { phone },
    });
    if (existingUser) {
      throw new ConflictException({
        code: 'PHONE_ALREADY_EXISTS',
        message: 'This phone number is already registered',
      });
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    // ایجاد کاربر - firstName و lastName جدا
    const user = this.userRepository.create({
      phone,
      password: hashedPassword,
      firstName: dto.firstName,
      lastName: dto.lastName,
      role: Role.CUSTOMER,
    });

    await this.userRepository.save(user);

    const tokens = this.generateTokens(user);
    return { userId: user.id, ...tokens };
  }

  /**
   * ثبت‌نام مستقیم (fallback بدون OTP)
   */
  async register(dto: RegisterDto): Promise<any> {
    const { phone, password, firstName, lastName } = dto;

    if (!phone) {
      throw new BadRequestException({
        code: 'PHONE_REQUIRED',
        message: 'Phone number is required for direct registration',
      });
    }

    const existingUser = await this.userRepository.findOne({
      where: { phone },
    });
    if (existingUser) {
      throw new ConflictException({
        code: 'PHONE_ALREADY_EXISTS',
        message: 'This phone number is already registered',
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = this.userRepository.create({
      phone,
      password: hashedPassword,
      firstName,
      lastName,
      role: Role.CUSTOMER,
    });

    await this.userRepository.save(user);

    const tokens = this.generateTokens(user);
    return { userId: user.id, ...tokens };
  }

  // ==================== Login ====================

  /**
   * ورود با رمز عبور
   */
  async login(dto: LoginDto): Promise<any> {
    const { phone, password } = dto;

    const user = await this.userRepository.findOne({ where: { phone } });
    if (!user || !user.password) {
      throw new UnauthorizedException({
        code: 'INVALID_CREDENTIALS',
        message: 'Phone or password is incorrect',
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException({
        code: 'INVALID_CREDENTIALS',
        message: 'Phone or password is incorrect',
      });
    }

    return this.generateTokens(user);
  }

  // ==================== Refresh Token ====================

  /**
   * تمدید توکن با استفاده از refresh token
   */
  async refreshToken(dto: RefreshTokenDto): Promise<any> {
    const { refreshToken } = dto;

    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('jwt.refreshSecret'),
      });

      const user = await this.userRepository.findOne({
        where: { id: payload.sub },
      });

      if (!user) {
        throw new UnauthorizedException({
          code: 'USER_NOT_FOUND',
          message: 'User not found',
        });
      }

      // تولید توکن‌های جدید
      const tokens = this.generateTokens(user);
      return tokens;
    } catch {
      throw new UnauthorizedException({
        code: 'INVALID_REFRESH_TOKEN',
        message: 'Refresh token is invalid or expired',
      });
    }
  }

  /**
   * خروج از سیستم (اختیاری - برای revoke کردن refresh token)
   */
  async logout(_userId: string): Promise<void> {
    // در صورت نیاز می‌توان refresh token را در blacklist قرار داد
    // یا از دیتابیس حذف کرد
    // فعلاً placeholder است
  }

  // ==================== Tokens ====================

  /**
   * تولید accessToken + refreshToken
   */
  private generateTokens(user: User) {
    const payload = { sub: user.id, phone: user.phone, role: user.role };

    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('jwt.secret'),
      expiresIn: 900, // 15 دقیقه
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('jwt.refreshSecret'),
      expiresIn: 604800, // 7 روز
    });

    return { accessToken, refreshToken };
  }

  /**
   * تولید tempToken برای ثبت‌نام بعد از OTP
   */
  private generateTempToken(phone: string): string {
    return this.jwtService.sign(
      { phone, type: 'temp' },
      {
        secret: this.configService.get<string>('jwt.tempSecret'),
        expiresIn: 600, // 10 دقیقه
      },
    );
  }

  // ==================== Helpers ====================

  private generateOtpCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  private async checkOtpRateLimit(
    phone: string,
    clientIp: string,
  ): Promise<void> {
    const rateLimitKey = `otp:ratelimit:${phone}:${clientIp}`;
    const count = await this.redis.incr(rateLimitKey);

    if (count === 1) {
      const windowSeconds =
        this.configService.get<number>('redis.otpRateLimit.windowSeconds') ??
        600;
      await this.redis.expire(rateLimitKey, windowSeconds);
    }

    const maxAttempts =
      this.configService.get<number>('redis.otpRateLimit.maxAttempts') ?? 3;

    if (count > maxAttempts) {
      const ttl = await this.redis.ttl(rateLimitKey);
      throw new HttpException(
        {
          code: 'OTP_RATE_LIMITED',
          message: 'Too many OTP requests. Please try again later.',
          retryAfter: ttl,
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
  }
}
