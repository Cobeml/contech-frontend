import { sql } from 'drizzle-orm';
import { pgPolicy, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { authenticatedRole } from 'drizzle-orm/supabase';

export const projectOverview = pgTable('project_overview', {
  projectId: uuid('project_id').primaryKey(),
  userId: text('user_id').notNull(),
  name: text('name').notNull(),
  image_url: text('image_url').notNull(),
  description: text('description').notNull(),
});
