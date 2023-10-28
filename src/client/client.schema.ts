import { printers } from '@app/printer/printer.schema';
import { users } from '@app/user/user.schema';
import { createId } from '@paralleldrive/cuid2';
import { relations, sql } from 'drizzle-orm';
import { mysqlTable, varchar, timestamp } from 'drizzle-orm/mysql-core';

export const clients = mysqlTable('clients', {
  id: varchar('id', { length: 24 })
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
  privateKey: varchar('private_key', { length: 1652 }),
  certificatePem: varchar('certificate_pem', { length: 1204 }),
  certificateId: varchar('certificate_id', { length: 64 }).unique(),
  printerId: varchar('printer_id', { length: 24 }).unique(),
  userId: varchar('user_id', { length: 24 }).unique(),
});

export const clientRelations = relations(clients, ({ one }) => ({
  printer: one(printers, {
    fields: [clients.printerId],
    references: [printers.id],
  }),
  user: one(users, {
    fields: [clients.userId],
    references: [users.id],
  }),
}));
