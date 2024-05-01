import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { users } from '../../drizzle/schema';
import { z } from 'zod';

export const selectUserSchema = createSelectSchema(users);
export const insertUserSchema = createInsertSchema(users);

export const profileSchema = z.object({
  profile: selectUserSchema
    .pick({
      username: true,
      bio: true,
      image: true,
    })
    .and(
      z.object({
        following: z.boolean(),
      }),
    ),
});
