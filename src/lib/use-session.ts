// Shared hooks: the signed-in user and their FitQuest data.
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "./auth";
import { deriveToday, fetchProfile, listSessions, listWorkouts } from "./data";
import type { Profile, Workout, WorkoutSession } from "./types";

export interface FitData {
  profile: Profile | null;
  sessions: WorkoutSession[];
  workouts: Workout[];
}

/** One cache entry for the whole signed-in area. */
export function useFitData() {
  const { user } = useAuth();
  return useQuery<FitData>({
    queryKey: ["fit", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const id = user!.id;
      const [profile, sessions, workouts] = await Promise.all([
        fetchProfile(id), listSessions(), listWorkouts(),
      ]);
      return { profile, sessions, workouts };
    },
  });
}

/** Dashboard state: an unfinished session, or a plan waiting to be started. */
export function useToday() {
  const query = useFitData();
  const d = query.data;
  const derived = d ? deriveToday(d.sessions, d.workouts) : { activeSession: undefined, todaysWorkout: undefined };
  return { ...query, ...derived };
}

/** Call after any write so screens re-read from the database. */
export function useRefresh() {
  const qc = useQueryClient();
  return () => qc.invalidateQueries({ queryKey: ["fit"] });
}
