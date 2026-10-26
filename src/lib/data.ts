// Data access layer. Every function talks to Lovable Cloud (PostgreSQL).
// Row Level Security is enforced in the database, so a user can only ever read
// or write their own rows — the app never has to trust the client.
import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/integrations/supabase/types";
import { recommendWorkout } from "./recommend";
import { buildSampleData } from "./demo";
import type {
  DailyCheckIn, Equipment, Energy, Experience, Goal, Location, MuscleGroup,
  Profile, Sleep, Weekday, Workout, WorkoutExercise, WorkoutLog, WorkoutSession,
} from "./types";

/** Domain objects stored in JSONB columns. */
const asJson = (v: unknown) => v as Json;

// ---------- error + id helpers ----------
function fail(error: { message: string } | null): void {
  if (error) throw new Error(error.message);
}

async function currentUserId(): Promise<string> {
  const { data } = await supabase.auth.getSession();
  if (!data.session?.user) throw new Error("You need to sign in first.");
  return data.session.user.id;
}

// ---------- row ↔ domain mapping ----------
interface ProfileRow {
  user_id: string; name: string; age: number; experience: string; goal: string;
  workout_days: string[]; typical_duration: number; preferred_location: string;
  equipment: string[]; theme: string;
}

interface CheckInRow {
  id: string; user_id: string; available_min: number; energy: string; sleep: string;
  location: string; equipment: string[]; notes: string | null; created_at: string;
}

interface WorkoutRow {
  id: string; user_id: string; check_in_id: string | null; title: string; type: string;
  duration_min: number; difficulty: string; muscles: string[]; exercises: unknown;
  reasons: string[]; created_at: string;
}

interface SessionRow {
  id: string; user_id: string; workout_id: string; started_at: string;
  finished_at: string | null; logs: unknown; notes: string | null;
}

interface SessionJoin extends SessionRow { workouts: WorkoutRow }

function toProfile(r: ProfileRow): Profile {
  return {
    userId: r.user_id,
    name: r.name,
    age: r.age,
    experience: r.experience as Experience,
    goal: r.goal as Goal,
    workoutDays: r.workout_days as Weekday[],
    typicalDuration: r.typical_duration,
    preferredLocation: r.preferred_location as Location,
    equipment: r.equipment as Equipment[],
    theme: r.theme === "dark" ? "dark" : "light",
  };
}

function toCheckIn(r: CheckInRow): DailyCheckIn {
  return {
    id: r.id,
    userId: r.user_id,
    date: r.created_at,
    availableMin: r.available_min as DailyCheckIn["availableMin"],
    energy: r.energy as Energy,
    sleep: r.sleep as Sleep,
    location: r.location as Location,
    equipment: r.equipment as Equipment[],
    ...(r.notes ? { notes: r.notes } : {}),
  };
}

function toWorkout(r: WorkoutRow): Workout {
  return {
    id: r.id,
    title: r.title,
    type: r.type as Workout["type"],
    durationMin: r.duration_min,
    difficulty: r.difficulty as Workout["difficulty"],
    muscles: r.muscles as MuscleGroup[],
    exercises: r.exercises as WorkoutExercise[],
    reasons: r.reasons,
    checkInId: r.check_in_id ?? "",
    createdAt: r.created_at,
  };
}

function toSession(r: SessionJoin): WorkoutSession {
  return {
    id: r.id,
    userId: r.user_id,
    workout: toWorkout(r.workouts),
    startedAt: r.started_at,
    ...(r.finished_at ? { finishedAt: r.finished_at } : {}),
    logs: (r.logs ?? []) as WorkoutLog[],
    ...(r.notes ? { notes: r.notes } : {}),
  };
}

// ---------- reads ----------
export async function fetchProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase.from("profiles").select("*").eq("user_id", userId).maybeSingle();
  fail(error);
  return data ? toProfile(data as ProfileRow) : null;
}

export async function hasProfile(userId: string): Promise<boolean> {
  const { data, error } = await supabase.from("profiles").select("user_id").eq("user_id", userId).maybeSingle();
  fail(error);
  return Boolean(data);
}

export async function listSessions(): Promise<WorkoutSession[]> {
  const { data, error } = await supabase
    .from("workout_sessions")
    .select("*, workouts(*)")
    .order("started_at", { ascending: false })
    .limit(300);
  fail(error);
  return ((data ?? []) as unknown as SessionJoin[]).map(toSession);
}

export async function listWorkouts(): Promise<Workout[]> {
  const { data, error } = await supabase.from("workouts").select("*").order("created_at", { ascending: false }).limit(100);
  fail(error);
  return ((data ?? []) as WorkoutRow[]).map(toWorkout);
}

export async function listCheckIns(): Promise<DailyCheckIn[]> {
  const { data, error } = await supabase.from("check_ins").select("*").order("created_at", { ascending: false }).limit(100);
  fail(error);
  return ((data ?? []) as CheckInRow[]).map(toCheckIn);
}

// ---------- profile ----------
export async function saveProfile(p: Profile): Promise<void> {
  const { error } = await supabase.from("profiles").upsert({
    user_id: p.userId,
    name: p.name,
    age: p.age,
    experience: p.experience,
    goal: p.goal,
    workout_days: p.workoutDays,
    typical_duration: p.typicalDuration,
    preferred_location: p.preferredLocation,
    equipment: p.equipment,
    theme: p.theme,
  });
  fail(error);
}

// ---------- check-in → recommendation ----------
export async function submitCheckIn(
  input: Omit<DailyCheckIn, "id" | "userId" | "date">,
): Promise<Workout> {
  const userId = await currentUserId();
  const profile = await fetchProfile(userId);
  if (!profile) throw new Error("Please finish setting up your profile first.");

  const { data, error } = await supabase.from("check_ins").insert({
    user_id: userId,
    available_min: input.availableMin,
    energy: input.energy,
    sleep: input.sleep,
    location: input.location,
    equipment: input.equipment,
    notes: input.notes ?? null,
  }).select().single();
  fail(error);

  const checkIn = toCheckIn(data as CheckInRow);
  const history = await listSessions();
  const workout = recommendWorkout({ profile, checkIn, history });

  const { data: row, error: wErr } = await supabase.from("workouts").insert({
    user_id: userId,
    check_in_id: checkIn.id,
    title: workout.title,
    type: workout.type,
    duration_min: workout.durationMin,
    difficulty: workout.difficulty,
    muscles: workout.muscles,
    exercises: asJson(workout.exercises),
    reasons: workout.reasons,
  }).select().single();
  fail(wErr);
  return toWorkout(row as WorkoutRow);
}

// ---------- sessions ----------
export function buildLogs(workout: Workout): WorkoutLog[] {
  return workout.exercises.map((we) => ({
    exerciseId: we.exerciseId,
    completed: false,
    sets: Array.from({ length: we.sets }, () => ({ reps: we.reps, weight: 0, done: false })),
  }));
}

export async function startSession(workout: Workout): Promise<WorkoutSession> {
  const userId = await currentUserId();
  const logs = buildLogs(workout);
  const { data, error } = await supabase.from("workout_sessions").insert({
    user_id: userId, workout_id: workout.id, logs: asJson(logs),
  }).select().single();
  fail(error);
  const row = data as SessionRow;
  return { id: row.id, userId, workout, startedAt: row.started_at, logs };
}

export async function updateSession(
  id: string,
  patch: { logs?: WorkoutLog[]; notes?: string | null },
): Promise<void> {
  const update: { logs?: Json; notes?: string | null } = {};
  if (patch.logs) update.logs = asJson(patch.logs);
  if (patch.notes !== undefined) update.notes = patch.notes;
  const { error } = await supabase.from("workout_sessions").update(update).eq("id", id);
  fail(error);
}

export async function finishSession(id: string): Promise<void> {
  const { error } = await supabase.from("workout_sessions")
    .update({ finished_at: new Date().toISOString() }).eq("id", id);
  fail(error);
}

export async function discardSession(id: string): Promise<void> {
  const { error } = await supabase.from("workout_sessions").delete().eq("id", id);
  fail(error);
}

// ---------- "what should the dashboard show?" ----------
export function deriveToday(sessions: WorkoutSession[], workouts: Workout[]) {
  const activeSession = sessions.find((s) => !s.finishedAt);
  const used = new Set(sessions.map((s) => s.workout.id));
  const today = new Date().toDateString();
  const todaysWorkout = workouts.find((w) => !used.has(w.id) && new Date(w.createdAt).toDateString() === today);
  return { activeSession, todaysWorkout };
}

// ---------- sample history (opt-in, clearly labelled in the UI) ----------
export async function insertSampleHistory(): Promise<number> {
  const userId = await currentUserId();
  const { checkIns, workouts, sessions } = buildSampleData(userId);

  const { error: e1 } = await supabase.from("check_ins").insert(checkIns.map((c) => ({
    id: c.id, user_id: userId, available_min: c.availableMin, energy: c.energy, sleep: c.sleep,
    location: c.location, equipment: c.equipment, notes: c.notes ?? null, created_at: c.date,
  })));
  fail(e1);

  const { error: e2 } = await supabase.from("workouts").insert(workouts.map((w) => ({
    id: w.id, user_id: userId, check_in_id: w.checkInId, title: w.title, type: w.type,
    duration_min: w.durationMin, difficulty: w.difficulty, muscles: w.muscles,
    exercises: asJson(w.exercises), reasons: w.reasons, created_at: w.createdAt,
  })));
  fail(e2);

  const { error: e3 } = await supabase.from("workout_sessions").insert(sessions.map((s) => ({
    id: s.id, user_id: userId, workout_id: s.workout.id, started_at: s.startedAt,
    finished_at: s.finishedAt ?? null, logs: asJson(s.logs), notes: s.notes ?? null,
  })));
  fail(e3);

  return sessions.length;
}

// ---------- export & erasure (data-protection rights) ----------
export async function exportAllData(): Promise<string> {
  const userId = await currentUserId();
  const [profile, checkIns, workouts, sessions] = await Promise.all([
    fetchProfile(userId), listCheckIns(), listWorkouts(), listSessions(),
  ]);
  const { data } = await supabase.auth.getUser();
  return JSON.stringify({
    app: "FitQuest",
    exportedAt: new Date().toISOString(),
    account: { email: data.user?.email ?? null },
    profile, checkIns, workouts,
    sessions: sessions.map((s) => ({
      id: s.id, startedAt: s.startedAt, finishedAt: s.finishedAt ?? null,
      notes: s.notes ?? null, workoutId: s.workout.id, logs: s.logs,
    })),
  }, null, 2);
}

/** Deletes every row this user owns. The profile row cascades to the rest. */
export async function deleteAllData(): Promise<void> {
  const userId = await currentUserId();
  const { error } = await supabase.from("profiles").delete().eq("user_id", userId);
  fail(error);
  await supabase.auth.signOut();
}
