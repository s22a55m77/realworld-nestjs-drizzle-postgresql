import { SetMetadata, UseGuards, applyDecorators } from '@nestjs/common';
import { ApiSecurity } from '@nestjs/swagger';
import { AuthGuard } from 'src/module/auth/auth.guard';

interface AuthOptions {
  isPublic?: boolean;
}

export function Auth(options?: AuthOptions): MethodDecorator {
  return applyDecorators(
    UseGuards(AuthGuard),
    ApiSecurity('JWT'),
    SetMetadata('isPublic', options?.isPublic),
  );
}
