import { createZodDto } from 'nestjs-zod';
import {
  articleSchema,
  createArticleSchema,
  deleteArticleSchema,
  listArticlesQuerySchema,
  listArticlesSchema,
  updateArticleSchema,
} from 'src/module/article/article.schema';

export class CreateArticleDTO extends createZodDto(createArticleSchema) {}

export class CreateArticleRO extends createZodDto(articleSchema) {}

export class GetArticleRO extends createZodDto(articleSchema) {}

export class ListArticlesRO extends createZodDto(listArticlesSchema) {}

export class ListArticlesQueryDTO extends createZodDto(
  listArticlesQuerySchema,
) {}

export class UpdateArticleDTO extends createZodDto(updateArticleSchema) {}

export class UpdateArticleRO extends createZodDto(articleSchema) {}

export class DeleteArticleRO extends createZodDto(deleteArticleSchema) {}

export class FavoriteArticleRO extends createZodDto(articleSchema) {}

export class UnfavoriteArticleRO extends createZodDto(articleSchema) {}
