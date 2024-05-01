import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { users } from 'src/drizzle/schema';
import { z } from 'zod';

export const selectUserSchema = createSelectSchema(users).pick({
  email: true,
  username: true,
  bio: true,
  image: true,
});

export const authenticatedUserSchema = z.object({
  user: selectUserSchema.and(
    z.object({
      token: z.string(),
    }),
  ),
});

export const authUserSchema = selectUserSchema.and(
  z.object({
    id: z.number(),
  }),
);

export const insertUserSchema = createInsertSchema(users);

export const loginSchema = z.object({
  user: insertUserSchema.pick({
    email: true,
    password: true,
  }),
});

export const registerSchema = z.object({
  user: insertUserSchema
    .pick({
      email: true,
      username: true,
      password: true,
    })
    .and(z.object({ email: z.string().email() })),
});

export const updateUserSchema = z.object({
  user: insertUserSchema
    .pick({
      email: true,
      username: true,
      password: true,
      image: true,
      bio: true,
    })
    .partial(),
});
