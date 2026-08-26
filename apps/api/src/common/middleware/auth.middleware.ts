import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../../modules/users/users.service';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
    private readonly prisma: PrismaService,
  ) {}

  async use(req: Request & { user?: any; token?: string }, res: Response, next: NextFunction) {
    let token = '';

    // Extract from Authorization Header
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } else if (req.cookies && req.cookies['access_token']) {
      // Also check for cookie support
      token = req.cookies['access_token'];
    }

    if (!token) {
      throw new UnauthorizedException('Authentication token is required');
    }

    try {
      // Verify JWT token
      const payload = this.jwtService.verify(token, {
        secret: process.env.JWT_SECRET,
      });

      // Check if token is blacklisted
      const isBlacklisted = await this.prisma.blacklistedToken.findUnique({
        where: { token },
      });
      if (isBlacklisted) {
        throw new UnauthorizedException('Authentication token has been revoked');
      }

      // Fetch user from DB
      const user = await this.usersService.findByEmail(payload.email);
      if (!user) {
        throw new UnauthorizedException('User does not exist');
      }

      // Attach user and token to request
      req.user = { id: user.id, email: user.email, role: user.role.name };
      req.token = token;

      next();
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Invalid authentication token');
    }
  }
}
