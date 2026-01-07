import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { pgTable, varchar, timestamp } from "drizzle-orm/pg-core";
import { config } from "dotenv";

config({ path: ".env" });

// Define categories table inline (avoid importing full schema)
const categories = pgTable("northstar_category", {
  id: varchar({ length: 50 }).primaryKey(),
  name: varchar({ length: 100 }).notNull(),
  color: varchar({ length: 50 }).notNull(),
  createdAt: timestamp({ withTimezone: true })
    .$defaultFn(() => new Date())
    .notNull(),
});

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle({ client: sql });

async function seedCategories() {
  console.log("🌱 Seeding categories...");

  try {
    // Insert the 3 fixed categories
    await db.insert(categories).values([
      { id: "mind", name: "Mind", color: "blue" },
      { id: "body", name: "Body", color: "red" },
      { id: "soul", name: "Soul", color: "purple" },
    ]);

    console.log("✅ Categories seeded successfully!");
    console.log("   - Mind (blue)");
    console.log("   - Body (red)");
    console.log("   - Soul (purple)");
  } catch (error: any) {
    // Handle duplicate key error (categories already exist)
    if (error.code === "23505") {
      console.log("ℹ️  Categories already exist, skipping...");
    } else {
      console.error("❌ Error seeding categories:", error);
      process.exit(1);
    }
  }
}

seedCategories()
  .then(() => {
    console.log("\n🎉 Seed complete!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("💥 Seed failed:", error);
    process.exit(1);
  });
