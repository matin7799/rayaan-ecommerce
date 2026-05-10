import { registerAs } from '@nestjs/config';

export default registerAs('auth', () => ({
  // JWT secrets
  jwtSecret: process.env.JWT_SECRET,
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET,
  jwtTempSecret: process.env.JWT_TEMP_SECRET,

  // Token expiry
  accessTokenExpiry: '15m',
  refreshTokenExpiry: '7d',
  tempTokenExpiry: '10m',

  // Password hashing
  bcryptRounds: 10,

  // OTP settings
  otpLength: 6,
  otpTtl: 120, // 2 minutes in seconds
  otpMaxAttempts: 5,

  // Rate limiting
  otpRateLimit: {
    maxRequests: 3,
    windowSeconds: 600, // 10 minutes
  },
}));
