import { type Config } from "drizzle-kit";

import { env } from "~/env";

export default {
  schema: "./src/server/db/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: env.STORAGE_DATABASE_URL,
  },
  tablesFilter: ["northstar_*"],
} satisfies Config;
