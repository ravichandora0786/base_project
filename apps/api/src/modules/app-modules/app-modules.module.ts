import { Module } from '@nestjs/common';
import { AppModulesService } from './app-modules.service';
import { AppModulesController } from './app-modules.controller';

@Module({
  controllers: [AppModulesController],
  providers: [AppModulesService],
  exports: [AppModulesService],
})
export class AppModulesModule {}
