import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Flame, Play } from "lucide-react";
import { toast } from "sonner";
import { Button, Disclaimer, EmptyState, PageHeader, Panel, Tag, buttonVariants } from "@/components/fq";
import { exerciseById } from "@/lib/exercises";
import { startSession } from "@/lib/data";
import { MUSCLES, WORKOUT_TYPES } from "@/lib/labels";
import { describeSet } from "@/lib/recommend";
import { useRefresh, useToday } from "@/lib/use-session";

export const Route = createFileRoute("/_authed/workout")({
  head: () => ({
    meta: [
      { title: "Today's workout — FitQuest" },
      { name: "description", content: "Your adaptive workout for today, with the reasons behind every choice." },
      { property: "og:title", content: "Today's workout — FitQuest" },
      { property: "og:description", content: "Your adaptive workout for today, with the reasons behind every choice." },
    ],
  }),
  component: WorkoutPage,
});

function WorkoutPage() {
  const navigate = useNavigate();
  const refresh = useRefresh();
  const { todaysWorkout } = useToday();
  const [busy, setBusy] = useState(false);

  if (!todaysWorkout)
    return (
      <>
        <PageHeader eyebrow="FitQuest" title="Today's workout" />
        <EmptyState title="No workout yet" body="Do today's check-in first and FitQuest will build your session."
          action={<Link to="/check-in" className={buttonVariants({ variant: "coral" })}>Go to check-in</Link>} />
      </>
    );

  const start = async () => {
    setBusy(true);
    try {
      await startSession(todaysWorkout);
      await refresh();
      navigate({ to: "/session" });
    } catch (err) {
      setBusy(false);
      toast.error((err as Error).message);
    }
  };

  return (
    <>
      <PageHeader eyebrow={WORKOUT_TYPES[todaysWorkout.type]} title={todaysWorkout.title}>
        <div className="flex gap-2">
          <Tag tone="lime">{todaysWorkout.durationMin} min</Tag>
          <Tag tone="sun">{todaysWorkout.difficulty}</Tag>
        </div>
      </PageHeader>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-4">
          {todaysWorkout.exercises.map((we, i) => {
            const ex = exerciseById(we.exerciseId);
            if (!ex) return null;
            return (
              <Panel key={we.exerciseId} className="rise">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      {String(i + 1).padStart(2, "0")} · {ex.muscles.map((m) => MUSCLES[m]).join(" · ")}
                    </p>
                    <h3 className="poster mt-1 text-2xl">{ex.name}</h3>
                  </div>
                  <Tag tone="sky">{describeSet(we)}</Tag>
                </div>
                <p className="mt-3 text-sm text-muted-foreground">{ex.instructions}</p>
              </Panel>
            );
          })}
        </div>

        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <Panel tone="ink">
            <h2 className="poster text-xl">Why this workout</h2>
            <ul className="mt-4 space-y-3">
              {todaysWorkout.reasons.map((r, i) => (
                <li key={i} className="flex gap-2 text-sm opacity-90">
                  <Flame className="mt-0.5 size-4 shrink-0 text-lime" aria-hidden /> {r}
                </li>
              ))}
            </ul>
          </Panel>
          <Button variant="coral" size="lg" className="w-full" onClick={start} disabled={busy}>
            <Play className="size-5" aria-hidden /> {busy ? "Starting…" : "Start workout"}
          </Button>
          <Link to="/check-in" className="block text-center text-sm font-semibold underline">
            Re-do today's check-in
          </Link>
          <Disclaimer />
        </aside>
      </div>
    </>
  );
}
