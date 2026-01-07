import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { env } from "../src/env.js";
import { pgTable, varchar, integer, text, boolean, timestamp, date, uniqueIndex, index } from "drizzle-orm/pg-core";

// Define tables inline to avoid NextAuth import issues
const createTable = (name: string) => `northstar_${name}`;

const categories = pgTable(createTable("category"), {
  id: varchar({ length: 50 }).primaryKey(),
  name: varchar({ length: 100 }).notNull(),
  color: varchar({ length: 50 }).notNull(),
  createdAt: timestamp({ withTimezone: true }).notNull(),
});

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

const users = pgTable(createTable("user"), {
  id: varchar({ length: 255 }).primaryKey(),
});

const sql = neon(env.DATABASE_URL);
const db = drizzle({ client: sql });

async function seed() {
  console.log("🌱 Starting database seed...");

  try {
    // Get a user from the database (we need an actual user ID)
    const [existingUser] = await db.select({ id: users.id }).from(users).limit(1);
    
    if (!existingUser) {
      console.error("❌ No users found in database. Please sign up first before seeding.");
      process.exit(1);
    }

    const userId = existingUser.id;
    console.log(`✅ Using user: ${userId}`);

    // Seed habits
    console.log("📝 Seeding habits...");
    const [habit1] = await db.insert(habits).values({
      userId,
      categoryId: "mind",
      name: "Morning Meditation",
      description: "10 minutes of mindfulness",
      isActive: true,
      createdAt: new Date(),
    }).returning();

    const [habit2] = await db.insert(habits).values({
      userId,
      categoryId: "body",
      name: "Exercise",
      description: "30 minutes of physical activity",
      isActive: true,
      createdAt: new Date(),
    }).returning();

    const [habit3] = await db.insert(habits).values({
      userId,
      categoryId: "soul",
      name: "Gratitude Journal",
      description: "Write 3 things I'm grateful for",
      isActive: true,
      createdAt: new Date(),
    }).returning();

    const [habit4] = await db.insert(habits).values({
      userId,
      categoryId: "mind",
      name: "Read",
      description: "Read for 20 minutes",
      isActive: true,
      createdAt: new Date(),
    }).returning();

    const [habit5] = await db.insert(habits).values({
      userId,
      categoryId: "body",
      name: "Drink Water",
      description: "8 glasses throughout the day",
      isActive: true,
      createdAt: new Date(),
    }).returning();

    console.log(`✅ Created ${5} habits`);

    // Seed completions for the past 30 days
    console.log("✨ Seeding completions for past 30 days...");
    const completionsToInsert = [];
    const today = new Date();

    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];

      // Randomly complete habits (simulate realistic usage)
      const allHabits = [habit1, habit2, habit3, habit4, habit5];
      
      for (const habit of allHabits) {
        // 70% chance of completion
        if (Math.random() > 0.3) {
          completionsToInsert.push({
            habitId: habit!.id,
            userId,
            completedDate: dateStr!,
            createdAt: new Date(),
          });
        }
      }
    }

    if (completionsToInsert.length > 0) {
      await db.insert(completions).values(completionsToInsert);
      console.log(`✅ Created ${completionsToInsert.length} completions`);
    }

    console.log("🎉 Database seeded successfully!");
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  }
}

seed();
