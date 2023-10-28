import { createId } from '@paralleldrive/cuid2';
import { relations, sql } from 'drizzle-orm';
import { boolean, mysqlTable, timestamp, varchar } from 'drizzle-orm/mysql-core';

import { clients } from '@app/client/client.schema';
import { users } from '@app/user/user.schema';

export const printers = mysqlTable('printers', {
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
  name: varchar('first_name', { length: 255 }).default('').notNull(),
  userId: varchar('user_id', { length: 128 }).unique(),
  clientId: varchar('client_id', { length: 128 }).unique(),
  hardwareId: varchar('hardware_id', { length: 128 }),
});

export const printerConfigs = mysqlTable('printer_configs', {
  id: varchar('id', { length: 128 })
    .$defaultFn(() => createId())
    .primaryKey(),
  createdAt: timestamp('created_at')
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  heatedBed: boolean('heated_bed').default(true),
  printerId: varchar('printer_id', { length: 128 }).unique(),
});

export const printerConfigRelations = relations(printerConfigs, ({ one }) => ({
  printer: one(printers, {
    fields: [printerConfigs.printerId],
    references: [printers.id],
  }),
}));

export const printerRelations = relations(printers, ({ one, many }) => ({
  user: one(users, {
    fields: [printers.userId],
    references: [users.id],
  }),
  clients: many(clients),
}));
