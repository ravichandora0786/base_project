import { Injectable, NotFoundException, ConflictException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateAppModuleDto } from './dto/create-app-module.dto';
import { UpdateAppModuleDto } from './dto/update-app-module.dto';
import { EventsGateway } from '../events/events.gateway';

@Injectable()
export class AppModulesService {
  constructor(
    private prisma: PrismaService,
    private eventsGateway: EventsGateway,
  ) {}

  async create(dto: CreateAppModuleDto) {
    const rawDisplayName = dto.display_name.trim().replace(/[^a-zA-Z\s]/g, '');
    const name = (dto.name || rawDisplayName)
      .toLowerCase()
      .trim()
      .replace(/[^a-z\s_]/g, '')
      .replace(/\s+/g, '_');

    const existing = await this.prisma.module.findUnique({
      where: { name },
    });
    if (existing) {
      throw new ConflictException(`Module with key '${name}' already exists`);
    }

    // Auto-calculate sort_order: find max sort_order in database, and assign next
    const maxModule = await this.prisma.module.findFirst({
      orderBy: { sort_order: 'desc' },
      select: { sort_order: true },
    });
    const nextSortOrder = maxModule && typeof maxModule.sort_order === 'number' ? maxModule.sort_order + 1 : 0;
    const route = dto.route?.trim() ? dto.route.trim() : `/${name.replace(/_/g, '-')}`;

    const created = await this.prisma.module.create({
      data: {
        name,
        display_name: rawDisplayName,
        is_active: dto.is_active ?? true,
        icon: dto.icon || null,
        route,
        sort_order: nextSortOrder,
      },
    });

    // Automatically grant all permissions of this new module to Admin role
    try {
      const adminRole = await this.prisma.role.findFirst({
        where: { name: { equals: 'admin', mode: 'insensitive' } },
      });
      if (adminRole) {
        const allPermissions = await this.prisma.permission.findMany();
        const permissionIds = allPermissions.map((p) => p.id);
        const mappingName = `admin_${name}_mapping`;
        await this.prisma.rolePermission.upsert({
          where: { name: mappingName },
          update: { permission_ids: permissionIds },
          create: {
            name: mappingName,
            role_id: adminRole.id,
            module_id: created.id,
            permission_ids: permissionIds,
          },
        });
      }
    } catch (err) {
      console.error('Failed to auto-assign new module permissions to Admin role', err);
    }

    this.eventsGateway.emitPermissionsUpdated({});
    return created;
  }

  async findAll(query?: {
    search?: string;
    isActive?: string | boolean;
    page?: number;
    pageSize?: number;
  }) {
    const where: any = {};
    const conditions: any[] = [];

    if (query?.search && typeof query.search === 'string' && query.search.trim() !== '') {
      const search = query.search.trim();
      conditions.push({
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { display_name: { contains: search, mode: 'insensitive' } },
          { route: { contains: search, mode: 'insensitive' } },
        ],
      });
    }

    if (
      query?.isActive !== undefined &&
      query?.isActive !== null &&
      query?.isActive !== '' &&
      query?.isActive !== 'all'
    ) {
      const isActiveStr = String(query.isActive).toLowerCase();
      if (isActiveStr === 'true' || isActiveStr === '1') {
        conditions.push({ is_active: true });
      } else if (isActiveStr === 'false' || isActiveStr === '0') {
        conditions.push({ is_active: false });
      }
    }

    if (conditions.length > 0) {
      where.AND = conditions;
    }

    const hasPagination = query?.page !== undefined || query?.pageSize !== undefined;
    if (hasPagination) {
      const page = Math.max(1, Number(query?.page) || 1);
      const pageSize = Math.max(1, Number(query?.pageSize) || 10);
      const skip = (page - 1) * pageSize;
      const take = pageSize;

      const [data, total] = await Promise.all([
        this.prisma.module.findMany({
          where,
          skip,
          take,
          orderBy: { sort_order: 'asc' },
        }),
        this.prisma.module.count({ where }),
      ]);

      return {
        data,
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      };
    }

    return this.prisma.module.findMany({
      where,
      orderBy: { sort_order: 'asc' },
    });
  }

  async findOne(id: string) {
    const module = await this.prisma.module.findUnique({
      where: { id },
    });
    if (!module) throw new NotFoundException('Module not found');
    return module;
  }

  async update(id: string, dto: UpdateAppModuleDto) {
    const currentModule = await this.findOne(id);
    let name: string | undefined = undefined;

    if (dto.display_name || dto.name) {
      const cleanDisplayName = dto.display_name ? dto.display_name.trim().replace(/[^a-zA-Z\s]/g, '') : undefined;
      name = (dto.name || cleanDisplayName || currentModule.name)
        .toLowerCase()
        .trim()
        .replace(/[^a-z\s_]/g, '')
        .replace(/\s+/g, '_');

      const existing = await this.prisma.module.findFirst({
        where: { name, NOT: { id } },
      });
      if (existing) {
        throw new ConflictException(`Module key '${name}' already taken`);
      }
    }

    const updated = await this.prisma.module.update({
      where: { id },
      data: {
        display_name: dto.display_name !== undefined ? dto.display_name.trim() : currentModule.display_name,
        name: name || currentModule.name,
        is_active: dto.is_active !== undefined ? dto.is_active : currentModule.is_active,
        icon: dto.icon !== undefined ? dto.icon : currentModule.icon,
        route: dto.route !== undefined ? (dto.route ? dto.route.trim() : null) : currentModule.route,
        // Sort order cannot be edited - preserved
        sort_order: currentModule.sort_order,
      },
    });

    this.eventsGateway.emitPermissionsUpdated({});
    return updated;
  }

  async remove(id: string) {
    const currentModule = await this.findOne(id);

    const systemModules = ['dashboard', 'user', 'role', 'permission', 'module'];
    if (systemModules.includes(currentModule.name.toLowerCase())) {
      throw new ForbiddenException(
        `System module '${currentModule.display_name || currentModule.name}' cannot be deleted`,
      );
    }

    // 1. Explicitly delete all role_permissions related to this module for all roles
    await this.prisma.rolePermission.deleteMany({
      where: { module_id: id },
    });

    // 2. Delete the module itself
    const result = await this.prisma.module.delete({
      where: { id },
    });

    // 3. Emit real-time notification to update permissions and sidebar across all connected clients
    this.eventsGateway.emitPermissionsUpdated({});
    return result;
  }
}
