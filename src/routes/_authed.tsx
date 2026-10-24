import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { getState } from "@/lib/store";

export const Route = createFileRoute("/_authed")({
  ssr: false,
  beforeLoad: ({ location }) => {
    const s = getState();
    if (!s.currentUserId) throw redirect({ to: "/login", search: { redirect: location.href } });
    if (!s.profiles[s.currentUserId]) throw redirect({ to: "/onboarding" });
  },
  component: () => (
    <AppShell>
      <Outlet />
    </AppShell>
  ),
});
