import { ApiProperty } from '@nestjs/swagger';
import { createZodDto } from 'nestjs-zod';
import { insertTagSchema, selectTagSchema } from 'src/module/tag/tag.schema';

export class CreateTagDTO extends createZodDto(
  insertTagSchema.omit({ id: true }),
) {}

class Tag extends createZodDto(selectTagSchema) {}

export class GetTagsRO {
  @ApiProperty({ type: Tag, isArray: true })
  tags: Tag[];
}
