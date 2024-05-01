import { relations, type InferSelectModel } from 'drizzle-orm';
import {
  integer,
  pgTable,
  serial,
  text,
  timestamp,
  varchar,
} from 'drizzle-orm/pg-core';

export const tags = pgTable('tags', {
  id: serial('id').primaryKey().notNull(),
  name: varchar('name').notNull().unique(),
});

export const tagsRelations = relations(tags, ({ many }) => ({
  articles: many(articlesTags),
}));

export const users = pgTable('users', {
  id: serial('id').primaryKey().notNull(),
  username: varchar('username').notNull().unique(),
  email: varchar('email').notNull().unique(),
  bio: text('bio').notNull().default(''),
  image: text('image').notNull().default(''),
  password: varchar('password').notNull(),
});

export type user = InferSelectModel<typeof users>;

export const usersRelations = relations(users, ({ many }) => ({
  articles: many(articles),
  favorites: many(articlesFavorites),
  followings: many(followings, { relationName: 'following' }),
  follower: many(followings, { relationName: 'follower' }),
}));

export const articles = pgTable('articles', {
  id: serial('id').primaryKey().notNull(),
  slug: varchar('slug').notNull(),
  title: varchar('title').notNull(),
  description: varchar('description').notNull().default(''),
  body: text('body').notNull().default(''),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at')
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
  authorId: integer('author_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
});

export type article = InferSelectModel<typeof articles>;

export const articlesRelations = relations(articles, ({ one, many }) => ({
  author: one(users, {
    fields: [articles.authorId],
    references: [users.id],
  }),
  tagList: many(articlesTags),
  favorites: many(articlesFavorites),
  comments: many(comments),
}));

export const articlesTags = pgTable('articles_tags', {
  articleId: integer('article_id')
    .notNull()
    .references(() => articles.id, { onDelete: 'cascade' }),
  tagId: integer('tag_id')
    .notNull()
    .references(() => tags.id, { onDelete: 'cascade' }),
});

export const articleTagsRelations = relations(articlesTags, ({ one }) => ({
  article: one(articles, {
    fields: [articlesTags.articleId],
    references: [articles.id],
  }),
  tag: one(tags, {
    fields: [articlesTags.tagId],
    references: [tags.id],
  }),
}));

export const articlesFavorites = pgTable('articles_favorites', {
  articleId: integer('article_id')
    .notNull()
    .references(() => articles.id, { onDelete: 'cascade' }),
  userId: integer('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
});

export const articleFavoritesRelations = relations(
  articlesFavorites,
  ({ one }) => ({
    article: one(articles, {
      fields: [articlesFavorites.articleId],
      references: [articles.id],
    }),
    user: one(users, {
      fields: [articlesFavorites.userId],
      references: [users.id],
    }),
  }),
);

export const comments = pgTable('comments', {
  id: serial('id').primaryKey().notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at')
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
  body: text('body').notNull(),
  articleId: integer('article_id')
    .notNull()
    .references(() => articles.id, { onDelete: 'cascade' }),
  authorId: integer('author_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
});

export const commentsRelations = relations(comments, ({ one }) => ({
  article: one(articles, {
    fields: [comments.articleId],
    references: [articles.id],
  }),
  author: one(users, {
    fields: [comments.authorId],
    references: [users.id],
  }),
}));

export const followings = pgTable('followings', {
  followerId: integer('follower_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  followingId: integer('following_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
});

export const followingsRelations = relations(followings, ({ one }) => ({
  follower: one(users, {
    fields: [followings.followerId],
    references: [users.id],
    relationName: 'follower',
  }),
  following: one(users, {
    fields: [followings.followingId],
    references: [users.id],
    relationName: 'following',
  }),
}));
