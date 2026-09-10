import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './database/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { RolesModule } from './modules/roles/roles.module';
import { PermissionsModule } from './modules/permissions/permissions.module';
import { AppModulesModule } from './modules/app-modules/app-modules.module';
import { RolePermissionsModule } from './modules/role-permissions/role-permissions.module';
import { EventsModule } from './modules/events/events.module';
import appConfig from './config/app.config';
import authConfig from './config/auth.config';
import databaseConfig from './config/database.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: process.env.NODE_ENV === 'production'
        ? ['apps/api/.env.production', '.env.production']
        : ['apps/api/.env.development', '.env.development'],
      load: [appConfig, authConfig, databaseConfig],
    }),
    PrismaModule,
    EventsModule,
    AuthModule,
    UsersModule,
    RolesModule,
    PermissionsModule,
    AppModulesModule,
    RolePermissionsModule,
  ],
})
export class AppModule {}
