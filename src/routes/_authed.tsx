import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { supabase } from "@/integrations/supabase/client";
import { useFitData } from "@/lib/use-session";

export const Route = createFileRoute("/_authed")({
  ssr: false,
  beforeLoad: async ({ location }) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw redirect({ to: "/login", search: { redirect: location.href } });
    const { data: profile } = await supabase.from("profiles")
      .select("user_id").eq("user_id", session.user.id).maybeSingle();
    if (!profile) throw redirect({ to: "/onboarding" });
  },
  component: AuthedLayout,
});

function AuthedLayout() {
  const { isPending } = useFitData();
  if (isPending) {
    return (
      <div className="grid min-h-screen place-items-center px-5">
        <p className="text-sm font-semibold text-muted-foreground">Loading your data…</p>
      </div>
    );
  }
  return (
    <AppShell>
      <Outlet />
    </AppShell>
  );
}
