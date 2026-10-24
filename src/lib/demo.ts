import { recommendWorkout } from "./recommend";
import type { DailyCheckIn, Location, Profile, WorkoutSession } from "./types";

// Generates a realistic few weeks of history for the demo account.
export function buildDemo(userId: string) {
  const profile: Profile = {
    userId, name: "Alex", age: 21, experience: "intermediate", goal: "general_fitness",
    workoutDays: ["mon", "tue", "thu", "sat"], typicalDuration: 45, preferredLocation: "home",
    equipment: ["dumbbells", "bands", "pullup_bar"], theme: "light",
  };
  const sessions: WorkoutSession[] = [];
  const pattern = [1, 2, 4, 5, 7, 9, 10, 12, 14, 15, 17, 19, 21, 22, 24, 26]; // days ago
  const now = new Date();
  for (const ago of pattern.slice().reverse()) {
    const date = new Date(now);
    date.setDate(now.getDate() - ago);
    date.setHours(17, 30, 0, 0);
    const location: Location = ago % 5 === 0 ? "outdoor" : ago % 3 === 0 ? "gym" : "home";
    const checkIn: DailyCheckIn = {
      id: crypto.randomUUID(), userId, date: date.toISOString(),
      availableMin: ([30, 45, 30, 60, 20] as const)[ago % 5]!,
      energy: (["medium", "high", "medium", "low"] as const)[ago % 4]!,
      sleep: (["7plus", "5to7", "7plus"] as const)[ago % 3]!,
      location, equipment: location === "gym" ? ["dumbbells", "barbell", "machines", "bench"] : profile.equipment,
    };
    const workout = recommendWorkout({ profile, checkIn, history: sessions, now: date });
    const progress = (26 - ago) / 26; // weights trend up over time
    sessions.push({
      id: crypto.randomUUID(), userId, workout,
      startedAt: date.toISOString(),
      finishedAt: new Date(date.getTime() + workout.durationMin * 60000).toISOString(),
      logs: workout.exercises.map((we, i) => ({
        exerciseId: we.exerciseId, completed: true,
        sets: Array.from({ length: we.sets }, () => ({
          reps: we.reps,
          weight: ["dumbbells", "barbell"].some((q) => checkIn.equipment.includes(q as never)) && i % 2 === 0
            ? Math.round((10 + progress * 8 + (location === "gym" ? 20 : 0)) * 2) / 2 : 0,
          done: true,
        })),
      })),
    });
  }
  return { profile, sessions };
}
