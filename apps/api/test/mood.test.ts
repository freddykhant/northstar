import { beforeEach, describe, expect, it } from "vitest";
import type { Db } from "../src/db/client.ts";
import { callerFor, seedUser } from "./fixtures.ts";
import { createTestDb } from "./db.ts";

const now = new Date("2026-11-09T12:00:00Z");
const T = "2026-11-09";

let db: Db;
let caller: ReturnType<typeof callerFor>;

beforeEach(async () => {
  db = await createTestDb();
  caller = callerFor(db, (await seedUser(db)).id, () => now);
});

describe("mood router", () => {
  it("set upserts one mood per day", async () => {
    expect(await caller.mood.set({ date: T, today: T, level: 3 })).toEqual({ date: T, level: 3 });
    await caller.mood.set({ date: T, today: T, level: 5 });
    expect(await caller.mood.get({ date: T })).toEqual({ date: T, level: 5 });
  });

  it("get returns null when unset and is scoped to the caller", async () => {
    expect(await caller.mood.get({ date: T })).toBeNull();
    await caller.mood.set({ date: T, today: T, level: 4 });
    const other = callerFor(db, (await seedUser(db)).id, () => now);
    expect(await other.mood.get({ date: T })).toBeNull();
  });

  it("rejects level 0 and 6", async () => {
    for (const level of [0, 6]) {
      await expect(caller.mood.set({ date: T, today: T, level })).rejects.toMatchObject({
        code: "BAD_REQUEST",
      });
    }
  });

  it("cannot set a mood two days back", async () => {
    await expect(
      caller.mood.set({ date: "2026-11-07", today: T, level: 3 }),
    ).rejects.toMatchObject({ code: "BAD_REQUEST", message: "You can only ink today or yesterday." });
  });

  it("rejects an implausible today", async () => {
    await expect(
      caller.mood.set({ date: "2026-11-12", today: "2026-11-12", level: 3 }),
    ).rejects.toMatchObject({ code: "BAD_REQUEST", message: "Your computer's date looks off." });
  });
});
