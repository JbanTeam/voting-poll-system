import { Request } from 'express';
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentUser = createParamDecorator((data: unknown, ctx: ExecutionContext): Express.User | undefined => {
  const request = ctx.switchToHttp().getRequest<Request>();
  return request.user;
});
