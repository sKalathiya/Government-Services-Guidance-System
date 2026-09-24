import { CanActivate, ForbiddenException, Injectable } from '@nestjs/common';

import { Reflector } from '@nestjs/core';
import { UserRole } from '../../user/entities/user.entity';
import { ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext) {
    const permittedRoles = this.reflector.getAllAndOverride<UserRole[]>(
      'roles',
      [context.getHandler(), context.getClass()],
    );
    if (!permittedRoles?.length) {
      return true;
    }
    const request = context.switchToHttp().getRequest();
    const user = request.user as { role: UserRole } | undefined;
    if (!user) {
      throw new ForbiddenException('Missing authenticated user');
    }
    return permittedRoles.includes(user.role);
  }
}
