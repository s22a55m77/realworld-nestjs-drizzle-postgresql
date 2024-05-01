import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { comments } from 'src/drizzle/schema';
import { z } from 'zod';

const selectCommentSchema = createSelectSchema(comments);

const insertCommentSchema = createInsertSchema(comments);

export const commentSchema = z.object({
  comment: selectCommentSchema.omit({ authorId: true, articleId: true }).and(
    z.object({
      author: z.object({
        username: z.string(),
        bio: z.string(),
        image: z.string(),
        following: z.boolean(),
      }),
    }),
  ),
});

export const createCommentSchema = z.object({
  comment: insertCommentSchema.pick({ body: true }),
});

export const commentsSchema = z.object({
  comments: z.array(commentSchema.shape.comment),
});
