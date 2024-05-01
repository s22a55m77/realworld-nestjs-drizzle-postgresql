import { Injectable, NotFoundException } from '@nestjs/common';
import { and, eq } from 'drizzle-orm';
import { followings, users, type user } from 'src/drizzle/schema';
import { DrizzleService } from 'src/module/db/drizzle.service';
import { FollowUserRO, GetProfileRO } from 'src/module/profile/profile.dto';

@Injectable()
export class ProfileService {
  constructor(private readonly drizzleService: DrizzleService) {}

  async getProfile(
    username: string,
    user: user | undefined,
  ): Promise<GetProfileRO> {
    const userProfile = await this.drizzleService.client.query.users
      .findMany({
        where: eq(users.username, username),
        with: {
          follower: true,
        },
      })
      .then((users) => users[0]);

    if (!userProfile) throw new NotFoundException('User not found');

    return {
      profile: {
        username: userProfile.username,
        bio: userProfile.bio,
        image: userProfile.image,
        following: user
          ? !!userProfile.follower.find(
              (follower) => follower.followerId === user.id,
            )
          : false,
      },
    };
  }

  async followUser(username: string, user: user): Promise<FollowUserRO> {
    const userProfile = await this.drizzleService.client.query.users
      .findMany({
        where: eq(users.username, username),
      })
      .then((users) => users[0]);

    if (!userProfile) throw new NotFoundException('User not found');

    await this.drizzleService.client.insert(followings).values({
      followingId: userProfile.id,
      followerId: user.id,
    });

    return {
      profile: {
        username: userProfile.username,
        bio: userProfile.bio,
        image: userProfile.image,
        following: true,
      },
    };
  }

  async unfollowUser(username: string, user: user): Promise<FollowUserRO> {
    const userProfile = await this.drizzleService.client.query.users
      .findMany({
        where: eq(users.username, username),
      })
      .then((users) => users[0]);

    if (!userProfile) throw new NotFoundException('User not found');

    await this.drizzleService.client
      .delete(followings)
      .where(
        and(
          eq(followings.followingId, userProfile.id),
          eq(followings.followerId, user.id),
        ),
      );

    return {
      profile: {
        username: userProfile.username,
        bio: userProfile.bio,
        image: userProfile.image,
        following: false,
      },
    };
  }
}
