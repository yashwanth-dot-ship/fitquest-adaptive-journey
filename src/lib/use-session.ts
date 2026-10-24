import { auth, useAppState } from "./store";

export function useCurrentUser() {
  const uid = useAppState((s) => s.currentUserId);
  const accounts = useAppState((s) => s.accounts);
  const profile = useAppState((s) => (uid ? s.profiles[uid] : undefined));
  const user = Object.values(accounts).find((a) => a.user.id === uid)?.user ?? null;
  return { uid, user, profile };
}

export function useMySessions() {
  const uid = useAppState((s) => s.currentUserId);
  const all = useAppState((s) => s.sessions);
  return all.filter((x) => x.userId === uid);
}

export { auth };
