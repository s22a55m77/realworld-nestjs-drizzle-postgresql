import {
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
} from '@nestjs/common';
import { ProfileService } from './profile.service';
import { ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import {
  FollowUserRO,
  GetProfileRO,
  UnfollowUserRO,
} from 'src/module/profile/profile.dto';
import { Auth } from 'src/module/auth/auth.decorator';
import { AuthUser } from 'src/module/auth/auth-user.decorator';
import { type user } from 'src/drizzle/schema';

@ApiTags('profiles')
@Controller('profiles')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @ApiResponse({ status: 200, type: GetProfileRO })
  @ApiParam({ name: 'username', type: String })
  @Get(':username')
  getProfile(
    @Param('username') username: string,
    @AuthUser() user: user | undefined,
  ): Promise<GetProfileRO> {
    return this.profileService.getProfile(username, user);
  }

  @ApiResponse({ status: 200, type: FollowUserRO })
  @ApiParam({ name: 'username', type: String })
  @Auth()
  @Post(':username/follow')
  @HttpCode(200)
  followUser(
    @Param('username') username: string,
    @AuthUser() user: user,
  ): Promise<FollowUserRO> {
    return this.profileService.followUser(username, user);
  }

  @ApiResponse({ status: 200, type: UnfollowUserRO })
  @ApiParam({ name: 'username', type: String })
  @Auth()
  @Delete(':username/follow')
  unfollowUser(
    @Param('username') username: string,
    @AuthUser() user: user,
  ): Promise<UnfollowUserRO> {
    return this.profileService.unfollowUser(username, user);
  }
}
