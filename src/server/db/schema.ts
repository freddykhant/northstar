import { relations } from "drizzle-orm";
import {
  index,
  uniqueIndex,
  pgTableCreator,
  primaryKey,
} from "drizzle-orm/pg-core";
import { type AdapterAccount } from "next-auth/adapters";

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const createTable = pgTableCreator((name) => `northstar_${name}`);

export const categories = createTable("category", (d) => ({
  id: d.varchar({ length: 50 }).primaryKey(), // 'mind', 'body', 'soul'
  color: d.varchar({ length: 50 }).notNull(), // 'blue', 'red', 'purple'
  createdAt: d
    .timestamp({ withTimezone: true })
    .$defaultFn(() => new Date())
    .notNull(),
}));

export const habits = createTable(
  "habit",
  (d) => ({
    id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
    userId: d
      .varchar({ length: 255 })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    categoryId: d
      .varchar({ length: 50 })
      .notNull()
      .references(() => categories.id),
    name: d.varchar({ length: 256 }).notNull(),
    description: d.text(),
    isActive: d.boolean().default(true).notNull(), // soft delete
    createdAt: d
      .timestamp({ withTimezone: true })
      .$defaultFn(() => new Date())
      .notNull(),
    updatedAt: d.timestamp({ withTimezone: true }).$onUpdate(() => new Date()),
  }),
  (t) => [
    index("habit_user_id_idx").on(t.userId),
    index("habit_category_id_idx").on(t.categoryId),
  ],
);

export const completions = createTable(
  "completion",
  (d) => ({
    id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
    habitId: d
      .integer()
      .notNull()
      .references(() => habits.id, { onDelete: "cascade" }),
    userId: d
      .varchar({ length: 255 })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    completedDate: d.date().notNull(), // just the date, not timestamp
    createdAt: d
      .timestamp({ withTimezone: true })
      .$defaultFn(() => new Date())
      .notNull(),
  }),
  (t) => [
    // Unique constraint: can't complete same habit twice on same date
    uniqueIndex("completion_unique_idx").on(
      t.habitId,
      t.completedDate,
      t.userId,
    ),
    index("completion_user_date_idx").on(t.userId, t.completedDate),
    index("completion_habit_idx").on(t.habitId),
  ],
);

// app schema relations

export const categoriesRelations = relations(categories, ({ many }) => ({
  habits: many(habits),
}));

export const habitsRelations = relations(habits, ({ one, many }) => ({
  user: one(users, {
    fields: [habits.userId],
    references: [users.id],
  }),
  category: one(categories, {
    fields: [habits.categoryId],
    references: [categories.id],
  }),
  completions: many(completions),
}));

export const completionsRelations = relations(completions, ({ one }) => ({
  habit: one(habits, {
    fields: [completions.habitId],
    references: [habits.id],
  }),
  user: one(users, {
    fields: [completions.userId],
    references: [users.id],
  }),
}));

// auth related schemas

export const users = createTable("user", (d) => ({
  id: d
    .varchar({ length: 255 })
    .notNull()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: d.varchar({ length: 255 }),
  email: d.varchar({ length: 255 }).notNull(),
  emailVerified: d
    .timestamp({
      mode: "date",
      withTimezone: true,
    })
    .$defaultFn(() => /* @__PURE__ */ new Date()),
  image: d.varchar({ length: 255 }),
}));

export const usersRelations = relations(users, ({ many }) => ({
  accounts: many(accounts),
}));

export const accounts = createTable(
  "account",
  (d) => ({
    userId: d
      .varchar({ length: 255 })
      .notNull()
      .references(() => users.id),
    type: d.varchar({ length: 255 }).$type<AdapterAccount["type"]>().notNull(),
    provider: d.varchar({ length: 255 }).notNull(),
    providerAccountId: d.varchar({ length: 255 }).notNull(),
    refresh_token: d.text(),
    access_token: d.text(),
    expires_at: d.integer(),
    token_type: d.varchar({ length: 255 }),
    scope: d.varchar({ length: 255 }),
    id_token: d.text(),
    session_state: d.varchar({ length: 255 }),
  }),
  (t) => [
    primaryKey({ columns: [t.provider, t.providerAccountId] }),
    index("account_user_id_idx").on(t.userId),
  ],
);

// auth relations

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, { fields: [accounts.userId], references: [users.id] }),
}));

export const sessions = createTable(
  "session",
  (d) => ({
    sessionToken: d.varchar({ length: 255 }).notNull().primaryKey(),
    userId: d
      .varchar({ length: 255 })
      .notNull()
      .references(() => users.id),
    expires: d.timestamp({ mode: "date", withTimezone: true }).notNull(),
  }),
  (t) => [index("t_user_id_idx").on(t.userId)],
);

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, { fields: [sessions.userId], references: [users.id] }),
}));

export const verificationTokens = createTable(
  "verification_token",
  (d) => ({
    identifier: d.varchar({ length: 255 }).notNull(),
    token: d.varchar({ length: 255 }).notNull(),
    expires: d.timestamp({ mode: "date", withTimezone: true }).notNull(),
  }),
  (t) => [primaryKey({ columns: [t.identifier, t.token] })],
);
