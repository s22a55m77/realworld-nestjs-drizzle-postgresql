import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { tags } from 'src/drizzle/schema';

export const insertTagSchema = createInsertSchema(tags);

export const selectTagSchema = createSelectSchema(tags);
