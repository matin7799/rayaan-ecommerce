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
import { SmsService } from '../../providers/sms/sms.service';
import { generateTokens, generateTempToken } from './auth-token.helper';
import { generateOtpCode, checkOtpRateLimit } from './auth-otp.helper';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @Inject('REDIS_CLIENT') private readonly redis: Redis,
    private readonly smsService: SmsService,
  ) {}

  // ==================== OTP ====================

  async requestOtp(dto: RequestOtpDto, clientIp: string): Promise<any> {
    const { phone } = dto;

    await checkOtpRateLimit(phone, clientIp, this.redis, this.configService);

    const code = generateOtpCode();
    const otpKey = `otp:${phone}`;
    const attemptsKey = `otp:attempts:${phone}`;
    const otpTtl = this.configService.get<number>('redis.otpTtl') ?? 120;

    await this.redis.setex(otpKey, otpTtl, code);
    await this.redis.setex(attemptsKey, otpTtl, '0');

    await this.smsService.sendOtp(phone, code);

    return {
      otpExpiry: otpTtl,
      message: 'Verification code sent',
    };
  }

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

    await this.redis.del(otpKey, attemptsKey);

    const user = await this.userRepository.findOne({ where: { phone } });

    if (user) {
      const tokens = generateTokens(this.jwtService, this.configService, user);
      return { needsRegistration: false, ...tokens };
    } else {
      const tempToken = generateTempToken(
        this.jwtService,
        this.configService,
        phone,
      );
      return { needsRegistration: true, tempToken };
    }
  }

  // ==================== Registration ====================

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

    const user = this.userRepository.create({
      phone,
      password: hashedPassword,
      firstName: dto.firstName,
      lastName: dto.lastName,
      role: Role.CUSTOMER,
    });

    await this.userRepository.save(user);

    const tokens = generateTokens(this.jwtService, this.configService, user);
    return { userId: user.id, ...tokens };
  }

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

    const tokens = generateTokens(this.jwtService, this.configService, user);
    return { userId: user.id, ...tokens };
  }

  // ==================== Login ====================

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

    return generateTokens(this.jwtService, this.configService, user);
  }

  // ==================== Refresh Token ====================

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

      return generateTokens(this.jwtService, this.configService, user);
    } catch {
      throw new UnauthorizedException({
        code: 'INVALID_REFRESH_TOKEN',
        message: 'Refresh token is invalid or expired',
      });
    }
  }

  async logout(_userId: string): Promise<void> {
    // Placeholder
  }
}
