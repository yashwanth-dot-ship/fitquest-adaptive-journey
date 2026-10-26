import { describe, expect, it } from "vitest";
import { deriveToday } from "@/lib/data";
import type { Workout, WorkoutSession } from "@/lib/types";

const iso = (offsetDays: number) => new Date(Date.now() - offsetDays * 86400000).toISOString();

const plan = (id: string, createdAt: string): Workout => ({
  id, title: "Test plan", type: "full_body", durationMin: 30, difficulty: "Moderate",
  muscles: ["chest"], exercises: [{ exerciseId: "pushup", sets: 3, reps: 10, restSec: 60 }],
  reasons: [], checkInId: "c1", createdAt,
});

const session = (workout: Workout, finished: boolean): WorkoutSession => ({
  id: `s-${workout.id}`, userId: "u1", workout, startedAt: workout.createdAt,
  ...(finished ? { finishedAt: workout.createdAt } : {}), logs: [],
});

describe("dashboard state", () => {
  it("shows a plan created today that has not been started", () => {
    const w = plan("w1", iso(0));
    const { activeSession, todaysWorkout } = deriveToday([], [w]);
    expect(activeSession).toBeUndefined();
    expect(todaysWorkout?.id).toBe("w1");
  });

  it("flags an unfinished session as in progress instead of offering the plan", () => {
    const w = plan("w1", iso(0));
    const { activeSession, todaysWorkout } = deriveToday([session(w, false)], [w]);
    expect(activeSession?.id).toBe("s-w1");
    expect(todaysWorkout).toBeUndefined();
  });

  it("offers a fresh check-in once today's session is finished", () => {
    const w = plan("w1", iso(0));
    const { activeSession, todaysWorkout } = deriveToday([session(w, true)], [w]);
    expect(activeSession).toBeUndefined();
    expect(todaysWorkout).toBeUndefined();
  });

  it("ignores a plan from yesterday", () => {
    const w = plan("w1", iso(1));
    expect(deriveToday([], [w]).todaysWorkout).toBeUndefined();
  });
});
