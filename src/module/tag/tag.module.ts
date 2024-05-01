import { Module } from '@nestjs/common';
import { TagController } from 'src/module/tag/tag.controller';
import { TagService } from 'src/module/tag/tag.service';

@Module({
  imports: [],
  controllers: [TagController],
  providers: [TagService],
})
export class TagModule {}
