import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateAppModuleDto } from './dto/create-app-module.dto';
import { UpdateAppModuleDto } from './dto/update-app-module.dto';

@Injectable()
export class AppModulesService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateAppModuleDto) {
    const existing = await this.prisma.module.findUnique({
      where: { name: dto.name.toLowerCase() },
    });
    if (existing) {
      throw new ConflictException('Module already exists');
    }
    return this.prisma.module.create({
      data: {
        name: dto.name.toLowerCase(),
        display_name: dto.display_name,
        is_active: dto.is_active ?? true,
        icon: dto.icon || null,
        route: dto.route || null,
        sort_order: dto.sort_order ?? 0,
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
    await this.findOne(id);
    if (dto.name) {
      const existing = await this.prisma.module.findFirst({
        where: { name: dto.name.toLowerCase(), NOT: { id } },
      });
      if (existing) {
        throw new ConflictException('Module name already taken');
      }
    }
    return this.prisma.module.update({
      where: { id },
      data: {
        ...dto,
        name: dto.name ? dto.name.toLowerCase() : undefined,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.module.delete({
      where: { id },
    });
  }
}
