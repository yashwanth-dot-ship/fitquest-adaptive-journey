import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Check, Flag, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button, EmptyState, PageHeader, Panel, Tag, buttonVariants } from "@/components/fq";
import { completedSets } from "@/lib/analytics";
import { discardSession, finishSession, updateSession } from "@/lib/data";
import { exerciseById } from "@/lib/exercises";
import { useRefresh, useToday } from "@/lib/use-session";
import type { WorkoutLog } from "@/lib/types";
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
  const refresh = useRefresh();
  const { activeSession } = useToday();
  // Local draft of the set log, saved to the database a moment after each change.
  const [draft, setDraft] = useState<{ id: string; logs: WorkoutLog[] } | null>(null);
  const [busy, setBusy] = useState(false);
  // Once the session is finished or discarded, stop syncing and stop saving —
  // otherwise a stale draft would be written back over the logged sets.
  const closed = useRef(false);

  useEffect(() => {
    if (closed.current) return;
    if (activeSession && draft?.id !== activeSession.id) {
      setDraft({ id: activeSession.id, logs: activeSession.logs });
    }
  }, [activeSession, draft]);

  useEffect(() => {
    if (!draft || closed.current) return;
    const t = setTimeout(() => {
      void updateSession(draft.id, { logs: draft.logs }).catch(() => toast.error("Couldn't save — check your connection"));
    }, 700);
    return () => clearTimeout(t);
  }, [draft]);

  if (!activeSession || !draft)
    return (
      <>
        <PageHeader eyebrow="FitQuest" title="Session" />
        <EmptyState title="No active session" body="Start today's workout to begin logging sets."
          action={<Link to="/dashboard" className={buttonVariants({ variant: "coral" })}>Back to today</Link>} />
      </>
    );

  const logs = draft.logs;
  const totalSets = logs.reduce((t, l) => t + l.sets.length, 0);
  const doneSets = logs.reduce((t, l) => t + l.sets.filter((x) => x.done).length, 0);
  const patch = (next: WorkoutLog[]) => setDraft({ id: activeSession.id, logs: next });

  const setSet = (exIdx: number, setIdx: number, field: "reps" | "weight" | "done", value: number | boolean) => {
    patch(logs.map((l, i) =>
      i !== exIdx ? l : { ...l, sets: l.sets.map((st, j) => (j !== setIdx ? st : { ...st, [field]: value })) }));
  };

  const toggleExercise = (exIdx: number) => {
    patch(logs.map((l, i) => {
      if (i !== exIdx) return l;
      const completed = !l.completed;
      return { ...l, completed, sets: l.sets.map((st) => ({ ...st, done: completed ? true : st.done })) };
    }));
  };

  const finish = async () => {
    closed.current = true;
    setBusy(true);
    try {
      await updateSession(activeSession.id, { logs });
      await finishSession(activeSession.id);
      setDraft(null);
      await refresh();
      toast.success("Workout complete — nice work!");
      navigate({ to: "/dashboard" });
    } catch (err) {
      setBusy(false);
      toast.error((err as Error).message);
    }
  };

  const discard = async () => {
    closed.current = true;
    setBusy(true);
    try {
      await discardSession(activeSession.id);
      setDraft(null);
      await refresh();
      toast("Session discarded");
      navigate({ to: "/dashboard" });
    } catch (err) {
      setBusy(false);
      toast.error((err as Error).message);
    }
  };

  return (
    <>
      <PageHeader eyebrow="Live session" title={activeSession.workout.title}>
        <Tag tone="lime">{doneSets}/{totalSets} sets</Tag>
      </PageHeader>

      <div className="mb-6 h-3 overflow-hidden rounded-full bg-muted" role="progressbar"
        aria-valuenow={doneSets} aria-valuemin={0} aria-valuemax={totalSets} aria-label="Session progress">
        <div className="h-full rounded-full bg-lime transition-all" style={{ width: `${totalSets ? (doneSets / totalSets) * 100 : 0}%` }} />
      </div>

      <div className="space-y-4">
        {logs.map((log, exIdx) => {
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
        <Button variant="coral" size="lg" onClick={finish} disabled={busy}>
          <Flag className="size-5" aria-hidden /> Finish workout
        </Button>
        <Button variant="ghost" size="lg" onClick={discard} disabled={busy}>
          <Trash2 className="size-5" aria-hidden /> Discard
        </Button>
      </div>
    </>
  );
}
