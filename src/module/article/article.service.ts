import { Injectable, NotFoundException } from '@nestjs/common';
import {
  InferInsertModel,
  SQL,
  and,
  desc,
  eq,
  inArray,
  sql,
} from 'drizzle-orm';
import {
  article,
  articles,
  articlesFavorites,
  articlesTags,
  comments,
  followings,
  tags,
  users,
  type user,
} from 'src/drizzle/schema';
import {
  CreateArticleDTO,
  CreateArticleRO,
  DeleteArticleRO,
  FavoriteArticleRO,
  GetArticleRO,
  ListArticlesQueryDTO,
  ListArticlesRO,
  UnfavoriteArticleRO,
  UpdateArticleDTO,
  UpdateArticleRO,
} from 'src/module/article/article.dto';
import {
  CreateCommentDTO,
  CreateCommentRO,
  DeleteCommentRO,
  GetCommentsRO,
} from 'src/module/article/comment.dto';
import { DrizzleService } from 'src/module/db/drizzle.service';

@Injectable()
export class ArticleService {
  constructor(private readonly drizzleService: DrizzleService) {}

  private async getArticles(where: SQL[], limit: number, offset: number) {
    const withArticles = this.drizzleService.client.$with('withArticles').as(
      this.drizzleService.client
        .select({
          id: sql<number>`distinct on (articles.id) articles.id`.as('id'),
          slug: articles.slug,
          title: articles.title,
          description: articles.description,
          body: articles.body,
          createdAt: articles.createdAt,
          updatedAt: articles.updatedAt,
          authorId: articles.authorId,
        })
        .from(articles)
        .leftJoin(users, eq(articles.authorId, users.id))
        .leftJoin(followings, eq(followings.followingId, users.id))
        .leftJoin(articlesTags, eq(articlesTags.articleId, articles.id))
        .leftJoin(tags, eq(articlesTags.tagId, tags.id))
        .leftJoin(
          articlesFavorites,
          eq(articlesFavorites.articleId, articles.id),
        )
        .where(and(...where))
        .limit(limit)
        .offset(offset)
        .orderBy(desc(articles.id)),
    );

    const articleList = await this.drizzleService.client
      .with(withArticles)
      .select()
      .from(withArticles);

    const articleIds = articleList.map((article) => article.id);

    const tagList =
      articleIds.length > 0
        ? await this.drizzleService.client
            .select({
              articleId: articlesTags.articleId,
              tags: sql<
                string[]
              >`jsonb_agg("tags"."name" order by "tags"."id" desc)`.as('tags'),
            })
            .from(articlesTags)
            .leftJoin(tags, eq(articlesTags.tagId, tags.id))
            .where(inArray(articlesTags.articleId, articleIds))
            .groupBy(articlesTags.articleId)
        : [];

    const favoriteList =
      articleIds.length > 0
        ? await this.drizzleService.client
            .select({
              articleId: articlesFavorites.articleId,
              users: sql<number[]>`jsonb_agg(articles_favorites.user_id)`.as(
                'users',
              ),
            })
            .from(articlesFavorites)
            .where(inArray(articlesFavorites.articleId, articleIds))
            .groupBy(articlesFavorites.articleId)
        : [];

    const authorIds = articleList.map((article) => article.authorId);

    const authorList =
      authorIds.length > 0
        ? await this.drizzleService.client
            .select({
              id: users.id,
              username: users.username,
              bio: users.bio,
              image: users.image,
              followers: sql<number[]>`jsonb_agg(followings.follower_id)`.as(
                'followers',
              ),
            })
            .from(users)
            .leftJoin(followings, eq(followings.followingId, users.id))
            .groupBy(users.id)
            .where(inArray(users.id, authorIds))
        : [];

    const articlesCount = await this.drizzleService.client
      .with(withArticles)
      .select({
        count: sql<number>`count(distinct id)`,
      })
      .from(withArticles)
      .then((count) => count[0].count);

    const result = articleList.map((article) => {
      const tags = tagList.find((tag) => tag.articleId === article.id)?.tags;
      const favorites = favoriteList.find(
        (favorite) => favorite.articleId === article.id,
      )?.users;
      const author = authorList.find(
        (author) => author.id === article.authorId,
      );

      return {
        ...article,
        tagList: tags,
        favorites: favorites?.map((userId) => ({ userId })),
        author,
      };
    });

    return { result, articlesCount };
  }

  async listArticles(
    query: ListArticlesQueryDTO,
    user: user | undefined,
  ): Promise<ListArticlesRO> {
    const where: SQL[] = [];

    if (query.tag) {
      where.push(eq(tags.name, query.tag));
    }

    if (query.author) {
      where.push(eq(users.username, query.author));
    }

    if (query.favorited) {
      const userId = await this.drizzleService.client.query.users
        .findFirst({
          where: eq(users.username, query.favorited),
        })
        .then((user) => user?.id);

      where.push(eq(articlesFavorites.userId, userId ?? 0));
    }

    const { result, articlesCount } = await this.getArticles(
      where,
      query.limit,
      query.offset,
    );

    return {
      articles: result.map((article) => ({
        id: article.id,
        slug: article.slug,
        title: article.title,
        description: article.description,
        body: article.body,
        createdAt: article.createdAt,
        updatedAt: article.updatedAt,
        tagList: article.tagList ?? [],
        favorited: user
          ? !!article.favorites?.find((item) => item.userId === user?.id)
          : false,
        favoritesCount: article.favorites?.length ?? 0,
        author: {
          bio: article.author!.bio,
          image: article.author!.image,
          username: article.author!.username,
          following: user?.id
            ? article.author!.followers?.includes(user.id)
            : false,
        },
      })),
      articlesCount: +articlesCount,
    };
  }

  async feedArticles(query: ListArticlesQueryDTO, user: user) {
    const where: SQL[] = [];

    if (query.tag) {
      where.push(eq(tags.name, query.tag));
    }

    if (query.author) {
      where.push(eq(users.username, query.author));
    }

    if (query.favorited) {
      const userId = await this.drizzleService.client.query.users
        .findFirst({
          where: eq(users.username, query.favorited),
        })
        .then((user) => user?.id);

      where.push(eq(articlesFavorites.userId, userId ?? 0));
    }

    where.push(eq(followings.followerId, user.id));

    const { result, articlesCount } = await this.getArticles(
      where,
      query.limit,
      query.offset,
    );

    return {
      articles: result.map((article) => ({
        id: article.id,
        slug: article.slug,
        title: article.title,
        description: article.description,
        body: article.body,
        createdAt: article.createdAt,
        updatedAt: article.updatedAt,
        tagList: article.tagList ?? [],
        favorited: user
          ? !!article.favorites?.find((item) => item.userId === user?.id)
          : false,
        favoritesCount: article.favorites?.length ?? 0,
        author: {
          bio: article.author!.bio,
          image: article.author!.image,
          username: article.author!.username,
          following: user?.id
            ? article.author!.followers?.includes(user.id)
            : false,
        },
      })),
      articlesCount: +articlesCount,
    };
  }

  async updateArticle(
    slug: string,
    body: UpdateArticleDTO,
    user: user,
  ): Promise<UpdateArticleRO> {
    // check user is author
    const article = await this.drizzleService.client.query.articles
      .findMany({
        where: and(eq(articles.slug, slug), eq(articles.authorId, user.id)),
      })
      .then((articles) => articles[0]);

    if (!article) throw new NotFoundException('Article not found');

    const newArticle: Partial<
      Pick<
        InferInsertModel<typeof articles>,
        'slug' | 'title' | 'body' | 'description'
      >
    > = {
      ...body.article,
      slug: body.article?.title
        ? body.article.title.toLowerCase().replace(/ /g, '-')
        : undefined,
    };

    // update
    await this.drizzleService.client
      .update(articles)
      .set({
        ...newArticle,
      })
      .where(eq(articles.id, article.id));

    return this.getArticle(newArticle.slug ?? slug, user);
  }

  async getArticle(
    slug: string,
    user: user | undefined,
  ): Promise<GetArticleRO> {
    const article = await this.drizzleService.client.query.articles
      .findMany({
        with: {
          author: true,
          tagList: {
            with: {
              tag: true,
            },
          },
          favorites: true,
        },
        where: eq(articles.slug, slug),
      })
      .then((articles) => articles[0]);

    if (!article) throw new NotFoundException('Article not found');

    return {
      article: {
        ...article,
        tagList: article.tagList.map((tag) => tag.tag.name),
        favorited: !!article.favorites.find(
          (favorite) => favorite.userId === user?.id,
        ),
        favoritesCount: article.favorites.length,
        author: {
          username: article.author.username,
          bio: article.author.bio,
          image: article.author.image,
          following: false,
        },
      },
    };
  }

  async createArticle(
    createArticleDTO: CreateArticleDTO,
    user: user,
  ): Promise<CreateArticleRO> {
    const article = await this.drizzleService.client
      .insert(articles)
      .values({
        authorId: user.id,
        slug: createArticleDTO.article.title.toLowerCase().replace(/ /g, '-'),
        ...createArticleDTO.article,
      })
      .returning()
      .then((articles) => articles[0]);

    const articleTags = await this.drizzleService.client
      .insert(tags)
      .values(createArticleDTO.article.tagList.map((tag) => ({ name: tag })))
      .onConflictDoUpdate({
        target: tags.name,
        set: { name: sql`excluded.name` },
      })
      .returning();

    await this.drizzleService.client.insert(articlesTags).values(
      articleTags.map((tag) => ({
        articleId: article.id,
        tagId: tag.id,
      })),
    );

    return {
      article: {
        ...article,
        tagList: articleTags.map((tag) => tag.name),
        favorited: false,
        favoritesCount: 0,
        author: {
          username: user.username,
          bio: user.bio,
          image: user.image,
          following: false,
        },
      },
    };
  }

  async deleteArticle(slug: string, user: user): Promise<DeleteArticleRO> {
    const article = await this.drizzleService.client
      .delete(articles)
      .where(and(eq(articles.slug, slug), eq(articles.authorId, user.id)))
      .returning()
      .then((articles) => articles[0]);

    if (!article) throw new NotFoundException('Article not found');

    return { article };
  }

  private async getArticleIdBySlug(slug: string): Promise<article> {
    const article = await this.drizzleService.client.query.articles.findFirst({
      where: eq(articles.slug, slug),
    });

    if (!article) throw new NotFoundException('Article not found');

    return article!;
  }

  async createComment(
    slug: string,
    createCommentDTO: CreateCommentDTO,
    user: user,
  ): Promise<CreateCommentRO> {
    const article = await this.getArticleIdBySlug(slug);

    const comment = await this.drizzleService.client
      .insert(comments)
      .values({
        articleId: article.id,
        authorId: user.id,
        body: createCommentDTO.comment.body,
      })
      .returning()
      .then((comments) => comments[0]);

    return {
      comment: {
        ...comment,
        author: {
          username: user.username,
          bio: user.bio,
          image: user.image,
          following: false,
        },
      },
    };
  }

  async getComments(
    slug: string,
    user: user | undefined,
  ): Promise<GetCommentsRO> {
    const article = await this.getArticleIdBySlug(slug);

    const commentList =
      await this.drizzleService.client.query.comments.findMany({
        with: {
          author: {
            with: {
              follower: true,
            },
          },
        },
        where: eq(comments.articleId, article.id),
      });

    return {
      comments: commentList.map((comment) => ({
        ...comment,
        author: {
          username: comment.author.username,
          bio: comment.author.bio,
          image: comment.author.image,
          following: user
            ? !!comment.author.follower.find(
                (follower) => follower.followerId === user?.id,
              )
            : false,
        },
      })),
    };
  }

  async deleteComment(
    slug: string,
    id: number,
    user: user,
  ): Promise<DeleteCommentRO> {
    const article = await this.getArticleIdBySlug(slug);

    const comment = await this.drizzleService.client
      .delete(comments)
      .where(
        and(
          eq(comments.id, id),
          eq(comments.articleId, article.id),
          eq(comments.authorId, user.id),
        ),
      )
      .returning()
      .then((comments) => comments[0]);

    if (!comment) throw new NotFoundException('Comment not found');

    return {
      comment: {
        ...comment,
        author: {
          bio: user.bio,
          image: user.image,
          username: user.username,
          following: false,
        },
      },
    };
  }

  async favoriteArticle(slug: string, user: user): Promise<FavoriteArticleRO> {
    const article = await this.getArticleIdBySlug(slug);

    await this.drizzleService.client
      .insert(articlesFavorites)
      .values({
        articleId: article.id,
        userId: user.id,
      })
      .onConflictDoNothing();

    return this.getArticle(slug, user);
  }

  async unfavoriteArticle(
    slug: string,
    user: user,
  ): Promise<UnfavoriteArticleRO> {
    const article = await this.getArticleIdBySlug(slug);

    await this.drizzleService.client
      .delete(articlesFavorites)
      .where(
        and(
          eq(articlesFavorites.articleId, article.id),
          eq(articlesFavorites.userId, user.id),
        ),
      );
    return this.getArticle(slug, user);
  }
}
