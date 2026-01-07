import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { env } from "../src/env.js";
import {
  pgTable,
  varchar,
  integer,
  text,
  boolean,
  timestamp,
  date,
} from "drizzle-orm/pg-core";

// Define tables inline to avoid NextAuth import issues
const createTable = (name: string) => `northstar_${name}`;

const habits = pgTable(createTable("habit"), {
  id: integer().primaryKey().generatedByDefaultAsIdentity(),
  userId: varchar({ length: 255 }).notNull(),
  categoryId: varchar({ length: 50 }).notNull(),
  name: varchar({ length: 256 }).notNull(),
  description: text(),
  isActive: boolean().default(true).notNull(),
  createdAt: timestamp({ withTimezone: true }).notNull(),
  updatedAt: timestamp({ withTimezone: true }),
});

const completions = pgTable(createTable("completion"), {
  id: integer().primaryKey().generatedByDefaultAsIdentity(),
  habitId: integer().notNull(),
  userId: varchar({ length: 255 }).notNull(),
  completedDate: date().notNull(),
  createdAt: timestamp({ withTimezone: true }).notNull(),
});

const sql = neon(env.DATABASE_URL);
const db = drizzle({ client: sql });

async function clear() {
  console.log("🧹 Clearing database...");

  try {
    // Delete completions first (foreign key constraint)
    const deletedCompletions = await db.delete(completions);
    console.log("✅ Cleared completions table");

    // Delete habits
    const deletedHabits = await db.delete(habits);
    console.log("✅ Cleared habits table");

    console.log("🎉 Database cleared successfully!");
    console.log(
      "ℹ️  Users, accounts, sessions, verification tokens, and categories were preserved.",
    );
  } catch (error) {
    console.error("❌ Error clearing database:", error);
    process.exit(1);
  }
}

clear();
