import { CATEGORY_IDS } from "@squii/core";
import { sql } from "drizzle-orm";
import {
  check,
  date,
  index,
  integer,
  pgTable,
  serial,
  text,
  timestamp,
  unique,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { user } from "./auth-schema.ts";

const categoryList = sql.raw(CATEGORY_IDS.map((c) => `'${c}'`).join(", "));

export const habit = pgTable(
  "habit",
  {
    id: serial("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    categoryId: text("category_id").notNull(),
    archivedAt: timestamp("archived_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    check("habit_category_check", sql`${t.categoryId} in (${categoryList})`),
    uniqueIndex("habit_user_active_name_idx")
      .on(t.userId, sql`lower(${t.name})`)
      .where(sql`${t.archivedAt} IS NULL`),
  ],
);

export const completion = pgTable(
  "completion",
  {
    id: serial("id").primaryKey(),
    habitId: integer("habit_id")
      .notNull()
      .references(() => habit.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    date: date("date", { mode: "string" }).notNull(),
    categoryId: text("category_id").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    check("completion_category_check", sql`${t.categoryId} in (${categoryList})`),
    unique("completion_habit_date_unique").on(t.habitId, t.date),
    index("completion_user_date_idx").on(t.userId, t.date),
  ],
);

export const mood = pgTable(
  "mood",
  {
    id: serial("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    date: date("date", { mode: "string" }).notNull(),
    level: integer("level").notNull(),
  },
  (t) => [
    check("mood_level_check", sql`${t.level} between 1 and 5`),
    unique("mood_user_date_unique").on(t.userId, t.date),
  ],
);
