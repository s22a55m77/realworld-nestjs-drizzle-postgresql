import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { articles } from 'src/drizzle/schema';
import { z } from 'zod';

const selectArticleSchema = createSelectSchema(articles);

const insertArticleSchema = createInsertSchema(articles);

export const createArticleSchema = z.object({
  article: insertArticleSchema
    .pick({
      title: true,
      description: true,
      body: true,
    })
    .and(
      z.object({
        tagList: z.array(z.string()),
      }),
    ),
});

export const articleSchema = z.object({
  article: selectArticleSchema.omit({ authorId: true }).and(
    z.object({
      tagList: z.array(z.string()),
      favorited: z.boolean(),
      favoritesCount: z.number(),
      author: z.object({
        username: z.string(),
        bio: z.string(),
        image: z.string(),
        following: z.boolean(),
      }),
    }),
  ),
});

export const listArticlesSchema = z.object({
  articles: z.array(articleSchema.shape.article),
  articlesCount: z.number(),
});

export const listArticlesQuerySchema = z.object({
  tag: z.string().optional(),
  author: z.string().optional(),
  favorited: z.string().optional(),
  limit: z.number().optional().default(20),
  offset: z.number().optional().default(0),
});

export const updateArticleSchema = z.object({
  article: z.object({
    title: insertArticleSchema.shape.title.optional(),
    description: insertArticleSchema.shape.description,
    body: insertArticleSchema.shape.body,
  }),
});

export const deleteArticleSchema = z.object({
  article: selectArticleSchema,
});
