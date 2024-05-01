import { ExecutionContext, createParamDecorator } from '@nestjs/common';
import { type user } from 'src/drizzle/schema';

export function AuthUser() {
  return createParamDecorator(
    (_: unknown, context: ExecutionContext): user | undefined => {
      const request = context.switchToHttp().getRequest();
      return request.user as user;
    },
  )();
}
