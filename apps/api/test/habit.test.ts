import { eq } from "drizzle-orm";
import { beforeEach, describe, expect, it } from "vitest";
import type { Db } from "../src/db/client.ts";
import { completion } from "../src/db/schema.ts";
import { callerFor, seedUser } from "./fixtures.ts";
import { createTestDb } from "./db.ts";

let db: Db;
let userId: string;
let caller: ReturnType<typeof callerFor>;

beforeEach(async () => {
  db = await createTestDb();
  userId = (await seedUser(db)).id;
  caller = callerFor(db, userId);
});

describe("habit router", () => {
  it("create trims and collapses whitespace", async () => {
    const h = await caller.habit.create({ name: "  read   10  pages ", categoryId: "mind" });
    expect(h.name).toBe("read 10 pages");
    expect(h.archivedAt).toBeNull();
  });

  it("create rejects a name that is only spaces", async () => {
    await expect(caller.habit.create({ name: "   ", categoryId: "mind" })).rejects.toMatchObject({
      code: "BAD_REQUEST",
    });
  });

  it("create rejects a name over 80 characters", async () => {
    await expect(
      caller.habit.create({ name: "a".repeat(81), categoryId: "mind" }),
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });

  it("create rejects a case/space duplicate of an active habit", async () => {
    await caller.habit.create({ name: "Read", categoryId: "mind" });
    await expect(caller.habit.create({ name: " read ", categoryId: "mind" })).rejects.toMatchObject({
      code: "CONFLICT",
      message: "You already have a habit called 'Read'.",
    });
  });

  it("archive then create reuses the name", async () => {
    const old = await caller.habit.create({ name: "Read", categoryId: "mind" });
    const archived = await caller.habit.archive({ id: old.id });
    expect(archived.archivedAt).toBeInstanceOf(Date);
    const fresh = await caller.habit.create({ name: "Read", categoryId: "mind" });
    expect((await caller.habit.list()).map((h) => h.id)).toEqual([fresh.id]);
    expect((await caller.habit.list({ includeArchived: true })).map((h) => h.id).sort()).toEqual(
      [old.id, fresh.id].sort(),
    );
  });

  it("update changes category without touching past completions", async () => {
    const h = await caller.habit.create({ name: "Read", categoryId: "mind" });
    await db
      .insert(completion)
      .values({ habitId: h.id, userId, date: "2026-11-09", categoryId: "mind" });
    const updated = await caller.habit.update({ id: h.id, categoryId: "body" });
    expect(updated.categoryId).toBe("body");
    const rows = await db.select().from(completion).where(eq(completion.habitId, h.id));
    expect(rows[0]?.categoryId).toBe("mind");
  });

  it("update renames, conflicts on duplicates, and no-ops with no fields", async () => {
    const a = await caller.habit.create({ name: "Read", categoryId: "mind" });
    await caller.habit.create({ name: "Run", categoryId: "body" });
    const renamed = await caller.habit.update({ id: a.id, name: " Reading " });
    expect(renamed.name).toBe("Reading");
    await expect(caller.habit.update({ id: a.id, name: "run" })).rejects.toMatchObject({
      code: "CONFLICT",
      message: "You already have a habit called 'Run'.",
    });
    expect(await caller.habit.update({ id: a.id })).toEqual(renamed);
  });

  it("cannot update or archive another user's habit", async () => {
    const other = await seedUser(db);
    const theirs = await callerFor(db, other.id).habit.create({ name: "Run", categoryId: "body" });
    const msg = "No habit with that id.";
    await expect(caller.habit.update({ id: theirs.id, name: "x" })).rejects.toMatchObject({
      code: "NOT_FOUND",
      message: msg,
    });
    await expect(caller.habit.archive({ id: theirs.id })).rejects.toMatchObject({
      code: "NOT_FOUND",
      message: msg,
    });
  });

  it("cannot update or archive an already archived habit", async () => {
    const h = await caller.habit.create({ name: "Run", categoryId: "body" });
    await caller.habit.archive({ id: h.id });
    await expect(caller.habit.archive({ id: h.id })).rejects.toMatchObject({ code: "NOT_FOUND" });
    await expect(caller.habit.update({ id: h.id, name: "x" })).rejects.toMatchObject({
      code: "NOT_FOUND",
    });
  });

  it("list orders mind, body, soul then oldest first", async () => {
    const s = await caller.habit.create({ name: "Journal", categoryId: "soul" });
    const b = await caller.habit.create({ name: "Run", categoryId: "body" });
    const m1 = await caller.habit.create({ name: "Read", categoryId: "mind" });
    const m2 = await caller.habit.create({ name: "Study", categoryId: "mind" });
    expect((await caller.habit.list()).map((h) => h.id)).toEqual([m1.id, m2.id, b.id, s.id]);
  });

  it("requires auth", async () => {
    await expect(callerFor(db, null).habit.list()).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });
});
