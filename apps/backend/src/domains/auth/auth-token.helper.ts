import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { User } from '../users/entities/user.entity';

export function generateTokens(
  jwtService: JwtService,
  configService: ConfigService,
  user: User,
) {
  const payload = { sub: user.id, phone: user.phone, role: user.role };

  const accessToken = jwtService.sign(payload, {
    secret: configService.get<string>('jwt.secret'),
    expiresIn: '7d', // 7 days
  });

  const refreshToken = jwtService.sign(payload, {
    secret: configService.get<string>('jwt.refreshSecret'),
    expiresIn: 604800, // 7 days
  });

  return { accessToken, refreshToken };
}

export function generateTempToken(
  jwtService: JwtService,
  configService: ConfigService,
  phone: string,
): string {
  return jwtService.sign(
    { phone, type: 'temp' },
    {
      secret: configService.get<string>('jwt.tempSecret'),
      expiresIn: 600, // 10 minutes
    },
  );
}
