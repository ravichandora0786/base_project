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

  async findAll() {
    return this.prisma.module.findMany({
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
