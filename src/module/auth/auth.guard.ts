import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { eq } from 'drizzle-orm';
import { users } from 'src/drizzle/schema';
import { authUserSchema } from 'src/module/auth/auth.schema';
import { DrizzleService } from 'src/module/db/drizzle.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly drizzleService: DrizzleService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const isPublic = this.reflector.get<boolean>(
      'isPublic',
      context.getHandler(),
    );

    // get token from header
    const header = request.headers.authorization;

    if (!header) {
      return isPublic || false;
    }

    // extract bearer
    const token = header.split(' ')[1];

    if (!token) {
      return isPublic || false;
    }

    let payload;
    try {
      // verify token
      payload = this.jwtService.verify(token);
      if (!payload) {
        return isPublic || false;
      }
    } catch (error) {
      if (!isPublic) throw new UnauthorizedException('Invalid token');
    }

    // get user id from token
    const userId = payload.sub;

    // find user by id
    const user = await this.drizzleService.client.query.users.findFirst({
      where: eq(users.id, userId),
    });
    if (!user) {
      return isPublic || false;
    }

    const parsedUser = authUserSchema.parse(user);
    request.user = parsedUser;

    return true;
  }
}
