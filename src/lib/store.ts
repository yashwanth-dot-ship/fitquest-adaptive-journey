// Client-side repository for the prototype. All persistence goes through this module,
// so it can be replaced with API / database calls without touching UI components.
import { useSyncExternalStore } from "react";
import { recommendWorkout } from "./recommend";
import type { DailyCheckIn, Profile, User, Workout, WorkoutLog, WorkoutSession } from "./types";

interface Account { user: User; password: string }
export interface AppState {
  accounts: Record<string, Account>; // keyed by email (prototype only — never store passwords like this in production)
  currentUserId: string | null;
  profiles: Record<string, Profile>;
  checkIns: DailyCheckIn[];
  todaysWorkout: Record<string, Workout | undefined>;
  sessions: WorkoutSession[];
  activeSessionId: Record<string, string | undefined>;
}

const KEY = "fitquest:v1";
const empty: AppState = {
  accounts: {}, currentUserId: null, profiles: {}, checkIns: [], todaysWorkout: {}, sessions: [], activeSessionId: {},
};

let state: AppState = empty;
let loaded = false;
const listeners = new Set<() => void>();

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) state = { ...empty, ...JSON.parse(raw) };
  } catch { /* ignore */ }
}
function set(next: Partial<AppState>) {
  state = { ...state, ...next };
  try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* ignore */ }
  listeners.forEach((l) => l());
}
export function getState() { load(); return state; }
function subscribe(l: () => void) { listeners.add(l); return () => listeners.delete(l); }

export function useAppState<T>(selector: (s: AppState) => T): T {
  return useSyncExternalStore(subscribe, () => selector(getState()), () => selector(empty));
}

// ---------- Auth ----------
export const auth = {
  signUp(email: string, password: string) {
    const s = getState();
    const key = email.trim().toLowerCase();
    if (s.accounts[key]) throw new Error("An account with this email already exists.");
    const user: User = { id: crypto.randomUUID(), email: key, createdAt: new Date().toISOString() };
    set({ accounts: { ...s.accounts, [key]: { user, password } }, currentUserId: user.id });
    return user;
  },
  signIn(email: string, password: string) {
    const acc = getState().accounts[email.trim().toLowerCase()];
    if (!acc || acc.password !== password) throw new Error("Email or password is incorrect.");
    set({ currentUserId: acc.user.id });
    return acc.user;
  },
  signOut() { set({ currentUserId: null }); },
  requestReset(email: string) {
    // Prototype: a real backend would send a reset email here.
    return Boolean(getState().accounts[email.trim().toLowerCase()]);
  },
  currentUser(): User | null {
    const s = getState();
    return Object.values(s.accounts).find((a) => a.user.id === s.currentUserId)?.user ?? null;
  },
  updateEmail(email: string) {
    const s = getState();
    const entry = Object.entries(s.accounts).find(([, a]) => a.user.id === s.currentUserId);
    if (!entry) return;
    const [oldKey, acc] = entry;
    const key = email.trim().toLowerCase();
    const accounts = { ...s.accounts };
    delete accounts[oldKey];
    accounts[key] = { ...acc, user: { ...acc.user, email: key } };
    set({ accounts });
  },
};

// ---------- Profile ----------
export const profiles = {
  get(userId: string | null) { return userId ? getState().profiles[userId] : undefined; },
  save(p: Profile) { set({ profiles: { ...getState().profiles, [p.userId]: p } }); },
};

// ---------- Check-ins & recommendations ----------
export const checkIns = {
  submit(input: Omit<DailyCheckIn, "id" | "userId" | "date">) {
    const s = getState();
    const uid = s.currentUserId!;
    const profile = s.profiles[uid];
    const checkIn: DailyCheckIn = { ...input, id: crypto.randomUUID(), userId: uid, date: new Date().toISOString() };
    const workout = recommendWorkout({ profile: profile!, checkIn, history: s.sessions.filter((x) => x.userId === uid) });
    set({ checkIns: [...s.checkIns, checkIn], todaysWorkout: { ...s.todaysWorkout, [uid]: workout } });
    return workout;
  },
  latest(s: AppState, uid: string | null) {
    return s.checkIns.filter((c) => c.userId === uid).at(-1);
  },
};

export function isToday(iso?: string) {
  if (!iso) return false;
  const d = new Date(iso), n = new Date();
  return d.toDateString() === n.toDateString();
}

// ---------- Sessions ----------
export const sessions = {
  start(workout: Workout) {
    const s = getState();
    const uid = s.currentUserId!;
    const existing = s.activeSessionId[uid] && s.sessions.find((x) => x.id === s.activeSessionId[uid] && !x.finishedAt);
    if (existing && existing.workout.id === workout.id) return existing;
    const session: WorkoutSession = {
      id: crypto.randomUUID(), userId: uid, workout, startedAt: new Date().toISOString(),
      logs: workout.exercises.map((we) => ({
        exerciseId: we.exerciseId, completed: false,
        sets: Array.from({ length: we.sets }, () => ({ reps: we.reps, weight: 0, done: false })),
      })),
    };
    set({ sessions: [...s.sessions, session], activeSessionId: { ...s.activeSessionId, [uid]: session.id } });
    return session;
  },
  update(id: string, patch: { logs?: WorkoutLog[]; notes?: string }) {
    set({ sessions: getState().sessions.map((x) => (x.id === id ? { ...x, ...patch } : x)) });
  },
  finish(id: string) {
    const s = getState();
    const uid = s.currentUserId!;
    set({
      sessions: s.sessions.map((x) => (x.id === id ? { ...x, finishedAt: new Date().toISOString() } : x)),
      activeSessionId: { ...s.activeSessionId, [uid]: undefined },
      todaysWorkout: { ...s.todaysWorkout, [uid]: undefined },
    });
  },
  discard(id: string) {
    const s = getState();
    const uid = s.currentUserId!;
    set({ sessions: s.sessions.filter((x) => x.id !== id), activeSessionId: { ...s.activeSessionId, [uid]: undefined } });
  },
};

// ---------- Demo data ----------
export async function signInDemo() {
  const { buildDemo } = await import("./demo");
  const s = getState();
  const email = "demo@fitquest.app";
  let acc = s.accounts[email];
  if (!acc) {
    const user: User = { id: crypto.randomUUID(), email, createdAt: new Date().toISOString() };
    acc = { user, password: "demo1234" };
    const demo = buildDemo(user.id);
    set({
      accounts: { ...s.accounts, [email]: acc },
      profiles: { ...s.profiles, [user.id]: demo.profile },
      sessions: [...s.sessions, ...demo.sessions],
    });
  }
  set({ currentUserId: acc.user.id });
}
