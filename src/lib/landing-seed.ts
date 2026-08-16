// A plausible year of demo data for the landing page.
//
// Deterministic by construction: seeded PRNG, no Math.random, no ambient Date.
// The landing hero is server-rendered and hydrated, so any nondeterminism here
// becomes a hydration mismatch rather than a visual nicety.

import type { DayCategories } from "./types";
import { formatDateAsLocal } from "./utils";

/** 7 rows x 20 columns of hero mosaic. */
export const HERO_WEEKS = 20;
export const HERO_DAYS = HERO_WEEKS * 7;

/** Months back from the reference date whose body density is suppressed, so
 *  the "lopsided month" section has something real to point at. */
export const LOPSIDED_MONTH_OFFSET = 3;

const SEED = 0x4e53; // "NS"

/** Small, fast, well-distributed 32-bit PRNG. Chosen over a hand-rolled LCG
 *  because low-bit correlation in an LCG shows up as visible striping when the
 *  output drives a grid. */
function mulberry32(seed: number): () => number {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const BASE_RATE: Record<keyof DayCategories, number> = {
  mind: 0.62,
  body: 0.48,
  soul: 0.55,
};

/** Body density inside the lopsided month. Low enough that the section's
 *  claim is visible at a glance, non-zero so it reads as a hard month rather
 *  than a rendering bug. */
const LOPSIDED_BODY_RATE = 0.08;

/** The generator always walks this many days, then slices. Varying the walk
 *  length would re-align the PRNG sequence against the calendar, so the same
 *  date would differ between the hero (140 days), the comparison (182) and the
 *  lopsided month (365) — three views of one year, disagreeing on one page. */
const CANONICAL_DAYS = 365;

/**
 * `days` consecutive days ending on (and including) `reference`.
 * Keys are `YYYY-MM-DD` local, matching every other mosaic surface.
 *
 * A given date always gets the same value regardless of `days`.
 */
export function buildDemoYear(
  reference: Date,
  days: number,
): Map<string, DayCategories> {
  if (days < 1 || days > CANONICAL_DAYS) {
    throw new RangeError(`days must be 1..${CANONICAL_DAYS}, got ${days}`);
  }

  const rand = mulberry32(SEED);
  const entries: [string, DayCategories][] = [];

  const lopsided = new Date(
    reference.getFullYear(),
    reference.getMonth() - LOPSIDED_MONTH_OFFSET,
    1,
  );

  for (let i = CANONICAL_DAYS - 1; i >= 0; i--) {
    const date = new Date(
      reference.getFullYear(),
      reference.getMonth(),
      reference.getDate() - i,
    );

    const isLopsided =
      date.getFullYear() === lopsided.getFullYear() &&
      date.getMonth() === lopsided.getMonth();

    // Draw all three every iteration regardless of branch, so the sequence
    // consumed per day is constant and the lopsided month cannot shift the
    // pattern of the months after it.
    const rolls = { mind: rand(), body: rand(), soul: rand() };

    entries.push([
      formatDateAsLocal(date),
      {
        mind: rolls.mind < BASE_RATE.mind,
        body: rolls.body < (isLopsided ? LOPSIDED_BODY_RATE : BASE_RATE.body),
        soul: rolls.soul < BASE_RATE.soul,
      },
    ]);
  }

  return new Map(entries.slice(CANONICAL_DAYS - days));
}
