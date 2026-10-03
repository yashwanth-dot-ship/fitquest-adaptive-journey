import type { Energy, Equipment, Experience, Goal, Location, MuscleGroup, Sleep, Weekday, WorkoutType } from "./types";

export const GOALS: Record<Goal, string> = {
  muscle_gain: "Muscle gain",
  fat_loss: "Fat loss",
  general_fitness: "General fitness",
  strength: "Strength",
  endurance: "Endurance",
};
export const EXPERIENCE: Record<Experience, string> = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  advanced: "Advanced",
};
export const LOCATIONS: Record<Location, string> = { gym: "Gym", home: "Home", outdoor: "Outdoor" };
export const ENERGY: Record<Energy, string> = { low: "Low", medium: "Medium", high: "High" };
export const SLEEP: Record<Sleep, string> = { lt5: "<5 hrs", "5to7": "5–7 hrs", "7plus": "7+ hrs" };
export const EQUIPMENT: Record<Equipment, string> = {
  none: "Bodyweight only",
  dumbbells: "Dumbbells",
  barbell: "Barbell",
  kettlebell: "Kettlebell",
  bands: "Resistance bands",
  pullup_bar: "Pull-up bar",
  bench: "Bench",
  machines: "Machines",
  jump_rope: "Jump rope",
};
export const MUSCLES: Record<MuscleGroup, string> = {
  chest: "Chest", back: "Back", shoulders: "Shoulders", arms: "Arms", core: "Core",
  quads: "Quads", hamstrings: "Hamstrings", glutes: "Glutes", calves: "Calves",
  full_body: "Full body", cardio: "Cardio",
};
export const WORKOUT_TYPES: Record<WorkoutType, string> = {
  upper: "Upper body", lower: "Lower body", full_body: "Full body", push: "Push",
  pull: "Pull", conditioning: "Conditioning", mobility: "Mobility & recovery",
};
export const WEEKDAYS: Record<Weekday, string> = {
  mon: "Mon", tue: "Tue", wed: "Wed", thu: "Thu", fri: "Fri", sat: "Sat", sun: "Sun",
};
export const DURATIONS = [20, 30, 45, 60, 90] as const;
