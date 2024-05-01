import { Injectable } from '@nestjs/common';
import { tags } from 'src/drizzle/schema';
import { DrizzleService } from 'src/module/db/drizzle.service';
import { insertTagSchema, selectTagSchema } from 'src/module/tag/tag.schema';
import { z } from 'zod';

@Injectable()
export class TagService {
  constructor(private readonly drizzleService: DrizzleService) {}

  getTags(): Promise<z.infer<typeof selectTagSchema>[]> {
    return this.drizzleService.client.select().from(tags);
  }

  async createTag(
    tag: z.infer<typeof insertTagSchema>,
  ): Promise<z.infer<typeof selectTagSchema>> {
    const rows = await this.drizzleService.client
      .insert(tags)
      .values(tag)
      .returning({
        id: tags.id,
        name: tags.name,
      });
    return rows[0];
  }
}
