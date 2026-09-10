import { Injectable, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
import { PrismaService } from '../../database/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import * as argon2 from 'argon2';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {}

  async register(dto: RegisterDto) {
    const user = await this.usersService.create(dto);
    const tokens = await this.getTokens(user.id, user.email, user.role.name);
    await this.updateRtHash(user.id, tokens.refreshToken);

    return {
      message: 'User registered successfully',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        profile_image: (user as any).profile_image,
      },
      ...tokens,
    };
  }

  async login(dto: LoginDto, userAgent?: string, ipAddress?: string) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const passwordMatches = await argon2.verify(user.password, dto.password);
    if (!passwordMatches) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const tokens = await this.getTokens(user.id, user.email, user.role.name);
    await this.updateRtHash(user.id, tokens.refreshToken);

    return {
      message: 'Login successful',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        profile_image: (user as any).profile_image,
      },
      ...tokens,
    };
  }

  async logout(userId: string, refreshToken: string) {
    await this.prisma.user.update({
      where: { id: userId },
      data: { refresh_token: null },
    });

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // Blacklist for 7 days
    await this.prisma.blacklistedToken.create({
      data: {
        token: refreshToken,
        expires_at: expiresAt,
      },
    });
  }

  async refreshTokens(userId: string, refreshToken: string, userAgent?: string, ipAddress?: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { role: true },
    });
    if (!user || !user.refresh_token) {
      throw new ForbiddenException('Access Denied: Invalid Session');
    }

    const matches = await argon2.verify(user.refresh_token, refreshToken);
    if (!matches) {
      throw new ForbiddenException('Access Denied: Invalid Session');
    }

    const tokens = await this.getTokens(user.id, user.email, user.role.name);
    await this.updateRtHash(user.id, tokens.refreshToken);

    return tokens;
  }

  async updateRtHash(userId: string, refreshToken: string, userAgent?: string, ipAddress?: string) {
    const hashedRt = await argon2.hash(refreshToken);
    await this.prisma.user.update({
      where: { id: userId },
      data: { refresh_token: hashedRt },
    });
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new UnauthorizedException('User not found');

    // Check phone uniqueness (only if provided and different)
    if (dto.phone && dto.phone !== user.phone) {
      const existing = await this.prisma.user.findFirst({
        where: { phone: dto.phone, NOT: { id: userId } },
      });
      if (existing) {
        throw new ForbiddenException('Phone number already in use by another account');
      }
    }

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.phone !== undefined && { phone: dto.phone || null }),
        ...(dto.gender !== undefined && { gender: dto.gender || null }),
        ...(dto.about !== undefined && { about: dto.about || null }),
        ...(dto.address !== undefined && { address: dto.address as any }),
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        gender: true,
        about: true,
        address: true,
        profile_image: true,
        is_active: true,
        role: { select: { id: true, name: true } },
        updated_at: true,
      },
    });

    return updated;
  }

  async updateProfileImage(userId: string, imageUrl: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new UnauthorizedException('User not found');

    if (user.profile_image) {
      try {
        const parts = user.profile_image.split('/uploads/');
        if (parts[1]) {
          const oldFilePath = path.join(process.cwd(), 'uploads', parts[1]);
          if (fs.existsSync(oldFilePath)) {
            fs.unlinkSync(oldFilePath);
          }
        }
      } catch (err) {
        // Disk cleanup failure shouldn't abort update
      }
    }

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: { profile_image: imageUrl },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        gender: true,
        about: true,
        address: true,
        profile_image: true,
        is_active: true,
        role: { select: { id: true, name: true } },
        updated_at: true,
      },
    });

    return updated;
  }

  async deleteProfileImage(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new UnauthorizedException('User not found');

    if (user.profile_image) {
      try {
        const parts = user.profile_image.split('/uploads/');
        if (parts[1]) {
          const filePath = path.join(process.cwd(), 'uploads', parts[1]);
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
        }
      } catch (err) {
        // Ignore file delete errors
      }
    }

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: { profile_image: null },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        gender: true,
        about: true,
        address: true,
        profile_image: true,
        is_active: true,
        role: { select: { id: true, name: true } },
        updated_at: true,
      },
    });

    return updated;
  }

  async changePassword(userId: string, dto: ChangePasswordDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new UnauthorizedException('User not found');

    const passwordMatches = await argon2.verify(user.password, dto.oldPassword);
    if (!passwordMatches) {
      throw new ForbiddenException('Invalid current password');
    }

    const hashedNewPassword = await argon2.hash(dto.newPassword);
    await this.prisma.user.update({
      where: { id: userId },
      data: { password: hashedNewPassword },
    });

    return { message: 'Password changed successfully' };
  }

  async getTokens(userId: string, email: string, role: string) {
    const jwtPayload = {
      sub: userId,
      email,
      role,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(jwtPayload, {
        secret: this.configService.get<string>('auth.jwtAccessSecret'),
        expiresIn: this.configService.get<string>('auth.jwtAccessExpiry'),
      }),
      this.jwtService.signAsync(jwtPayload, {
        secret: this.configService.get<string>('auth.jwtRefreshSecret'),
        expiresIn: this.configService.get<string>('auth.jwtRefreshExpiry'),
      }),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }
}
