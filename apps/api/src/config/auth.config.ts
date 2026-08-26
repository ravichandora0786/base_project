import { registerAs } from '@nestjs/config';

export default registerAs('auth', () => ({
  jwtAccessSecret: process.env.JWT_SECRET,
  jwtRefreshSecret: process.env.JWT_SECRET,
  jwtAccessExpiry: process.env.JWT_ACCESS_EXPIRES_IN || '1d',
  jwtRefreshExpiry: process.env.JWT_REFRESH_EXPIRES_IN || '7d', // Long lived token
}));
