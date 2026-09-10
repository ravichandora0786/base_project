import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';

@Injectable()
export class PermissionsService {
  constructor(private prisma: PrismaService) {}

  private async getAssignedMappings(permissionId: string, permissionCode?: string | null) {
    const rolePermissions = await this.prisma.rolePermission.findMany({
      include: {
        role: true,
        module: true,
      },
    });

    return rolePermissions.filter((rp) => {
      if (!Array.isArray(rp.permission_ids)) return false;
      const pids = rp.permission_ids as string[];
      return pids.includes(permissionId) || (permissionCode ? pids.includes(permissionCode) : false);
    });
  }

  async create(dto: CreatePermissionDto) {
    const trimmedName = dto.name.trim();
    if (!/^[a-zA-Z\s]+$/.test(trimmedName)) {
      throw new BadRequestException('Permission name can only contain alphabets and spaces');
    }

    const code = (dto.code || trimmedName)
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '_');

    const existingName = await this.prisma.permission.findFirst({
      where: { name: { equals: trimmedName.toLowerCase(), mode: 'insensitive' } },
    });
    if (existingName) {
      throw new ConflictException('Permission name already exists');
    }

    const existingCode = await this.prisma.permission.findFirst({
      where: { code },
    });
    if (existingCode) {
      throw new ConflictException('Permission code already exists');
    }

    return this.prisma.permission.create({
      data: {
        name: trimmedName.toLowerCase(),
        code,
        is_active: dto.is_active ?? true,
      },
    });
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
          { code: { contains: search, mode: 'insensitive' } },
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

    // Fetch all rolePermissions to find assigned permissions
    const allRolePermissions = await this.prisma.rolePermission.findMany({
      select: { permission_ids: true },
    });
    const assignedIdsSet = new Set<string>();
    for (const rp of allRolePermissions) {
      if (Array.isArray(rp.permission_ids)) {
        for (const pid of rp.permission_ids as string[]) {
          if (typeof pid === 'string') {
            assignedIdsSet.add(pid);
          }
        }
      }
    }

    const attachAssigned = (p: any) => ({
      ...p,
      is_assigned: assignedIdsSet.has(p.id) || (p.code ? assignedIdsSet.has(p.code) : false),
    });

    const hasPagination = query?.page !== undefined || query?.pageSize !== undefined;
    if (hasPagination) {
      const page = Math.max(1, Number(query?.page) || 1);
      const pageSize = Math.max(1, Number(query?.pageSize) || 10);
      const skip = (page - 1) * pageSize;
      const take = pageSize;

      const [rawData, total] = await Promise.all([
        this.prisma.permission.findMany({
          where,
          skip,
          take,
          orderBy: { created_at: 'desc' },
        }),
        this.prisma.permission.count({ where }),
      ]);

      return {
        data: rawData.map(attachAssigned),
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      };
    }

    const rawData = await this.prisma.permission.findMany({
      where,
      orderBy: { created_at: 'desc' },
    });

    return rawData.map(attachAssigned);
  }

  async findOne(id: string) {
    const permission = await this.prisma.permission.findUnique({
      where: { id },
    });
    if (!permission) throw new NotFoundException('Permission not found');
    const assigned = await this.getAssignedMappings(permission.id, permission.code);
    return {
      ...permission,
      is_assigned: assigned.length > 0,
    };
  }

  async update(id: string, dto: UpdatePermissionDto) {
    const permission = await this.findOne(id);

    // Block deactivation if assigned to any module or role
    if (dto.is_active === false && permission.is_active === true) {
      const assigned = await this.getAssignedMappings(permission.id, permission.code);
      if (assigned.length > 0) {
        const roleNames = Array.from(new Set(assigned.map((a) => a.role?.name).filter(Boolean))).join(', ');
        const moduleNames = Array.from(new Set(assigned.map((a) => a.module?.display_name || a.module?.name).filter(Boolean))).join(', ');
        throw new ConflictException(
          `Cannot deactivate permission '${permission.name}' because it is assigned to role(s) [${roleNames}] in module(s) [${moduleNames}].`,
        );
      }
    }

    let code: string | undefined = undefined;
    let name: string | undefined = undefined;

    if (dto.name) {
      const trimmedName = dto.name.trim();
      if (!/^[a-zA-Z\s]+$/.test(trimmedName)) {
        throw new BadRequestException('Permission name can only contain alphabets and spaces');
      }
      name = trimmedName.toLowerCase();
      const existingName = await this.prisma.permission.findFirst({
        where: { name: { equals: name, mode: 'insensitive' }, NOT: { id } },
      });
      if (existingName) {
        throw new ConflictException('Permission name already taken');
      }

      code = trimmedName.toLowerCase().replace(/\s+/g, '_');
      const existingCode = await this.prisma.permission.findFirst({
        where: { code, NOT: { id } },
      });
      if (existingCode) {
        throw new ConflictException('Permission code already taken');
      }
    } else if (dto.code) {
      code = dto.code.toLowerCase().trim().replace(/\s+/g, '_');
      const existingCode = await this.prisma.permission.findFirst({
        where: { code, NOT: { id } },
      });
      if (existingCode) {
        throw new ConflictException('Permission code already taken');
      }
    }

    return this.prisma.permission.update({
      where: { id },
      data: {
        is_active: dto.is_active !== undefined ? dto.is_active : permission.is_active,
        name: name || undefined,
        code: code || undefined,
      },
    });
  }

  async remove(id: string) {
    const permission = await this.findOne(id);
    const assigned = await this.getAssignedMappings(permission.id, permission.code);
    if (assigned.length > 0) {
      const roleNames = Array.from(new Set(assigned.map((a) => a.role?.name).filter(Boolean))).join(', ');
      const moduleNames = Array.from(new Set(assigned.map((a) => a.module?.display_name || a.module?.name).filter(Boolean))).join(', ');
      throw new ConflictException(
        `Cannot delete permission '${permission.name}' because it is assigned to role(s) [${roleNames}] in module(s) [${moduleNames}].`,
      );
    }

    return this.prisma.permission.delete({
      where: { id },
    });
  }
}
