// Rule-based adaptive workout engine. Pure functions — no UI, no storage.
// Swap for a server-side implementation later without touching components.
import { EXERCISES, exerciseById } from "./exercises";
import { MUSCLES, WORKOUT_TYPES } from "./labels";
import type {
  DailyCheckIn, Exercise, MuscleGroup, Profile, Workout, WorkoutExercise, WorkoutSession, WorkoutType,
} from "./types";

const UPPER: MuscleGroup[] = ["chest", "back", "shoulders", "arms"];
const LOWER: MuscleGroup[] = ["quads", "hamstrings", "glutes", "calves"];

const TYPE_MUSCLES: Record<WorkoutType, MuscleGroup[]> = {
  upper: UPPER, push: ["chest", "shoulders", "arms"], pull: ["back", "arms"],
  lower: LOWER, full_body: [...UPPER, ...LOWER, "core", "full_body"],
  conditioning: ["cardio", "full_body", "core"], mobility: ["full_body", "back", "core"],
};

const EXERCISE_COUNT: Record<number, number> = { 20: 3, 30: 4, 45: 5, 60: 6, 90: 7 };

function daysAgo(iso: string, now: Date) {
  const d = new Date(iso);
  const a = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  const b = Date.UTC(d.getFullYear(), d.getMonth(), d.getDate());
  return Math.round((a - b) / 86400000);
}

function sessionRegion(s: WorkoutSession): "upper" | "lower" | "full" | "other" {
  const t = s.workout.type;
  if (t === "upper" || t === "push" || t === "pull") return "upper";
  if (t === "lower") return "lower";
  if (t === "full_body") return "full";
  return "other";
}

function prescription(profile: Profile, intensity: "light" | "normal" | "hard", ex: Exercise) {
  if (ex.kind === "mobility") return { sets: 2, reps: ex.timed ? 30 : 8, restSec: 15 };
  if (ex.kind === "conditioning")
    return { sets: intensity === "hard" ? 4 : 3, reps: ex.timed ? (intensity === "light" ? 20 : 30) : 10, restSec: 30 };
  const base = {
    strength: { sets: 4, reps: 5, restSec: 120 },
    muscle_gain: { sets: 3, reps: 10, restSec: 75 },
    fat_loss: { sets: 3, reps: 12, restSec: 45 },
    endurance: { sets: 3, reps: 15, restSec: 30 },
    general_fitness: { sets: 3, reps: 10, restSec: 60 },
  }[profile.goal];
  let sets = base.sets;
  if (intensity === "light") sets = Math.max(2, sets - 1);
  if (intensity === "hard" && profile.experience !== "beginner") sets += 1;
  const reps = ex.timed ? (intensity === "light" ? 20 : 30) : base.reps;
  return { sets, reps, restSec: base.restSec };
}

export interface RecommendInput {
  profile: Profile;
  checkIn: DailyCheckIn;
  history: WorkoutSession[];
  now?: Date;
}

export function recommendWorkout({ profile, checkIn, history, now = new Date() }: RecommendInput): Workout {
  const reasons: string[] = [];
  const recent = history
    .filter((s) => s.finishedAt)
    .sort((a, b) => b.startedAt.localeCompare(a.startedAt));
  const last = recent[0];
  const lastAgo = last ? daysAgo(last.startedAt, now) : null;
  const last7 = recent.filter((s) => daysAgo(s.startedAt, now) < 7).length;

  // 1. Intensity from energy + sleep
  let intensity: "light" | "normal" | "hard" = "normal";
  if (checkIn.energy === "low" || checkIn.sleep === "lt5") intensity = "light";
  else if (checkIn.energy === "high" && checkIn.sleep === "7plus") intensity = "hard";

  if (checkIn.sleep === "lt5") reasons.push("You slept under 5 hours, so volume is reduced and the session stays at a manageable effort.");
  else if (checkIn.energy === "low") reasons.push("Your energy is low today, so this session uses fewer sets and simpler movements.");
  else if (intensity === "hard") reasons.push("You're well rested with high energy, so there's an extra set on the main lifts.");
  else reasons.push(`Energy is ${checkIn.energy} and sleep was ${checkIn.sleep === "5to7" ? "5–7" : "7+"} hours, so the session runs at a steady, normal effort.`);

  // 2. Pick workout type from recent history
  let type: WorkoutType;
  const lowAndTired = checkIn.energy === "low" && checkIn.sleep === "lt5";
  if (lowAndTired || (last7 >= 5 && checkIn.energy !== "high")) {
    type = "mobility";
    reasons.push(lowAndTired
      ? "Low energy plus short sleep is a good day for mobility and light movement instead of hard training."
      : `You've trained ${last7} times in the past week — a lighter recovery session helps you keep the streak going.`);
  } else if (last && lastAgo !== null && lastAgo <= 1) {
    const region = sessionRegion(last);
    const when = lastAgo === 0 ? "earlier today" : "yesterday";
    if (region === "upper") {
      type = "lower";
      reasons.push(`You trained ${WORKOUT_TYPES[last.workout.type].toLowerCase()} ${when}, so today focuses on lower body to let those muscles recover.`);
    } else if (region === "lower") {
      type = "upper";
      reasons.push(`You trained lower body ${when}, so today shifts to upper body.`);
    } else if (region === "full") {
      type = profile.goal === "endurance" || profile.goal === "fat_loss" ? "conditioning" : "upper";
      reasons.push(`You did a full-body session ${when}, so today changes focus to ${type === "conditioning" ? "conditioning" : "upper body"}.`);
    } else {
      type = "full_body";
      reasons.push(`Your last session ${when} was ${WORKOUT_TYPES[last.workout.type].toLowerCase()}, so today is a balanced full-body session.`);
    }
  } else {
    type = checkIn.availableMin <= 20 && (profile.goal === "endurance" || profile.goal === "fat_loss") ? "conditioning" : "full_body";
    reasons.push(last
      ? `It's been ${lastAgo} days since your last workout, so a ${WORKOUT_TYPES[type].toLowerCase()} session gets everything moving again.`
      : `No recent sessions logged yet, so you're starting with a ${WORKOUT_TYPES[type].toLowerCase()} session.`);
  }

  // 3. Filter exercise pool by location + equipment + experience
  const owned = new Set([...checkIn.equipment, "none"]);
  const maxDiff = profile.experience === "beginner" ? 2 : 3;
  const pool = EXERCISES.filter(
    (e) =>
      e.locations.includes(checkIn.location) &&
      e.equipment.some((q) => owned.has(q)) &&
      e.difficulty <= (intensity === "light" ? Math.min(maxDiff, 2) : maxDiff),
  );

  const count = EXERCISE_COUNT[checkIn.availableMin] ?? 4;
  reasons.push(`You have ${checkIn.availableMin} minutes, so the plan includes ${count} exercises${checkIn.location === "outdoor" ? " you can do outside" : ` that work ${checkIn.location === "gym" ? "at the gym" : "at home"}`} with the equipment you selected.`);

  const targets = TYPE_MUSCLES[type];
  const wantKind = type === "mobility" ? "mobility" : type === "conditioning" ? "conditioning" : "strength";
  const score = (e: Exercise) => {
    let s = e.muscles.filter((m) => targets.includes(m)).length * 3;
    if (e.kind === wantKind) s += 4;
    if (type === "mobility" && e.kind === "conditioning" && e.difficulty === 1) s += 1;
    // prefer heavier tools when available
    if (!e.equipment.includes("none")) s += 1;
    if (profile.experience === "advanced") s += e.difficulty - 1;
    return s;
  };
  const ranked = pool.filter((e) => score(e) >= 4).sort((a, b) => score(b) - score(a));

  // pick diverse: avoid duplicating primary muscle
  const chosen: Exercise[] = [];
  const usedPrimary = new Set<string>();
  for (const e of ranked) {
    if (chosen.length >= count) break;
    if (usedPrimary.has(e.muscles[0]) && ranked.length > count) continue;
    chosen.push(e);
    usedPrimary.add(e.muscles[0]);
  }
  for (const e of ranked) {
    if (chosen.length >= count) break;
    if (!chosen.includes(e)) chosen.push(e);
  }

  // Conditioning finisher for fat loss / endurance on decent days
  if (type !== "mobility" && type !== "conditioning" && intensity !== "light" &&
      (profile.goal === "fat_loss" || profile.goal === "endurance") && chosen.length >= 3) {
    const fin = pool.find((e) => e.kind === "conditioning" && !chosen.includes(e));
    if (fin) {
      chosen[chosen.length - 1] = fin;
      reasons.push(`Your goal is ${profile.goal === "fat_loss" ? "fat loss" : "endurance"}, so the session ends with a short conditioning finisher.`);
    }
  }

  const exercises: WorkoutExercise[] = chosen.map((e) => ({ exerciseId: e.id, ...prescription(profile, intensity, e) }));
  const muscles = Array.from(new Set(chosen.flatMap((e) => e.muscles))).slice(0, 4);

  if (checkIn.notes?.trim()) reasons.push(`You noted: "${checkIn.notes.trim()}". Adjust or skip any movement that doesn't feel right.`);

  const difficulty: Workout["difficulty"] =
    intensity === "light" || type === "mobility" ? "Easy" : intensity === "hard" ? "Challenging" : "Moderate";

  const titleMap: Record<WorkoutType, string> = {
    upper: "Upper-body build", lower: "Lower-body power", push: "Push session", pull: "Pull session",
    full_body: "Full-body reset", conditioning: "Conditioning circuit", mobility: "Recovery & mobility",
  };
  const where = { gym: "Gym", home: "Home", outdoor: "Outdoor" }[checkIn.location];

  return {
    id: crypto.randomUUID(),
    title: `${titleMap[type]} · ${where}`,
    type,
    durationMin: checkIn.availableMin,
    difficulty,
    muscles,
    exercises,
    reasons,
    checkInId: checkIn.id,
    createdAt: now.toISOString(),
  };
}

export const muscleLabel = (m: MuscleGroup) => MUSCLES[m];
export const describeSet = (we: WorkoutExercise) => {
  const ex = exerciseById(we.exerciseId);
  return `${we.sets} × ${we.reps}${ex?.timed ? "s" : ""} · ${we.restSec}s rest`;
};
