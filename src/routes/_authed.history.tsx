import { createFileRoute, Link } from "@tanstack/react-router";
import { EmptyState, PageHeader, Panel, Tag, buttonVariants } from "@/components/fq";
import { completedSets, sessionVolume } from "@/lib/analytics";
import { WORKOUT_TYPES } from "@/lib/labels";
import { useMySessions } from "@/lib/use-session";

export const Route = createFileRoute("/_authed/history")({
  head: () => ({
    meta: [
      { title: "History — FitQuest" },
      { name: "description", content: "Every workout you've finished on FitQuest." },
      { property: "og:title", content: "History — FitQuest" },
      { property: "og:description", content: "Every workout you've finished on FitQuest." },
    ],
  }),
  component: HistoryPage,
});

function HistoryPage() {
  const sessions = useMySessions();
  const done = sessions.filter((s) => s.finishedAt).sort((a, b) => b.startedAt.localeCompare(a.startedAt));

  if (done.length === 0)
    return (
      <>
        <PageHeader eyebrow="FitQuest" title="History" />
        <EmptyState title="No workouts yet" body="Your finished sessions will be listed here, newest first."
          action={<Link to="/check-in" className={buttonVariants({ variant: "coral" })}>Do today's check-in</Link>} />
      </>
    );

  return (
    <>
      <PageHeader eyebrow={`${done.length} session${done.length === 1 ? "" : "s"}`} title="History" />
      <div className="space-y-4">
        {done.map((s) => {
          const volume = sessionVolume(s);
          return (
            <Panel key={s.id} className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  {new Date(s.startedAt).toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" })}
                </p>
                <h3 className="poster mt-1 text-2xl">{s.workout.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {WORKOUT_TYPES[s.workout.type]} · {s.workout.exercises.length} exercises · {completedSets(s)} sets logged
                  {volume > 0 && ` · ${Math.round(volume).toLocaleString()} kg total volume`}
                </p>
              </div>
              <div className="flex gap-2">
                <Tag tone="sky">{s.workout.durationMin} min</Tag>
                <Tag tone="muted">{s.workout.difficulty}</Tag>
              </div>
            </Panel>
          );
        })}
      </div>
    </>
  );
}
