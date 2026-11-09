import { randomUUID } from "node:crypto";
import type { Db } from "../src/db/client.ts";
import { user } from "../src/db/schema.ts";
import { appRouter } from "../src/trpc/root.ts";

export async function seedUser(
  db: Db,
  overrides: Partial<{ id: string; name: string; email: string }> = {},
): Promise<{ id: string; name: string; email: string }> {
  const id = overrides.id ?? randomUUID();
  const row = {
    id,
    name: overrides.name ?? "Test User",
    email: overrides.email ?? `${id}@example.test`,
  };
  await db.insert(user).values(row);
  return row;
}

export function callerFor(db: Db, userId: string | null, now: () => Date = () => new Date()) {
  return appRouter.createCaller({ db, userId, now });
}
