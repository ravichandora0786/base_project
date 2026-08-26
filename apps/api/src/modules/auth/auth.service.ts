import { Injectable, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
import { PrismaService } from '../../database/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import * as argon2 from 'argon2';

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
