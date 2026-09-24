import { createParamDecorator } from '@nestjs/common';
import { ExecutionContext } from '@nestjs/common';
import { UserRole } from '../../user/entities/user.entity';

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): { sub: string; role: UserRole } => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
