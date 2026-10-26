// Auth state for the whole app. Wraps Lovable Cloud's sign-in service and keeps
// the current user in React context so any screen can read it.
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

interface AuthState {
  user: User | null;
  ready: boolean;
}

const AuthContext = createContext<AuthState>({ user: null, ready: false });

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({ user: null, ready: false });
  const queryClient = useQueryClient();
  const router = useRouter();

  useEffect(() => {
    let active = true;
    void supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      setState({ user: data.session?.user ?? null, ready: true });
    });

    // Only react to real identity changes. TOKEN_REFRESHED fires roughly every
    // hour and would otherwise clear the cache constantly.
    const sub = supabase.auth.onAuthStateChange((event, session) => {
      if (event !== "SIGNED_IN" && event !== "SIGNED_OUT" && event !== "USER_UPDATED") return;
      queryClient.clear();
      setState({ user: session?.user ?? null, ready: true });
      if (event === "SIGNED_OUT") void router.invalidate();
      // Arriving from a password-reset link: go straight to the new-password form.
      if (event === "SIGNED_IN" && session?.user.recovery_type) void router.navigate({ to: "/reset-password" });
    }).data.subscription;

    return () => {
      active = false;
      sub.unsubscribe();
    };
  }, [queryClient, router]);

  return <AuthContext.Provider value={state}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
