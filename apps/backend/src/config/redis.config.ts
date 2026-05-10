import { registerAs } from '@nestjs/config';

export default registerAs('redis', () => ({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379', 10),
  password: process.env.REDIS_PASSWORD || undefined,
  db: parseInt(process.env.REDIS_DB || '0', 10),

  // TTL برای OTP (2 دقیقه) - حتماً number
  otpTtl: 120,

  // TTL برای tempToken (10 دقیقه)
  tempTokenTtl: 600,

  // Rate limiting برای OTP
  otpRateLimit: {
    maxAttempts: 3,
    windowSeconds: 600, // 10 دقیقه
  },

  // Max attempts برای verify OTP
  otpMaxVerifyAttempts: 5,
}));
