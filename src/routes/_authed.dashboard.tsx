import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Flame, Play } from "lucide-react";
import { Button, PageHeader, Panel, StatCard, Tag, buttonVariants } from "@/components/fq";
import { last28Days, streak, thisWeekCount } from "@/lib/analytics";
import { WORKOUT_TYPES } from "@/lib/labels";
import { useFitData, useToday } from "@/lib/use-session";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authed/dashboard")({
  head: () => ({
    meta: [
      { title: "Today — FitQuest" },
      { name: "description", content: "Your adaptive workout for today, based on your time, energy and equipment." },
      { property: "og:title", content: "Today — FitQuest" },
      { property: "og:description", content: "Your adaptive workout for today, based on your time, energy and equipment." },
    ],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  const { data } = useFitData();
  const { activeSession, todaysWorkout } = useToday();
  const profile = data?.profile ?? null;
  const sessions = data?.sessions ?? [];

  const days = last28Days(sessions);
  const week = days.slice(-7);

  return (
    <>
      <PageHeader eyebrow={new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}
        title={`Hey ${profile?.name ?? "there"}`} />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard tone="lime" label="Day streak" value={streak(sessions)} note="Rest days don't break it" />
        <StatCard tone="sky" label="This week" value={thisWeekCount(sessions)} unit="workouts"
          note={profile ? `Goal: ${profile.workoutDays.length} per week` : undefined} />
        <StatCard tone="sun" label="Last 7 days" value={
          <span className="flex items-end gap-1.5 pb-1">
            {week.map((d, i) => (
              <span key={i} title={d.date.toLocaleDateString()}
                className={cn("size-4 rounded-full", d.active ? "bg-on-brand" : "bg-on-brand/25")} />
            ))}
          </span>
        } note={days.filter((d) => d.active).length + " active days this month"} />
      </div>

      {activeSession ? (
        <Panel tone="ink" className="mt-6 flex flex-wrap items-center justify-between gap-4 rise">
          <div>
            <Tag tone="coral">In progress</Tag>
            <h2 className="poster mt-3 text-3xl">{activeSession.workout.title}</h2>
            <p className="mt-1 opacity-80">You have an unfinished session. Pick up where you left off.</p>
          </div>
          <Link to="/session" className={buttonVariants({ variant: "lime", size: "lg" })}>
            <Play className="size-5" aria-hidden /> Resume workout
          </Link>
        </Panel>
      ) : todaysWorkout ? (
        <Panel tone="card" className="mt-6 rise">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <Tag tone="lime">Today's plan</Tag>
              <h2 className="poster mt-3 text-3xl sm:text-4xl">{todaysWorkout.title}</h2>
              <p className="mt-2 text-muted-foreground">
                {todaysWorkout.durationMin} min · {todaysWorkout.difficulty} · {WORKOUT_TYPES[todaysWorkout.type]}
              </p>
            </div>
            <Link to="/workout" className={buttonVariants({ variant: "primary", size: "lg" })}>
              View workout <ArrowRight className="size-5" aria-hidden />
            </Link>
          </div>
          <ul className="mt-5 space-y-2 border-t border-border pt-5">
            {todaysWorkout.reasons.slice(0, 3).map((r, i) => (
              <li key={i} className="flex gap-2 text-sm text-muted-foreground">
                <Flame className="mt-0.5 size-4 shrink-0 text-coral" aria-hidden /> {r}
              </li>
            ))}
          </ul>
        </Panel>
      ) : (
        <Panel tone="coral" className="mt-6 flex flex-wrap items-center justify-between gap-4 rise">
          <div>
            <h2 className="poster text-3xl sm:text-4xl">Ready when you are</h2>
            <p className="mt-2 max-w-md opacity-85">
              Do a 30-second check-in and FitQuest builds today's workout around your time, energy, sleep and equipment.
            </p>
          </div>
          <Link to="/check-in" className={buttonVariants({ variant: "outline", size: "lg" })}>
            Check in now <ArrowRight className="size-5" aria-hidden />
          </Link>
        </Panel>
      )}

      <div className="mt-10 flex items-center justify-between">
        <h2 className="poster text-2xl">Recent sessions</h2>
        <Link to="/history" className="text-sm font-bold underline">View all</Link>
      </div>
      <RecentSessions />
    </>
  );
}

function RecentSessions() {
  const { data } = useFitData();
  const sessions = data?.sessions ?? [];
  const recent = sessions.filter((s) => s.finishedAt).sort((a, b) => b.startedAt.localeCompare(a.startedAt)).slice(0, 3);
  if (recent.length === 0)
    return <p className="mt-4 text-muted-foreground">No sessions yet — your finished workouts will show up here.</p>;
  return (
    <div className="mt-4 grid gap-4 md:grid-cols-3">
      {recent.map((s) => (
        <Panel key={s.id}>
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            {new Date(s.startedAt).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })}
          </p>
          <h3 className="poster mt-2 text-xl leading-tight">{s.workout.title}</h3>
          <p className="mt-1 text-sm text-muted-foreground">{s.workout.durationMin} min · {s.workout.exercises.length} exercises</p>
        </Panel>
      ))}
    </div>
  );
}
