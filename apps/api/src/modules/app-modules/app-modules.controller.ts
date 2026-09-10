import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { AppModulesService } from './app-modules.service';
import { CreateAppModuleDto } from './dto/create-app-module.dto';
import { UpdateAppModuleDto } from './dto/update-app-module.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { RoleEnum } from '../../common/constants/enums';

@Controller('modules')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AppModulesController {
  constructor(private readonly appModulesService: AppModulesService) {}

  @Roles(RoleEnum.ADMIN)
  @Post()
  create(@Body() createAppModuleDto: CreateAppModuleDto) {
    return this.appModulesService.create(createAppModuleDto);
  }

  @Get()
  findAll(
    @Query('search') search?: string,
    @Query('is_active') isActive?: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('limit') limit?: string,
  ) {
    return this.appModulesService.findAll({
      search,
      isActive,
      page: page ? Number(page) : undefined,
      pageSize: pageSize ? Number(pageSize) : (limit ? Number(limit) : undefined),
    });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.appModulesService.findOne(id);
  }

  @Roles(RoleEnum.ADMIN)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAppModuleDto: UpdateAppModuleDto) {
    return this.appModulesService.update(id, updateAppModuleDto);
  }

  @Roles(RoleEnum.ADMIN)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.appModulesService.remove(id);
  }
}
