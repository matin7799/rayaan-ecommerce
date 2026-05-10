import { registerAs } from '@nestjs/config';

export default registerAs('jwt', () => ({
  secret: process.env.JWT_SECRET,
  accessExpiry: '15m',

  refreshSecret: process.env.JWT_REFRESH_SECRET,
  refreshExpiry: '7d',

  tempSecret: process.env.JWT_TEMP_SECRET,
  tempExpiry: '10m',
}));
