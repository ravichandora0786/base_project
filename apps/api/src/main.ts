import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';

import { HttpExceptionFilter } from './common/filters/http-exception.filter';

import { NestExpressApplication } from '@nestjs/platform-express';
import * as path from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Security Headers
  // Allow helmet to bypass checking images served from uploads internally
  app.use(helmet({
    crossOriginResourcePolicy: false,
  }));

  // Global Exception Filter
  app.useGlobalFilters(new HttpExceptionFilter());

  // Global Prefix
  app.setGlobalPrefix('api');

  // Serve static assets from uploads directory
  app.useStaticAssets(path.join(process.cwd(), 'uploads'), {
    prefix: '/uploads',
  });

  // Cookies support
  app.use(cookieParser());

  // Global Validation Pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // CORS Configuration
  const clientUrlEnv = process.env.CLIENT_URL || '';
  const allowedOrigins = clientUrlEnv
    .split(',')
    .map((url) => url.trim().replace(/\/$/, ''))
    .filter(Boolean);

  app.enableCors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, Postman)
      if (!origin) {
        return callback(null, true);
      }

      const cleanOrigin = origin.replace(/\/$/, '');
      const isLocalhost = cleanOrigin.startsWith('http://localhost:') || cleanOrigin.startsWith('http://127.0.0.1:');
      const isNetlify = cleanOrigin.endsWith('.netlify.app');
      const isVercel = cleanOrigin.endsWith('.vercel.app');
      const isAllowedConfig = allowedOrigins.includes(cleanOrigin) || allowedOrigins.includes('*') || clientUrlEnv === '*';

      if (isLocalhost || isNetlify || isVercel || isAllowedConfig) {
        return callback(null, true);
      }

      // Reflect the origin to ensure CORS preflight always succeeds
      return callback(null, true);
    },
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type, Accept, Authorization, X-Requested-With',
  });

  const port = process.env.PORT || 4000;
  await app.listen(port, '0.0.0.0');
  console.log(`Application is running on: http://0.0.0.0:${port}/api`);
}
bootstrap();
