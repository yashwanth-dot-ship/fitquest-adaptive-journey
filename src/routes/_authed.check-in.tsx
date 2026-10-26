import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Zap } from "lucide-react";
import { toast } from "sonner";
import { Button, ChoiceGroup, Disclaimer, Field, PageHeader, Panel, Textarea } from "@/components/fq";
import { submitCheckIn } from "@/lib/data";
import { DURATIONS, ENERGY, EQUIPMENT, LOCATIONS, SLEEP } from "@/lib/labels";
import { useFitData, useRefresh } from "@/lib/use-session";
import type { Energy, Equipment, Location, Sleep } from "@/lib/types";

export const Route = createFileRoute("/_authed/check-in")({
  head: () => ({
    meta: [
      { title: "Daily check-in — FitQuest" },
      { name: "description", content: "Tell FitQuest about your day and get a workout adapted to your time, energy and equipment." },
      { property: "og:title", content: "Daily check-in — FitQuest" },
      { property: "og:description", content: "Tell FitQuest about your day and get a workout adapted to your time, energy and equipment." },
    ],
  }),
  component: CheckInPage,
});

function CheckInPage() {
  const navigate = useNavigate();
  const refresh = useRefresh();
  const { data } = useFitData();
  const profile = data?.profile ?? null;
  const [availableMin, setAvailableMin] = useState<number>(profile?.typicalDuration ?? 30);
  const [energy, setEnergy] = useState<Energy>("medium");
  const [sleep, setSleep] = useState<Sleep>("5to7");
  const [location, setLocation] = useState<Location>(profile?.preferredLocation ?? "home");
  const [equipment, setEquipment] = useState<string[]>(profile?.equipment ?? ["none"]);
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = notes.trim();
    setBusy(true);
    try {
      await submitCheckIn({
        availableMin: availableMin as 20 | 30 | 45 | 60 | 90,
        energy, sleep, location, equipment: equipment as Equipment[],
        ...(trimmed ? { notes: trimmed } : {}),
      });
      await refresh();
      toast.success("Today's workout is ready");
      navigate({ to: "/workout" });
    } catch (err) {
      setBusy(false);
      toast.error((err as Error).message);
    }
  };

  return (
    <>
      <PageHeader eyebrow="30 seconds" title="Daily check-in" />
      <form onSubmit={submit} className="max-w-2xl space-y-8">
        <Panel className="space-y-6">
          <ChoiceGroup label="How much time do you have today?" value={availableMin}
            onChange={(v) => setAvailableMin(v as number)}
            options={DURATIONS.map((d) => ({ value: d, label: `${d} min` }))} />
          <ChoiceGroup label="Energy level" value={energy} onChange={(v) => setEnergy(v as Energy)}
            options={Object.entries(ENERGY).map(([value, label]) => ({ value, label }))} />
          <ChoiceGroup label="How did you sleep?" value={sleep} onChange={(v) => setSleep(v as Sleep)}
            options={Object.entries(SLEEP).map(([value, label]) => ({ value, label }))} />
        </Panel>
        <Panel className="space-y-6">
          <ChoiceGroup label="Where are you training?" value={location} onChange={(v) => setLocation(v as Location)}
            options={Object.entries(LOCATIONS).map(([value, label]) => ({ value, label }))} />
          <ChoiceGroup label="Equipment available right now" value={equipment} multi
            onChange={(v) => setEquipment(v as string[])}
            options={Object.entries(EQUIPMENT).map(([value, label]) => ({ value, label }))} />
          <Field id="notes" label="Anything else?" hint="Optional — sore muscles, a busy day, a niggle to work around.">
            <Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. shoulders a bit tight, keep it easy on pressing" maxLength={300} />
          </Field>
        </Panel>
        <div className="space-y-3">
          <Button type="submit" variant="coral" size="lg" className="w-full sm:w-auto" disabled={busy}>
            <Zap className="size-5" aria-hidden /> {busy ? "Building your workout…" : "Build today's workout"}
          </Button>
          <Disclaimer />
        </div>
      </form>
    </>
  );
}
