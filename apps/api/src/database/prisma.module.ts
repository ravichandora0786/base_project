import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { ModuleActiveGuard } from '../common/guards/module-active.guard';

@Global()
@Module({
  providers: [PrismaService, ModuleActiveGuard],
  exports: [PrismaService, ModuleActiveGuard],
})
export class PrismaModule {}

