import { createFileRoute } from "@tanstack/react-router";
import { EmptyState, PageHeader, Panel, StatCard, Tag } from "@/components/fq";
import { last28Days, monthConsistency, personalRecords, streak, thisWeekCount, weeklySeries } from "@/lib/analytics";
import { exerciseById } from "@/lib/exercises";
import { useCurrentUser, useMySessions } from "@/lib/use-session";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authed/progress")({
  head: () => ({
    meta: [
      { title: "Progress — FitQuest" },
      { name: "description", content: "Your streaks, consistency, weekly volume and personal records on FitQuest." },
      { property: "og:title", content: "Progress — FitQuest" },
      { property: "og:description", content: "Your streaks, consistency, weekly volume and personal records on FitQuest." },
    ],
  }),
  component: ProgressPage,
});

function ProgressPage() {
  const { profile } = useCurrentUser();
  const sessions = useMySessions();
  const finishedCount = sessions.filter((s) => s.finishedAt).length;

  if (finishedCount === 0)
    return (
      <>
        <PageHeader eyebrow="FitQuest" title="Progress" />
        <EmptyState title="Nothing to measure yet" body="Finish your first workout and your stats, streaks and records will appear here." />
      </>
    );

  const weeks = weeklySeries(sessions, 8);
  const maxWorkouts = Math.max(1, ...weeks.map((w) => w.workouts));
  const consistency = monthConsistency(sessions, profile?.workoutDays.length ?? 3);
  const prs = personalRecords(sessions);
  const days = last28Days(sessions);

  return (
    <>
      <PageHeader eyebrow="FitQuest" title="Progress" />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard tone="lime" label="Day streak" value={streak(sessions)} note="Rest days don't break it" />
        <StatCard tone="sky" label="This week" value={thisWeekCount(sessions)} unit="workouts"
          note={profile ? `Goal: ${profile.workoutDays.length} per week` : undefined} />
        <StatCard tone="coral" label="28-day consistency" value={consistency.pct} unit="%"
          note={`${consistency.done} of ~${consistency.planned} planned sessions`} />
      </div>

      <Panel className="mt-6">
        <h2 className="poster text-2xl">Workouts per week</h2>
        <div className="mt-6 flex h-40 items-end gap-2" role="img"
          aria-label={`Bar chart of workouts per week: ${weeks.map((w) => `${w.label}: ${w.workouts}`).join(", ")}`}>
          {weeks.map((w, i) => (
            <div key={i} className="flex flex-1 flex-col items-center gap-2">
              <span className="text-xs font-bold">{w.workouts || ""}</span>
              <div className={cn("w-full rounded-t-lg", w.workouts ? "bg-lime" : "bg-muted")}
                style={{ height: `${Math.max(4, (w.workouts / maxWorkouts) * 100)}%` }} />
              <span className="text-[10px] font-semibold text-muted-foreground">{w.label}</span>
            </div>
          ))}
        </div>
      </Panel>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Panel>
          <h2 className="poster text-2xl">Last 28 days</h2>
          <div className="mt-5 grid grid-cols-7 gap-2">
            {days.map((d, i) => (
              <div key={i} title={d.date.toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                className={cn("aspect-square rounded-lg", d.active ? "bg-lime" : "bg-muted")} />
            ))}
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            {days.filter((d) => d.active).length} active days in the last four weeks.
          </p>
        </Panel>

        <Panel>
          <h2 className="poster text-2xl">Personal records</h2>
          {prs.length === 0 ? (
            <p className="mt-4 text-sm text-muted-foreground">
              Log weights during a session and your best lifts will show up here.
            </p>
          ) : (
            <ul className="mt-4 space-y-3">
              {prs.slice(0, 6).map((pr) => (
                <li key={pr.exerciseId} className="flex items-center justify-between gap-3 border-b border-border pb-3 last:border-0">
                  <div>
                    <p className="font-bold">{exerciseById(pr.exerciseId)?.name ?? pr.exerciseId}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(pr.date).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                    </p>
                  </div>
                  <Tag tone="sun">{pr.weight} kg × {pr.reps}</Tag>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
    </>
  );
}
