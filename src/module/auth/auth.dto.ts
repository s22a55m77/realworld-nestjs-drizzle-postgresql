import { createZodDto } from 'nestjs-zod';
import {
  authenticatedUserSchema,
  loginSchema,
  registerSchema,
  updateUserSchema,
} from 'src/module/auth/auth.schema';

export class AuthenticatedUserRO extends createZodDto(
  authenticatedUserSchema,
) {}

export class LoginDTO extends createZodDto(loginSchema) {}

export class RegisterDTO extends createZodDto(registerSchema) {}

export class UpdateUserDTO extends createZodDto(updateUserSchema) {}
