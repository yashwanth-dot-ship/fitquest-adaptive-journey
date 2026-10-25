import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Check, Flag, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button, EmptyState, PageHeader, Panel, Tag, buttonVariants } from "@/components/fq";
import { exerciseById } from "@/lib/exercises";
import { completedSets } from "@/lib/analytics";
import { sessions, useAppState } from "@/lib/store";
import type { WorkoutSession } from "@/lib/types";
import { useCurrentUser } from "@/lib/use-session";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authed/session")({
  head: () => ({
    meta: [
      { title: "Workout session — FitQuest" },
      { name: "description", content: "Log your sets and finish today's FitQuest session." },
      { property: "og:title", content: "Workout session — FitQuest" },
      { property: "og:description", content: "Log your sets and finish today's FitQuest session." },
    ],
  }),
  component: SessionPage,
});

function SessionPage() {
  const navigate = useNavigate();
  const { uid } = useCurrentUser();
  const session = useAppState((s) => {
    const id = uid ? s.activeSessionId[uid] : undefined;
    return id ? s.sessions.find((x) => x.id === id && !x.finishedAt) : undefined;
  });

  if (!session)
    return (
      <>
        <PageHeader eyebrow="FitQuest" title="Session" />
        <EmptyState title="No active session" body="Start today's workout to begin logging sets."
          action={<Link to="/dashboard" className={buttonVariants({ variant: "coral" })}>Back to today</Link>} />
      </>
    );

  const totalSets = session.logs.reduce((t, l) => t + l.sets.length, 0);
  const doneSets = completedSets(session);

  const patch = (next: WorkoutSession) => sessions.update(session.id, { logs: next.logs });

  const setSet = (exIdx: number, setIdx: number, field: "reps" | "weight" | "done", value: number | boolean) => {
    const logs = session.logs.map((l, i) =>
      i !== exIdx ? l : { ...l, sets: l.sets.map((st, j) => (j !== setIdx ? st : { ...st, [field]: value })) });
    patch({ ...session, logs });
  };

  const toggleExercise = (exIdx: number) => {
    const logs = session.logs.map((l, i) => {
      if (i !== exIdx) return l;
      const completed = !l.completed;
      return { ...l, completed, sets: l.sets.map((st) => ({ ...st, done: completed ? true : st.done })) };
    });
    patch({ ...session, logs });
  };

  const finish = () => {
    sessions.finish(session.id);
    toast.success("Workout complete — nice work!");
    navigate({ to: "/dashboard" });
  };

  return (
    <>
      <PageHeader eyebrow="Live session" title={session.workout.title}>
        <Tag tone="lime">{doneSets}/{totalSets} sets</Tag>
      </PageHeader>

      <div className="mb-6 h-3 overflow-hidden rounded-full bg-muted" role="progressbar"
        aria-valuenow={doneSets} aria-valuemin={0} aria-valuemax={totalSets} aria-label="Session progress">
        <div className="h-full rounded-full bg-lime transition-all" style={{ width: `${totalSets ? (doneSets / totalSets) * 100 : 0}%` }} />
      </div>

      <div className="space-y-4">
        {session.logs.map((log, exIdx) => {
          const ex = exerciseById(log.exerciseId);
          if (!ex) return null;
          return (
            <Panel key={log.exerciseId} className={cn(log.completed && "ring-2 ring-lime")}>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="poster text-2xl">{ex.name}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{ex.instructions}</p>
                </div>
                <Button variant={log.completed ? "lime" : "outline"} size="sm" onClick={() => toggleExercise(exIdx)}
                  aria-pressed={log.completed}>
                  <Check className="size-4" aria-hidden /> {log.completed ? "Done" : "Mark done"}
                </Button>
              </div>
              <div className="mt-4 space-y-2">
                <div className="grid grid-cols-[2.5rem_1fr_1fr_2.75rem] items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  <span>Set</span><span>{ex.timed ? "Seconds" : "Reps"}</span><span>Weight (kg)</span><span />
                </div>
                {log.sets.map((st, setIdx) => (
                  <div key={setIdx} className="grid grid-cols-[2.5rem_1fr_1fr_2.75rem] items-center gap-2">
                    <span className="poster text-lg">{setIdx + 1}</span>
                    <input type="number" min={0} inputMode="numeric" aria-label={`Set ${setIdx + 1} ${ex.timed ? "seconds" : "reps"}`}
                      value={st.reps} onChange={(e) => setSet(exIdx, setIdx, "reps", Number(e.target.value))}
                      className="w-full rounded-xl border-2 border-input bg-card px-3 py-2 text-base outline-none focus:border-foreground" />
                    <input type="number" min={0} step={0.5} inputMode="decimal" aria-label={`Set ${setIdx + 1} weight in kg`}
                      value={st.weight} onChange={(e) => setSet(exIdx, setIdx, "weight", Number(e.target.value))}
                      className="w-full rounded-xl border-2 border-input bg-card px-3 py-2 text-base outline-none focus:border-foreground" />
                    <button type="button" aria-label={`Mark set ${setIdx + 1} done`} aria-pressed={st.done}
                      onClick={() => setSet(exIdx, setIdx, "done", !st.done)}
                      className={cn("grid size-10 place-items-center rounded-xl border-2 transition-colors",
                        st.done ? "border-lime bg-lime text-on-brand" : "border-border bg-card hover:border-foreground/40")}>
                      <Check className="size-5" aria-hidden />
                    </button>
                  </div>
                ))}
              </div>
            </Panel>
          );
        })}
      </div>

      <div className="sticky bottom-20 mt-8 flex flex-wrap gap-3 md:bottom-6">
        <Button variant="coral" size="lg" onClick={finish}>
          <Flag className="size-5" aria-hidden /> Finish workout
        </Button>
        <Button variant="ghost" size="lg"
          onClick={() => { sessions.discard(session.id); toast("Session discarded"); navigate({ to: "/dashboard" }); }}>
          <Trash2 className="size-5" aria-hidden /> Discard
        </Button>
      </div>
    </>
  );
}
