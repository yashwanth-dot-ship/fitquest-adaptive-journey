// Domain model — mirrors the future backend entities. Keep IDs as strings (UUID-ready).

export type ID = string;

export type Goal = "muscle_gain" | "fat_loss" | "general_fitness" | "strength" | "endurance";
export type Experience = "beginner" | "intermediate" | "advanced";
export type Location = "gym" | "home" | "outdoor";
export type Energy = "low" | "medium" | "high";
export type Sleep = "lt5" | "5to7" | "7plus";
export type Equipment =
  | "none" | "dumbbells" | "barbell" | "kettlebell" | "bands" | "pullup_bar" | "bench" | "machines" | "jump_rope";
export type MuscleGroup =
  | "chest" | "back" | "shoulders" | "arms" | "core" | "quads" | "hamstrings" | "glutes" | "calves" | "full_body" | "cardio";
export type WorkoutType = "upper" | "lower" | "full_body" | "push" | "pull" | "conditioning" | "mobility";
export type Weekday = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";

export interface User { id: ID; email: string; createdAt: string }

export interface Profile {
  userId: ID;
  name: string;
  age: number;
  experience: Experience;
  goal: Goal;
  workoutDays: Weekday[];
  typicalDuration: number;
  preferredLocation: Location;
  equipment: Equipment[];
  theme: "light" | "dark";
}

export interface Exercise {
  id: ID;
  name: string;
  muscles: MuscleGroup[];
  equipment: Equipment[]; // any one of these suffices; "none" = bodyweight
  locations: Location[];
  difficulty: 1 | 2 | 3;
  kind: "strength" | "conditioning" | "mobility";
  instructions: string;
  timed?: boolean; // reps represent seconds
}

export interface WorkoutExercise {
  exerciseId: ID;
  sets: number;
  reps: number;
  restSec: number;
}

export interface Workout {
  id: ID;
  title: string;
  type: WorkoutType;
  durationMin: number;
  difficulty: "Easy" | "Moderate" | "Challenging";
  muscles: MuscleGroup[];
  exercises: WorkoutExercise[];
  reasons: string[];
  checkInId: ID;
  createdAt: string;
}

export interface DailyCheckIn {
  id: ID;
  userId: ID;
  date: string;
  availableMin: 20 | 30 | 45 | 60 | 90;
  energy: Energy;
  sleep: Sleep;
  location: Location;
  equipment: Equipment[];
  notes?: string;
}

export interface SetLog { reps: number; weight: number; done: boolean }

export interface WorkoutLog {
  exerciseId: ID;
  sets: SetLog[];
  notes?: string;
  completed: boolean;
}

export interface WorkoutSession {
  id: ID;
  userId: ID;
  workout: Workout;
  startedAt: string;
  finishedAt?: string;
  logs: WorkoutLog[];
  notes?: string;
}

export interface ProgressMetric {
  label: string;
  value: number | string;
  hint?: string;
}

export interface PersonalRecord { exerciseId: ID; weight: number; reps: number; date: string }
