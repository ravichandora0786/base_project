import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';

@Injectable()
export class PermissionsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreatePermissionDto) {
    const existing = await this.prisma.permission.findUnique({
      where: { name: dto.name.toLowerCase() },
    });
    if (existing) {
      throw new ConflictException('Permission already exists');
    }
    return this.prisma.permission.create({
      data: {
        name: dto.name.toLowerCase(),
        code: dto.code ? dto.code.toUpperCase() : dto.name.toUpperCase(),
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

    const hasPagination = query?.page !== undefined || query?.pageSize !== undefined;
    if (hasPagination) {
      const page = Math.max(1, Number(query?.page) || 1);
      const pageSize = Math.max(1, Number(query?.pageSize) || 10);
      const skip = (page - 1) * pageSize;
      const take = pageSize;

      const [data, total] = await Promise.all([
        this.prisma.permission.findMany({
          where,
          skip,
          take,
          orderBy: { created_at: 'desc' },
        }),
        this.prisma.permission.count({ where }),
      ]);

      return {
        data,
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      };
    }

    return this.prisma.permission.findMany({
      where,
      orderBy: { created_at: 'desc' },
    });
  }

  async findOne(id: string) {
    const permission = await this.prisma.permission.findUnique({
      where: { id },
    });
    if (!permission) throw new NotFoundException('Permission not found');
    return permission;
  }

  async update(id: string, dto: UpdatePermissionDto) {
    await this.findOne(id);
    if (dto.name) {
      const existing = await this.prisma.permission.findFirst({
        where: { name: dto.name.toLowerCase(), NOT: { id } },
      });
      if (existing) {
        throw new ConflictException('Permission name already taken');
      }
    }
    return this.prisma.permission.update({
      where: { id },
      data: {
        ...dto,
        name: dto.name ? dto.name.toLowerCase() : undefined,
        code: dto.code ? dto.code.toUpperCase() : undefined,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.permission.delete({
      where: { id },
    });
  }
}
