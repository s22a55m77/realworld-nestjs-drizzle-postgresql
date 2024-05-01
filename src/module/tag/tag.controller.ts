import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { TagService } from 'src/module/tag/tag.service';
import { CreateTagDTO, GetTagsRO } from 'src/module/tag/tag.dto';

@ApiTags('tags')
@Controller('tags')
export class TagController {
  constructor(private readonly tagService: TagService) {}

  @Get()
  @ApiResponse({ status: 200, type: GetTagsRO })
  async getTags(): Promise<GetTagsRO> {
    const tags = await this.tagService.getTags();
    return { tags };
  }

  @Post()
  async createTag(@Body() createTagDTO: CreateTagDTO) {
    return this.tagService.createTag(createTagDTO);
  }
}
