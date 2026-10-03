// Derived progress metrics. Pure functions over sessions.
import type { PersonalRecord, WorkoutSession } from "./types";

const dayKey = (d: Date) => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;

export const finished = (s: WorkoutSession[]) =>
  s.filter((x) => x.finishedAt).sort((a, b) => b.startedAt.localeCompare(a.startedAt));

export function streak(sessions: WorkoutSession[], now = new Date()) {
  // Streak counts consecutive "active weeks"-friendly days: a day with a workout, allowing 1 rest day between.
  const days = new Set(finished(sessions).map((s) => dayKey(new Date(s.startedAt))));
  let count = 0, gap = 0;
  const d = new Date(now);
  for (let i = 0; i < 365; i++) {
    if (days.has(dayKey(d))) { count++; gap = 0; }
    else if (i > 0) { gap++; if (gap > 1) break; }
    d.setDate(d.getDate() - 1);
  }
  return count;
}

export function startOfWeek(now = new Date()) {
  const d = new Date(now);
  const diff = (d.getDay() + 6) % 7;
  d.setDate(d.getDate() - diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function thisWeekCount(sessions: WorkoutSession[], now = new Date()) {
  const start = startOfWeek(now).getTime();
  return finished(sessions).filter((s) => new Date(s.startedAt).getTime() >= start).length;
}

export function sessionVolume(s: WorkoutSession) {
  return s.logs.reduce((t, l) => t + l.sets.filter((x) => x.done).reduce((a, x) => a + x.reps * (x.weight || 0), 0), 0);
}
export function completedSets(s: WorkoutSession) {
  return s.logs.reduce((t, l) => t + l.sets.filter((x) => x.done).length, 0);
}

export function weeklySeries(sessions: WorkoutSession[], weeks = 8, now = new Date()) {
  const start = startOfWeek(now);
  return Array.from({ length: weeks }, (_, i) => {
    const from = new Date(start); from.setDate(start.getDate() - (weeks - 1 - i) * 7);
    const to = new Date(from); to.setDate(from.getDate() + 7);
    const inWeek = finished(sessions).filter((s) => { const t = new Date(s.startedAt); return t >= from && t < to; });
    return {
      label: from.toLocaleDateString(undefined, { month: "short", day: "numeric" }),
      workouts: inWeek.length,
      volume: inWeek.reduce((a, s) => a + sessionVolume(s), 0),
      sets: inWeek.reduce((a, s) => a + completedSets(s), 0),
    };
  });
}

export function personalRecords(sessions: WorkoutSession[]): PersonalRecord[] {
  const best = new Map<string, PersonalRecord>();
  for (const s of finished(sessions)) for (const l of s.logs) for (const set of l.sets) {
    if (!set.done || !set.weight) continue;
    const cur = best.get(l.exerciseId);
    if (!cur || set.weight > cur.weight || (set.weight === cur.weight && set.reps > cur.reps))
      best.set(l.exerciseId, { exerciseId: l.exerciseId, weight: set.weight, reps: set.reps, date: s.startedAt });
  }
  return [...best.values()].sort((a, b) => b.weight - a.weight);
}

export function monthConsistency(sessions: WorkoutSession[], plannedPerWeek: number, now = new Date()) {
  const from = new Date(now); from.setDate(now.getDate() - 28);
  const done = finished(sessions).filter((s) => new Date(s.startedAt) >= from).length;
  const planned = Math.max(1, plannedPerWeek * 4);
  return { done, planned, pct: Math.min(100, Math.round((done / planned) * 100)) };
}

export function last28Days(sessions: WorkoutSession[], now = new Date()) {
  const days = new Set(finished(sessions).map((s) => dayKey(new Date(s.startedAt))));
  return Array.from({ length: 28 }, (_, i) => {
    const d = new Date(now); d.setDate(now.getDate() - (27 - i));
    return { date: d, active: days.has(dayKey(d)) };
  });
}
