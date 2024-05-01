import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { user, users } from 'src/drizzle/schema';
import {
  AuthenticatedUserRO,
  LoginDTO,
  RegisterDTO,
  UpdateUserDTO,
} from 'src/module/auth/auth.dto';
import { DrizzleService } from 'src/module/db/drizzle.service';
import { hash, compare } from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private readonly drizzleService: DrizzleService,
    private readonly jwtService: JwtService,
  ) {}

  async login(loginDTO: LoginDTO): Promise<AuthenticatedUserRO> {
    const { user: credentials } = loginDTO;

    const user = await this.drizzleService.client.query.users.findFirst({
      where: eq(users.email, credentials.email),
    });

    if (!user) {
      throw new BadRequestException('Invalid email or password');
    }

    const isPasswordValid = await compare(credentials.password, user.password);

    if (!isPasswordValid) {
      throw new BadRequestException('Invalid email or password');
    }

    const token = this.jwtService.sign({ sub: user.id });

    return {
      user: {
        email: user.email,
        username: user.username,
        bio: user.bio,
        image: user.image,
        token,
      },
    };
  }

  async register(registerDTO: RegisterDTO): Promise<AuthenticatedUserRO> {
    const { user: credentials } = registerDTO;

    const hashedPassword = await hash(credentials.password, 10);

    const user = await this.drizzleService.client
      .insert(users)
      .values({
        ...credentials,
        password: hashedPassword,
      })
      .returning()
      .then((result) => result[0])
      .catch((error) => {
        if (error.constraint === 'users_username_unique')
          throw new BadRequestException('Email already exists');
        throw new InternalServerErrorException();
      });

    const token = this.jwtService.sign({ sub: user.id });

    return {
      user: {
        email: user.email,
        username: user.username,
        bio: user.bio,
        image: user.image,
        token,
      },
    };
  }

  async getCurrentUser(user: user): Promise<AuthenticatedUserRO> {
    const token = this.jwtService.sign({ sub: user.id });

    return {
      user: {
        ...user,
        token,
      },
    };
  }

  async updateCurrentUser(
    id: number,
    updateCurrentUser: UpdateUserDTO,
  ): Promise<AuthenticatedUserRO> {
    const { user } = updateCurrentUser;

    if (user.password) user.password = await hash(user.password, 10);

    const updatedUser = await this.drizzleService.client
      .update(users)
      .set({
        ...user,
      })
      .where(eq(users.id, id))
      .returning()
      .then((result) => {
        return result[0];
      });

    const token = this.jwtService.sign({ sub: id });

    return {
      user: {
        email: updatedUser.email,
        username: updatedUser.username,
        bio: updatedUser.bio,
        image: updatedUser.image,
        token,
      },
    };
  }
}
