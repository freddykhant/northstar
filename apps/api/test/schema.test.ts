import { beforeEach, describe, expect, it } from "vitest";
import { habit, completion, mood, user } from "../src/db/schema.ts";
import type { Db } from "../src/db/client.ts";
import { createTestDb } from "./db.ts";

let db: Db;

beforeEach(async () => {
  db = await createTestDb();
  await db.insert(user).values({ id: "u1", name: "Ada", email: "ada@example.com" });
});

function pgCode(err: unknown): unknown {
  const e = err as { code?: unknown; cause?: { code?: unknown } };
  return e.code ?? e.cause?.code;
}

async function codeOf(p: PromiseLike<unknown>): Promise<unknown> {
  try {
    await p;
  } catch (err) {
    return pgCode(err);
  }
  return undefined;
}

const newHabit = (name: string, extra: Partial<typeof habit.$inferInsert> = {}) =>
  db.insert(habit).values({ userId: "u1", name, categoryId: "mind", ...extra });

describe("schema constraints", () => {
  it("rejects a second active habit whose name differs only by case", async () => {
    await newHabit("Read");
    expect(await codeOf(newHabit("read"))).toBe("23505");
  });

  it("allows reusing a name once the old habit is archived", async () => {
    await newHabit("Read", { archivedAt: new Date() });
    await expect(newHabit("read")).resolves.toBeDefined();
  });

  it("rejects a category outside mind/body/soul", async () => {
    expect(await codeOf(newHabit("Run", { categoryId: "spirit" }))).toBe("23514");
  });

  it("rejects a second completion for the same habit and date", async () => {
    const [h] = await newHabit("Read").returning({ id: habit.id });
    const row = { habitId: h!.id, userId: "u1", date: "2026-11-09", categoryId: "mind" };
    await db.insert(completion).values(row);
    expect(await codeOf(db.insert(completion).values(row))).toBe("23505");
  });

  it("rejects mood level 0 and 6", async () => {
    expect(await codeOf(db.insert(mood).values({ userId: "u1", date: "2026-11-09", level: 0 }))).toBe("23514");
    expect(await codeOf(db.insert(mood).values({ userId: "u1", date: "2026-11-09", level: 6 }))).toBe("23514");
  });
});
