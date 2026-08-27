import { Injectable, ConflictException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { RegisterDto } from '../auth/dto/register.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as argon2 from 'argon2';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
      include: { role: true },
    });
  }

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        gender: true,
        profile_image: true,
        about: true,
        address: true,
        is_active: true,
        role: {
          select: {
            id: true,
            name: true,
            rolePermissions: {
              select: {
                module_id: true,
                module: {
                  select: {
                    name: true,
                  },
                },
                permission_ids: true,
              },
            },
          },
        },
        created_at: true,
        updated_at: true,
      },
    });
    if (!user) throw new NotFoundException('User not found');

    // Fetch all active permissions to map IDs to Codes
    const allPermissions = await this.prisma.permission.findMany({
      where: { is_active: true },
      select: { id: true, code: true },
    });

    const permissionMap = new Map(allPermissions.map((p) => [p.id, p.code]));

    // Format permissions as a Record<string, string[]> mapped by module name
    const permissions: Record<string, string[]> = {};

    if (user.role?.name?.toLowerCase() === 'admin') {
      permissions['*'] = ['*'];
    } else {
      user.role?.rolePermissions?.forEach((rp: any) => {
        if (!rp.module?.name) return;
        const ids = Array.isArray(rp.permission_ids) ? rp.permission_ids : [];
        const codes = ids
          .map((pid: string) => permissionMap.get(pid))
          .filter((c): c is string => !!c);
        permissions[rp.module.name] = codes;
      });
    }

    const { role, ...userData } = user;
    return {
      ...userData,
      role: {
        id: role.id,
        name: role.name,
      },
      permissions,
    };
  }

  async create(dto: RegisterDto) {
    const existing = await this.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException('User with this email already exists');
    }

    if ((dto as any).phone && String((dto as any).phone).trim() !== '') {
      const existingPhone = await this.prisma.user.findFirst({
        where: { phone: String((dto as any).phone) },
      });
      if (existingPhone) {
        throw new ConflictException('Phone number already in use');
      }
    }

    const hashedPassword = await argon2.hash(dto.password);
    const roleName = dto.role ? String(dto.role).toLowerCase() : 'user';

    let role = await this.prisma.role.findUnique({
      where: { name: roleName },
    });

    if (!role) {
      role = await this.prisma.role.create({
        data: { name: roleName },
      });
    }

    return this.prisma.user.create({
      data: {
        email: dto.email,
        password: hashedPassword,
        name: dto.name,
        role_id: role.id,
        phone: dto.phone || null,
        gender: dto.gender,
        address: dto.address,
        date_of_birth: dto.date_of_birth ? new Date(dto.date_of_birth) : null,
        about: dto.about,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: {
          select: {
            id: true,
            name: true,
          },
        },
        created_at: true,
      },
    });
  }

  async findAll() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        gender: true,
        profile_image: true,
        is_active: true,
        role: {
          select: {
            id: true,
            name: true,
          },
        },
        created_at: true,
      },
    });
  }

  async update(id: string, dto: UpdateUserDto, isAdmin: boolean = false) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });
    if (!user) throw new NotFoundException('User not found');

    // Restrict changing roles to admins only
    if (dto.role_id && dto.role_id !== user.role_id && !isAdmin) {
      throw new ForbiddenException('Only administrators can change user roles');
    }

    if (dto.email) {
      const existing = await this.prisma.user.findFirst({
        where: { email: dto.email, NOT: { id } },
      });
      if (existing) {
        throw new ConflictException('Email already in use');
      }
    }

    if (dto.phone && dto.phone.trim() !== '') {
      const existing = await this.prisma.user.findFirst({
        where: { phone: dto.phone, NOT: { id } },
      });
      if (existing) {
        throw new ConflictException('Phone number already in use');
      }
    }

    return this.prisma.user.update({
      where: { id },
      data: {
        name: dto.name,
        email: dto.email,
        phone: dto.phone || null,
        gender: dto.gender,
        profile_image: dto.profile_image,
        about: dto.about,
        is_active: dto.is_active,
        role_id: dto.role_id,
        address: dto.address,
        date_of_birth: dto.date_of_birth ? new Date(dto.date_of_birth) : null,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: {
          select: {
            id: true,
            name: true,
          },
        },
        updated_at: true,
      },
    });
  }

  async updateStatus(id: string, isActive: boolean) {
    await this.findById(id);
    return this.prisma.user.update({
      where: { id },
      data: { is_active: isActive },
      select: {
        id: true,
        email: true,
        name: true,
        is_active: true,
        role: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  async remove(id: string) {
    await this.findById(id);
    return this.prisma.user.delete({
      where: { id },
    });
  }
}
