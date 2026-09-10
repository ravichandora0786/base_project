import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { ModuleActiveGuard } from '../../common/guards/module-active.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { ModuleKey } from '../../common/decorators/module-key.decorator';
import { RoleEnum } from '../../common/constants/enums';

@Controller('roles')
@UseGuards(JwtAuthGuard, RolesGuard, ModuleActiveGuard)
@ModuleKey('role')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Roles(RoleEnum.ADMIN)
  @Post()
  create(@Body() createRoleDto: CreateRoleDto) {
    return this.rolesService.create(createRoleDto);
  }

  @Get()
  findAll(
    @Query('search') search?: string,
    @Query('is_active') isActive?: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('limit') limit?: string,
  ) {
    return this.rolesService.findAll({
      search,
      isActive,
      page: page ? Number(page) : undefined,
      pageSize: pageSize ? Number(pageSize) : (limit ? Number(limit) : undefined),
    });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.rolesService.findOne(id);
  }

  @Roles(RoleEnum.ADMIN)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateRoleDto: UpdateRoleDto) {
    return this.rolesService.update(id, updateRoleDto);
  }

  @Roles(RoleEnum.ADMIN)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.rolesService.remove(id);
  }
}
