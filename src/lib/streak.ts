import type { TestResult } from "./types";

export interface StreakDay {
  date: Date;
  active: boolean;
  isToday: boolean;
}

export interface StreakInfo {
  /** Consecutive days (ending today, or yesterday if today has no test
   * yet) with at least one completed test. */
  currentStreak: number;
  /** Oldest to newest, always exactly 7 entries. */
  last7Days: StreakDay[];
}

function dateKey(d: Date): string {
  return d.toDateString();
}

/** Glanceable practice-streak info for the dashboard - a lighter-weight,
 * always-visible cousin of the "7-Day Streak" achievement badge, which
 * only ever shows up once earned. */
export function computeStreakInfo(results: TestResult[]): StreakInfo {
  const activeDays = new Set(results.map((r) => dateKey(new Date(r.submittedAt))));

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const last7Days: StreakDay[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    last7Days.push({ date: d, active: activeDays.has(dateKey(d)), isToday: i === 0 });
  }

  let currentStreak = 0;
  const cursor = new Date(today);
  if (!activeDays.has(dateKey(cursor))) {
    // No test yet today - count back from yesterday instead, so an
    // in-progress streak still shows until a full day is actually missed.
    cursor.setDate(cursor.getDate() - 1);
  }
  while (activeDays.has(dateKey(cursor))) {
    currentStreak++;
    cursor.setDate(cursor.getDate() - 1);
  }

  return { currentStreak, last7Days };
}
