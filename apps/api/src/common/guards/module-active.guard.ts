import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../../database/prisma.service';
import { MODULE_KEY, BYPASS_MODULE_ACTIVE_KEY } from '../decorators/module-key.decorator';

@Injectable()
export class ModuleActiveGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isBypassed = this.reflector.getAllAndOverride<boolean>(BYPASS_MODULE_ACTIVE_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isBypassed) {
      return true;
    }

    const req = context.switchToHttp().getRequest();
    const user = req.user;
    if (!user) return true;

    // Admin has super privileges: active or inactive makes no difference to Admin!
    if (user.role?.toLowerCase() === 'admin') {
      return true;
    }

    const moduleKey = this.reflector.getAllAndOverride<string>(MODULE_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!moduleKey) {
      return true;
    }

    // Check if module is active in database
    const mod = await this.prisma.module.findFirst({
      where: {
        OR: [
          { name: { equals: moduleKey, mode: 'insensitive' } },
          { route: { equals: `/${moduleKey}`, mode: 'insensitive' } },
          { route: { equals: `/${moduleKey}s`, mode: 'insensitive' } },
        ],
      },
      select: { is_active: true, display_name: true, name: true },
    });

    if (mod && !mod.is_active) {
      throw new ForbiddenException(
        `The '${mod.display_name || mod.name}' module is currently inactive and cannot be accessed.`
      );
    }

    return true;
  }
}
