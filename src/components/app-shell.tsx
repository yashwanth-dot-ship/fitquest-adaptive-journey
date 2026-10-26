import { Link, useNavigate } from "@tanstack/react-router";
import { Activity, CalendarCheck, History, Home, LogOut, Settings, Zap } from "lucide-react";
import type { ReactNode } from "react";
import { Logo, buttonVariants } from "./fq";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/dashboard", label: "Today", icon: Home },
  { to: "/check-in", label: "Check-in", icon: CalendarCheck },
  { to: "/progress", label: "Progress", icon: Activity },
  { to: "/history", label: "History", icon: History },
  { to: "/settings", label: "Profile", icon: Settings },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const logOut = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/login", replace: true });
  };
  return (
    <div className="min-h-screen pb-24 md:pb-0">
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3">
          <Link to="/dashboard" aria-label="FitQuest home"><Logo /></Link>
          <nav className="hidden items-center gap-1 md:flex" aria-label="Main">
            {NAV.map((n) => (
              <Link key={n.to} to={n.to} className="rounded-full px-4 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground"
                activeProps={{ className: "!bg-foreground !text-background" }}>
                {n.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <Link to="/check-in" className={cn(buttonVariants({ variant: "coral", size: "sm" }), "hidden sm:inline-flex")}>
              <Zap className="size-4" aria-hidden /> Quick check-in
            </Link>
            <button aria-label="Log out" className={buttonVariants({ variant: "ghost", size: "icon" })}
              onClick={() => void logOut()}>
              <LogOut className="size-4" />
            </button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-5 py-8 md:py-12">{children}</main>
      <nav aria-label="Mobile" className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t border-border bg-background/95 backdrop-blur md:hidden">
        {NAV.map((n) => (
          <Link key={n.to} to={n.to} className="flex flex-col items-center gap-1 py-3 text-[11px] font-semibold text-muted-foreground"
            activeProps={{ className: "!text-foreground" }}>
            <n.icon className="size-5" aria-hidden />
            {n.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
