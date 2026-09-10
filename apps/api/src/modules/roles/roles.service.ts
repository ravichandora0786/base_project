import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';

@Injectable()
export class RolesService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateRoleDto) {
    const existing = await this.prisma.role.findUnique({
      where: { name: dto.name.toLowerCase() },
    });
    if (existing) {
      throw new ConflictException('Role already exists');
    }
    return this.prisma.role.create({
      data: {
        name: dto.name.toLowerCase(),
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
      conditions.push({
        name: { contains: query.search.trim(), mode: 'insensitive' },
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
        this.prisma.role.findMany({
          where,
          skip,
          take,
          orderBy: { created_at: 'desc' },
          include: {
            _count: {
              select: { users: true },
            },
          },
        }),
        this.prisma.role.count({ where }),
      ]);

      return {
        data,
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      };
    }

    return this.prisma.role.findMany({
      where,
      orderBy: { created_at: 'desc' },
      include: {
        _count: {
          select: { users: true },
        },
      },
    });
  }

  async findOne(id: string) {
    const role = await this.prisma.role.findUnique({
      where: { id },
      include: {
        _count: {
          select: { users: true },
        },
      },
    });
    if (!role) throw new NotFoundException('Role not found');
    return role;
  }

  async update(id: string, dto: UpdateRoleDto) {
    const role = await this.findOne(id);
    if (dto.name && dto.name.trim().toLowerCase() !== role.name.toLowerCase()) {
      throw new ConflictException('Role name cannot be edited');
    }
    if (role.name.toLowerCase() === 'admin') {
      if (dto.is_active === false) {
        throw new ConflictException('Admin role cannot be deactivated');
      }
    }
    if (dto.is_active === false) {
      const assignedUsersCount = await this.prisma.user.count({
        where: { role_id: id },
      });
      if (assignedUsersCount > 0) {
        throw new ConflictException(
          `Cannot deactivate role '${role.name}' because it is assigned to ${assignedUsersCount} user(s).`,
        );
      }
    }
    return this.prisma.role.update({
      where: { id },
      data: {
        is_active: dto.is_active !== undefined ? dto.is_active : role.is_active,
      },
    });
  }

  async remove(id: string) {
    const role = await this.findOne(id);
    if (role.name.toLowerCase() === 'admin') {
      throw new ConflictException('Admin role cannot be deleted');
    }
    const assignedUsersCount = await this.prisma.user.count({
      where: { role_id: id },
    });
    if (assignedUsersCount > 0) {
      throw new ConflictException(
        `Cannot delete role '${role.name}' because it is assigned to ${assignedUsersCount} user(s).`,
      );
    }
    return this.prisma.role.delete({
      where: { id },
    });
  }
}
