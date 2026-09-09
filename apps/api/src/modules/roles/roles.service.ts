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

  async findAll() {
    return this.prisma.role.findMany();
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
