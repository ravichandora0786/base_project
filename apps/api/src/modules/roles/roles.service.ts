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
    });
  }

  async findOne(id: string) {
    const role = await this.prisma.role.findUnique({
      where: { id },
    });
    if (!role) throw new NotFoundException('Role not found');
    return role;
  }

  async update(id: string, dto: UpdateRoleDto) {
    const role = await this.findOne(id);
    if (role.name.toLowerCase() === 'admin') {
      if (dto.is_active === false) {
        throw new ConflictException('Admin role cannot be deactivated');
      }
      if (dto.name && dto.name.toLowerCase() !== 'admin') {
        throw new ConflictException('Admin role cannot be renamed');
      }
    }
    if (dto.name) {
      const existing = await this.prisma.role.findFirst({
        where: { name: dto.name.toLowerCase(), NOT: { id } },
      });
      if (existing) {
        throw new ConflictException('Role name already taken');
      }
    }
    return this.prisma.role.update({
      where: { id },
      data: {
        ...dto,
        name: dto.name ? dto.name.toLowerCase() : undefined,
      },
    });
  }

  async remove(id: string) {
    const role = await this.findOne(id);
    if (role.name.toLowerCase() === 'admin') {
      throw new ConflictException('Admin role cannot be deleted');
    }
    return this.prisma.role.delete({
      where: { id },
    });
  }
}
