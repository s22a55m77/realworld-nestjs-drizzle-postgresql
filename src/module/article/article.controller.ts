import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ArticleService } from './article.service';
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
  ApiBody,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuthUser } from 'src/module/auth/auth-user.decorator';
import { type user } from 'src/drizzle/schema';
import { Auth } from 'src/module/auth/auth.decorator';
import {
  CreateCommentDTO,
  CreateCommentRO,
  DeleteCommentRO,
  GetCommentsRO,
} from 'src/module/article/comment.dto';

@ApiTags('articles')
@Controller('articles')
export class ArticleController {
  constructor(private readonly articleService: ArticleService) {}

  @ApiResponse({ status: 200, type: ListArticlesRO })
  @ApiQuery({ name: 'tag', type: String, required: false })
  @ApiQuery({ name: 'author', type: String, required: false })
  @ApiQuery({ name: 'favorited', type: String, required: false })
  @ApiQuery({ name: 'limit', type: Number, required: false })
  @ApiQuery({ name: 'offset', type: Number, required: false })
  @Auth({ isPublic: true })
  @Get()
  listArticles(
    @Query() query: ListArticlesQueryDTO,
    @AuthUser() user: user | undefined,
  ): Promise<ListArticlesRO> {
    return this.articleService.listArticles(query, user);
  }

  @ApiResponse({ status: 200, type: ListArticlesRO })
  @ApiQuery({ name: 'tag', type: String, required: false })
  @ApiQuery({ name: 'author', type: String, required: false })
  @ApiQuery({ name: 'favorited', type: String, required: false })
  @ApiQuery({ name: 'limit', type: Number, required: false })
  @ApiQuery({ name: 'offset', type: Number, required: false })
  @Auth()
  @Get('feed')
  feedArticles(
    @Query() query: ListArticlesQueryDTO,
    @AuthUser() user: user,
  ): Promise<ListArticlesRO> {
    return this.articleService.feedArticles(query, user);
  }

  @ApiResponse({ status: 200, type: UpdateArticleRO })
  @ApiBody({ type: UpdateArticleDTO })
  @ApiParam({ name: 'slug', type: String })
  @Auth()
  @Put(':slug')
  updateArticle(
    @Param('slug') slug: string,
    @Body() updateArticleDTO: UpdateArticleDTO,
    @AuthUser() user: user,
  ): Promise<UpdateArticleRO> {
    return this.articleService.updateArticle(slug, updateArticleDTO, user);
  }

  @ApiResponse({ status: 200, type: GetArticleRO })
  @ApiParam({ name: 'slug', type: String })
  @Auth({ isPublic: true })
  @Get(':slug')
  getArticle(
    @Param('slug') slug: string,
    @AuthUser() user: user | undefined,
  ): Promise<GetArticleRO> {
    return this.articleService.getArticle(slug, user);
  }

  @ApiResponse({ status: 201, type: CreateArticleRO })
  @ApiBody({ type: CreateArticleDTO })
  @Auth()
  @Post()
  createArticle(
    @Body() createArticleDTO: CreateArticleDTO,
    @AuthUser() user: user,
  ): Promise<CreateArticleRO> {
    return this.articleService.createArticle(createArticleDTO, user);
  }

  @ApiResponse({ status: 200, type: DeleteArticleRO })
  @Auth()
  @Delete(':slug')
  deleteArticle(
    @Param('slug') slug: string,
    @AuthUser() user: user,
  ): Promise<DeleteArticleRO> {
    return this.articleService.deleteArticle(slug, user);
  }

  @ApiResponse({ status: 201, type: CreateCommentRO })
  @ApiBody({ type: CreateCommentDTO })
  @ApiParam({ name: 'slug', type: String })
  @Auth()
  @Post(':slug/comments')
  createComment(
    @Param('slug') slug: string,
    @Body() createCommentDTO: CreateCommentDTO,
    @AuthUser() user: user,
  ): Promise<CreateCommentRO> {
    return this.articleService.createComment(slug, createCommentDTO, user);
  }

  @ApiResponse({ status: 200, type: GetCommentsRO })
  @ApiParam({ name: 'slug', type: String })
  @Auth({ isPublic: true })
  @Get(':slug/comments')
  getComments(
    @Param('slug') slug: string,
    @AuthUser() user: user | undefined,
  ): Promise<GetCommentsRO> {
    return this.articleService.getComments(slug, user);
  }

  @ApiResponse({ status: 200, type: DeleteCommentRO })
  @ApiParam({ name: 'slug', type: String })
  @ApiParam({ name: 'id', type: Number })
  @Auth()
  @Delete(':slug/comments/:id')
  deleteComment(
    @Param('slug') slug: string,
    @Param('id') id: number,
    @AuthUser() user: user,
  ): Promise<DeleteCommentRO> {
    return this.articleService.deleteComment(slug, id, user);
  }

  @ApiResponse({ status: 200, type: FavoriteArticleRO })
  @ApiParam({ name: 'slug', type: String })
  @Auth()
  @Post(':slug/favorite')
  favoriteArticle(
    @Param('slug') slug: string,
    @AuthUser() user: user,
  ): Promise<FavoriteArticleRO> {
    return this.articleService.favoriteArticle(slug, user);
  }

  @ApiResponse({ status: 200, type: UnfavoriteArticleRO })
  @ApiParam({ name: 'slug', type: String })
  @Auth()
  @Delete(':slug/favorite')
  unfavoriteArticle(
    @Param('slug') slug: string,
    @AuthUser() user: user,
  ): Promise<UnfavoriteArticleRO> {
    return this.articleService.unfavoriteArticle(slug, user);
  }
}
