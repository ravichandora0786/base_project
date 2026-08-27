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

  async bulkSave(roleId: string, rolePermissions: { moduleId: string; permissionIds: string[] }[]) {
    // 1. Fetch the role to make sure it exists and to get its name
    const role = await this.prisma.role.findUnique({
      where: { id: roleId },
    });
    if (!role) throw new NotFoundException('Role not found');

    // 2. Fetch all modules to get their names
    const allModules = await this.prisma.module.findMany();
    const moduleMap = new Map(allModules.map((m) => [m.id, m.name]));

    // 3. Keep track of moduleIds that are in the input payload and have permissions selected
    const inputModuleIds = new Set(rolePermissions.map((rp) => rp.moduleId));

    // 4. Load all existing database mappings for this role
    const existingMappings = await this.prisma.rolePermission.findMany({
      where: { role_id: roleId },
    });

    // 5. Sync/save the input rolePermissions items
    for (const rp of rolePermissions) {
      const moduleName = moduleMap.get(rp.moduleId) || 'unknown';
      const name = `${role.name.toLowerCase()}_${moduleName.toLowerCase()}_mapping`;
      
      const existing = existingMappings.find((em) => em.module_id === rp.moduleId);
      
      if (rp.permissionIds.length > 0) {
        if (existing) {
          // Update mapping in db
          await this.prisma.rolePermission.update({
            where: { id: existing.id },
            data: {
              name,
              permission_ids: rp.permissionIds,
            },
          });
        } else {
          // Create new mapping in db
          await this.prisma.rolePermission.create({
            data: {
              name,
              role_id: roleId,
              module_id: rp.moduleId,
              permission_ids: rp.permissionIds,
            },
          });
        }
      } else {
        // If permissionIds is empty, delete mapping from db if it exists
        if (existing) {
          await this.prisma.rolePermission.delete({
            where: { id: existing.id },
          });
        }
      }
    }

    // 6. Delete any existing mappings in db for this role for modules that were completely omitted from input rolePermissions
    const omittedMappings = existingMappings.filter((em) => !inputModuleIds.has(em.module_id));
    for (const om of omittedMappings) {
      await this.prisma.rolePermission.delete({
        where: { id: om.id },
      });
    }

    return { success: true };
  }
}
