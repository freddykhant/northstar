import { addDays, daysBetween, isLocalDate, type LocalDate } from "@squii/core";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

const DATE_MESSAGE = "Dates look like 2026-11-09.";
export const localDateInput = z.string({ message: DATE_MESSAGE }).refine(isLocalDate, { message: DATE_MESSAGE });

/** The UTC calendar date of `now`. */
export function utcDateOf(now: Date): LocalDate {
  return now.toISOString().slice(0, 10);
}

/** The client's `today` may differ from the server's UTC date by one day (UTC-12 to UTC+14). */
export function assertPlausibleToday(today: LocalDate, now: Date): void {
  if (Math.abs(daysBetween(utcDateOf(now), today)) > 1) {
    throw new TRPCError({ code: "BAD_REQUEST", message: "Your computer's date looks off." });
  }
}

export function assertBackfillable(date: LocalDate, today: LocalDate): void {
  if (date !== today && date !== addDays(today, -1)) {
    throw new TRPCError({ code: "BAD_REQUEST", message: "You can only ink today or yesterday." });
  }
}
