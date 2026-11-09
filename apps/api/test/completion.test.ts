import { count } from "drizzle-orm";
import { beforeEach, describe, expect, it } from "vitest";
import type { Db } from "../src/db/client.ts";
import { completion } from "../src/db/schema.ts";
import { callerFor, seedUser } from "./fixtures.ts";
import { createTestDb } from "./db.ts";

const now = new Date("2026-11-09T12:00:00Z");
const T = "2026-11-09";

let db: Db;
let userId: string;
let caller: ReturnType<typeof callerFor>;

beforeEach(async () => {
  db = await createTestDb();
  userId = (await seedUser(db)).id;
  caller = callerFor(db, userId, () => now);
});

describe("completion router", () => {
  it("inks today and snapshots the category", async () => {
    const h = await caller.habit.create({ name: "Read", categoryId: "mind" });
    const res = await caller.completion.ink({ habitId: h.id, date: T, today: T });
    expect(res).toEqual({ inked: true, alreadyInked: false, habitId: h.id, date: T, categoryId: "mind" });
    await caller.habit.update({ id: h.id, categoryId: "body" });
    const again = await caller.completion.ink({ habitId: h.id, date: T, today: T });
    expect(again.categoryId).toBe("mind");
    const range = await caller.completion.range({ from: T, to: T });
    expect(range).toEqual([{ date: T, categoryId: "mind", habitId: h.id }]);
  });

  it("inking twice reports alreadyInked and stores one row", async () => {
    const h = await caller.habit.create({ name: "Read", categoryId: "mind" });
    const a = await caller.completion.ink({ habitId: h.id, date: T, today: T });
    const b = await caller.completion.ink({ habitId: h.id, date: T, today: T });
    expect(a.alreadyInked).toBe(false);
    expect(b.alreadyInked).toBe(true);
    const rows = await db.select({ n: count() }).from(completion);
    expect(rows[0]?.n).toBe(1);
  });

  it("accepts today from UTC+14 and UTC-12", async () => {
    const h = await caller.habit.create({ name: "Read", categoryId: "mind" });
    await expect(
      caller.completion.ink({ habitId: h.id, date: "2026-11-10", today: "2026-11-10" }),
    ).resolves.toMatchObject({ inked: true });
    await expect(
      caller.completion.ink({ habitId: h.id, date: "2026-11-08", today: "2026-11-08" }),
    ).resolves.toMatchObject({ inked: true });
  });

  it("rejects a today two days from the server's UTC date", async () => {
    const h = await caller.habit.create({ name: "Read", categoryId: "mind" });
    await expect(
      caller.completion.ink({ habitId: h.id, date: "2026-11-11", today: "2026-11-11" }),
    ).rejects.toMatchObject({ code: "BAD_REQUEST", message: "Your computer's date looks off." });
    await expect(caller.completion.today({ today: "2026-11-11" })).rejects.toMatchObject({
      code: "BAD_REQUEST",
    });
  });

  it("inks yesterday but not the day before", async () => {
    const h = await caller.habit.create({ name: "Read", categoryId: "mind" });
    await expect(
      caller.completion.ink({ habitId: h.id, date: "2026-11-08", today: T }),
    ).resolves.toMatchObject({ inked: true });
    await expect(
      caller.completion.ink({ habitId: h.id, date: "2026-11-07", today: T }),
    ).rejects.toMatchObject({ code: "BAD_REQUEST", message: "You can only ink today or yesterday." });
    await expect(
      caller.completion.unink({ habitId: h.id, date: "2026-11-07", today: T }),
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });

  it("rejects a malformed date", async () => {
    const h = await caller.habit.create({ name: "Read", categoryId: "mind" });
    await expect(
      caller.completion.ink({ habitId: h.id, date: "2026-11-9", today: T }),
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });

  it("cannot ink an archived or foreign habit", async () => {
    const h = await caller.habit.create({ name: "Read", categoryId: "mind" });
    const other = callerFor(db, (await seedUser(db)).id, () => now);
    await expect(other.completion.ink({ habitId: h.id, date: T, today: T })).rejects.toMatchObject({
      code: "NOT_FOUND",
    });
    await caller.habit.archive({ id: h.id });
    await expect(caller.completion.ink({ habitId: h.id, date: T, today: T })).rejects.toMatchObject({
      code: "NOT_FOUND",
      message: "No habit with that id.",
    });
    await expect(
      caller.completion.ink({ habitId: 2147483648, date: T, today: T }),
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });

  it("unink removes only the caller's completion", async () => {
    const h = await caller.habit.create({ name: "Read", categoryId: "mind" });
    await caller.completion.ink({ habitId: h.id, date: T, today: T });
    const other = callerFor(db, (await seedUser(db)).id, () => now);
    expect(await other.completion.unink({ habitId: h.id, date: T, today: T })).toEqual({ removed: false });
    expect(await caller.completion.unink({ habitId: h.id, date: T, today: T })).toEqual({ removed: true });
    expect(await caller.completion.unink({ habitId: h.id, date: T, today: T })).toEqual({ removed: false });
  });

  it("today lists active habits with inked flag", async () => {
    const a = await caller.habit.create({ name: "Walk", categoryId: "body" });
    const b = await caller.habit.create({ name: "Read", categoryId: "mind" });
    const c = await caller.habit.create({ name: "Old", categoryId: "soul" });
    await caller.habit.archive({ id: c.id });
    await caller.completion.ink({ habitId: a.id, date: T, today: T });
    await caller.completion.ink({ habitId: b.id, date: "2026-11-08", today: T });
    const list = await caller.completion.today({ today: T });
    expect(list.map((h) => [h.name, h.inked])).toEqual([
      ["Read", false],
      ["Walk", true],
    ]);
  });

  it("range includes archived habits' history", async () => {
    const h = await caller.habit.create({ name: "Read", categoryId: "mind" });
    const g = await caller.habit.create({ name: "Walk", categoryId: "body" });
    await caller.completion.ink({ habitId: h.id, date: "2026-11-08", today: T });
    await caller.completion.ink({ habitId: g.id, date: "2026-11-08", today: T });
    await caller.completion.ink({ habitId: h.id, date: T, today: T });
    await caller.habit.archive({ id: h.id });
    const rows = await caller.completion.range({ from: "2026-11-08", to: T });
    expect(rows).toEqual([
      { date: "2026-11-08", categoryId: "mind", habitId: h.id },
      { date: "2026-11-08", categoryId: "body", habitId: g.id },
      { date: T, categoryId: "mind", habitId: h.id },
    ]);
    const other = callerFor(db, (await seedUser(db)).id, () => now);
    expect(await other.completion.range({ from: "2026-11-08", to: T })).toEqual([]);
  });

  it("range rejects more than 400 days and inverted ranges", async () => {
    await expect(
      caller.completion.range({ from: "2025-01-01", to: T }),
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });
    await expect(
      caller.completion.range({ from: "2025-10-05", to: T }),
    ).resolves.toEqual([]);
    await expect(caller.completion.range({ from: T, to: "2026-11-08" })).rejects.toMatchObject({
      code: "BAD_REQUEST",
    });
  });

  it("stats uses the client's today", async () => {
    const h = await caller.habit.create({ name: "Read", categoryId: "mind" });
    await caller.completion.ink({ habitId: h.id, date: "2026-11-08", today: T });
    await caller.completion.ink({ habitId: h.id, date: T, today: T });
    const s = await caller.completion.stats({ today: T });
    expect(s.currentStreak).toBe(2);
    await expect(caller.completion.stats({ today: "2026-11-12" })).rejects.toMatchObject({
      code: "BAD_REQUEST",
    });
  });
});
