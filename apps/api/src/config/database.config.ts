import { registerAs } from '@nestjs/config';

export default registerAs('database', () => ({
  url: process.env.DATABASE_URL || 'postgresql://postgres:postgrespassword@localhost:5432/nextnestdb?schema=public',
}));
