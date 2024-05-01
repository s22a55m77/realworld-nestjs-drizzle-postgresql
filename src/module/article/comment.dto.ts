import { createZodDto } from 'nestjs-zod';
import {
  commentSchema,
  commentsSchema,
  createCommentSchema,
} from 'src/module/article/comment.schema';

export class CreateCommentDTO extends createZodDto(createCommentSchema) {}

export class CreateCommentRO extends createZodDto(commentSchema) {}

export class GetCommentsRO extends createZodDto(commentsSchema) {}

export class DeleteCommentRO extends createZodDto(commentSchema) {}
