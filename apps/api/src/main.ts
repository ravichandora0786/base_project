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
  const clientUrl = process.env.CLIENT_URL;
  app.enableCors({
    origin: (origin, callback) => {
      if (!origin || origin.startsWith('http://localhost:') || origin === clientUrl) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type, Accept, Authorization',
  });

  const port = process.env.PORT || 4000;
  await app.listen(port, '0.0.0.0');
  console.log(`Application is running on: http://0.0.0.0:${port}/api`);
}
bootstrap();
