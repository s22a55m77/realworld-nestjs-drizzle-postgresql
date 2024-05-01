import { createZodDto } from 'nestjs-zod';
import { profileSchema } from 'src/module/profile/profile.schema';

export class GetProfileRO extends createZodDto(profileSchema) {}

export class FollowUserRO extends createZodDto(profileSchema) {}

export class UnfollowUserRO extends createZodDto(profileSchema) {}
