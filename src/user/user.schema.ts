import { createId } from '@paralleldrive/cuid2';
import { getTableColumns, relations, sql } from 'drizzle-orm';
import { mysqlTable, text, timestamp, varchar } from 'drizzle-orm/mysql-core';

import { clients } from '@app/client/client.schema';
import { printers } from '@app/printer/printer.schema';

export const users = mysqlTable('users', {
  id: varchar('id', { length: 128 })
    .$defaultFn(() => createId())
    .primaryKey(),
  createdAt: timestamp('created_at')
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: timestamp('updated_at')
    .default(sql`CURRENT_TIMESTAMP`)
    .onUpdateNow()
    .notNull(),
  deletedAt: timestamp('deleted_at'),
  firstName: varchar('first_name', { length: 255 }).default('').notNull(),
  lastName: varchar('last_name', { length: 255 }).default('').notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  password: varchar('password', { length: 255 }).notNull(),
  emailVerified: timestamp('email_verified'),
  imageUrl: text('image').default(''),
  identityId: varchar('identity_id', { length: 128 }).unique(),
  apiKey: varchar('api_key', { length: 128 })
    .$defaultFn(() => createId())
    .notNull()
    .unique(),
});

const { password, ...restUserColumns } = getTableColumns(users);
export const userColumns = restUserColumns;

export const usersRelations = relations(users, ({ many }) => ({
  printers: many(printers),
  clients: many(clients),
}));
