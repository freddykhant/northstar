/** A calendar date in the user's local time zone, formatted YYYY-MM-DD. */
export type LocalDate = string;

const MS_PER_DAY = 86_400_000;

function parts(d: LocalDate): [number, number, number] {
  const [y, m, day] = d.split("-").map(Number) as [number, number, number];
  return [y, m, day];
}

function toUtc(d: LocalDate): number {
  const [y, m, day] = parts(d);
  return Date.UTC(y, m - 1, day);
}

function fromUtc(ms: number): LocalDate {
  const dt = new Date(ms);
  const y = String(dt.getUTCFullYear()).padStart(4, "0");
  const m = String(dt.getUTCMonth() + 1).padStart(2, "0");
  const d = String(dt.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function isLocalDate(s: string): s is LocalDate {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
  const [y, m, d] = parts(s);
  const dt = new Date(Date.UTC(y, m - 1, d));
  // Date.UTC maps years 0-99 to 1900-1999, so compare via setUTCFullYear.
  dt.setUTCFullYear(y);
  return dt.getUTCFullYear() === y && dt.getUTCMonth() === m - 1 && dt.getUTCDate() === d;
}

/** Today's date in the machine's local time zone. */
export function localToday(now: Date = new Date()): LocalDate {
  const y = String(now.getFullYear()).padStart(4, "0");
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function addDays(d: LocalDate, n: number): LocalDate {
  return fromUtc(toUtc(d) + n * MS_PER_DAY);
}

/** Whole days from a to b (b - a). */
export function daysBetween(a: LocalDate, b: LocalDate): number {
  return Math.round((toUtc(b) - toUtc(a)) / MS_PER_DAY);
}
