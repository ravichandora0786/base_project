import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateRolePermissionDto } from './dto/create-role-permission.dto';
import { UpdateRolePermissionDto } from './dto/update-role-permission.dto';

@Injectable()
export class RolePermissionsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateRolePermissionDto) {
    const existing = await this.prisma.rolePermission.findUnique({
      where: { name: dto.name },
    });
    if (existing) {
      throw new ConflictException('Role-Permission mapping already exists with this name');
    }
    return this.prisma.rolePermission.create({
      data: {
        name: dto.name,
        role_id: dto.role_id,
        module_id: dto.module_id,
        permission_ids: dto.permission_ids,
      },
    });
  }

  async findAll() {
    return this.prisma.rolePermission.findMany({
      include: {
        role: true,
        module: true,
      },
    });
  }

  async findOne(id: string) {
    const mapping = await this.prisma.rolePermission.findUnique({
      where: { id },
      include: {
        role: true,
        module: true,
      },
    });
    if (!mapping) throw new NotFoundException('Mapping not found');
    return mapping;
  }

  async update(id: string, dto: UpdateRolePermissionDto) {
    await this.findOne(id);
    if (dto.name) {
      const existing = await this.prisma.rolePermission.findFirst({
        where: { name: dto.name, NOT: { id } },
      });
      if (existing) {
        throw new ConflictException('Mapping name already taken');
      }
    }
    return this.prisma.rolePermission.update({
      where: { id },
      data: {
        name: dto.name,
        role_id: dto.role_id,
        module_id: dto.module_id,
        permission_ids: dto.permission_ids,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.rolePermission.delete({
      where: { id },
    });
  }
}
