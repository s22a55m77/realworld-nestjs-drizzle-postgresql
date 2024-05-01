import { Body, Controller, Get, HttpCode, Post, Put } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiBody, ApiResponse, ApiTags } from '@nestjs/swagger';
import {
  AuthenticatedUserRO,
  LoginDTO,
  RegisterDTO,
  UpdateUserDTO,
} from 'src/module/auth/auth.dto';
import { AuthUser } from 'src/module/auth/auth-user.decorator';
import { Auth } from 'src/module/auth/auth.decorator';
import { type user } from 'src/drizzle/schema';

@ApiTags('auth')
@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiResponse({ status: 200, description: 'Login', type: AuthenticatedUserRO })
  @ApiBody({ type: LoginDTO })
  @Post('users/login')
  @HttpCode(200)
  login(@Body() loginDTO: LoginDTO): Promise<AuthenticatedUserRO> {
    return this.authService.login(loginDTO);
  }

  @ApiResponse({
    status: 201,
    description: 'Register',
    type: AuthenticatedUserRO,
  })
  @ApiBody({ type: RegisterDTO })
  @Post('users')
  register(@Body() registerDTO: RegisterDTO): Promise<AuthenticatedUserRO> {
    return this.authService.register(registerDTO);
  }

  @ApiResponse({
    status: 200,
    description: 'Get current user',
    type: AuthenticatedUserRO,
  })
  @Auth()
  @Get('user')
  getCurrentUser(@AuthUser() user: user): Promise<AuthenticatedUserRO> {
    return this.authService.getCurrentUser(user);
  }

  @ApiResponse({
    status: 200,
    description: 'Update current user',
    type: AuthenticatedUserRO,
  })
  @ApiBody({ type: UpdateUserDTO })
  @Auth()
  @Put('user')
  updateCurrentUser(
    @AuthUser() user: user,
    @Body() updateUserDTO: UpdateUserDTO,
  ): Promise<AuthenticatedUserRO> {
    return this.authService.updateCurrentUser(user.id, updateUserDTO);
  }
}
