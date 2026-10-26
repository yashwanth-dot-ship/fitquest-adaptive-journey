import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { Download, LogOut, Moon, Sun, Upload } from "lucide-react";
import { toast } from "sonner";
import { Button, ChoiceGroup, Field, Input, PageHeader, Panel } from "@/components/fq";
import { DURATIONS, EQUIPMENT, EXPERIENCE, GOALS, LOCATIONS, WEEKDAYS } from "@/lib/labels";
import { auth, exportState, importState, profiles } from "@/lib/store";
import type { Experience, Goal, Location, Weekday } from "@/lib/types";
import { useCurrentUser } from "@/lib/use-session";

export const Route = createFileRoute("/_authed/settings")({
  head: () => ({
    meta: [
      { title: "Profile & settings — FitQuest" },
      { name: "description", content: "Manage your FitQuest profile, goals, schedule and appearance." },
      { property: "og:title", content: "Profile & settings — FitQuest" },
      { property: "og:description", content: "Manage your FitQuest profile, goals, schedule and appearance." },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const navigate = useNavigate();
  const { user, profile } = useCurrentUser();
  const [name, setName] = useState(profile?.name ?? "");
  const [age, setAge] = useState(String(profile?.age ?? ""));
  const [experience, setExperience] = useState<Experience>(profile?.experience ?? "beginner");
  const [goal, setGoal] = useState<Goal>(profile?.goal ?? "general_fitness");
  const [days, setDays] = useState<Weekday[]>(profile?.workoutDays ?? []);
  const [duration, setDuration] = useState<number>(profile?.typicalDuration ?? 30);
  const [location, setLocation] = useState<Location>(profile?.preferredLocation ?? "home");
  const [equipment, setEquipment] = useState<string[]>(profile?.equipment ?? ["none"]);
  const [errors, setErrors] = useState<{ name?: string; age?: string; days?: string }>({});

  if (!profile) return null;

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    const errs: typeof errors = {};
    if (!name.trim()) errs.name = "Name is required";
    const a = Number(age);
    if (!age || !Number.isInteger(a) || a < 13 || a > 100) errs.age = "Enter an age between 13 and 100";
    if (days.length === 0) errs.days = "Pick at least one day";
    setErrors(errs);
    if (Object.keys(errs).length) return;
    profiles.save({
      ...profile, name: name.trim(), age: a, experience, goal, workoutDays: days,
      typicalDuration: duration, preferredLocation: location, equipment: equipment as never,
    });
    toast.success("Profile saved");
  };

  const setTheme = (theme: "light" | "dark") => {
    profiles.save({ ...profile, theme });
    toast.success(theme === "dark" ? "Dark mode on" : "Light mode on");
  };

  return (
    <>
      <PageHeader eyebrow={user?.email} title="Profile" />

      <form onSubmit={save} className="max-w-2xl space-y-6">
        <Panel className="space-y-6">
          <h2 className="poster text-2xl">About you</h2>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field id="name" label="First name" error={errors.name}>
              <Input id="name" value={name} aria-invalid={!!errors.name} onChange={(e) => setName(e.target.value)} />
            </Field>
            <Field id="age" label="Age" error={errors.age}>
              <Input id="age" type="number" min={13} max={100} value={age} aria-invalid={!!errors.age}
                onChange={(e) => setAge(e.target.value)} />
            </Field>
          </div>
          <ChoiceGroup label="Training experience" value={experience} onChange={(v) => setExperience(v as Experience)}
            options={Object.entries(EXPERIENCE).map(([value, label]) => ({ value, label }))} />
          <ChoiceGroup label="Main goal" value={goal} onChange={(v) => setGoal(v as Goal)}
            options={Object.entries(GOALS).map(([value, label]) => ({ value, label }))} />
        </Panel>

        <Panel className="space-y-6">
          <h2 className="poster text-2xl">Your week</h2>
          <ChoiceGroup label="Days you want to train" value={days} multi error={errors.days}
            onChange={(v) => setDays(v as Weekday[])}
            options={Object.entries(WEEKDAYS).map(([value, label]) => ({ value, label }))} />
          <ChoiceGroup label="Typical session length" value={duration} onChange={(v) => setDuration(v as number)}
            options={DURATIONS.map((d) => ({ value: d, label: `${d} min` }))} />
        </Panel>

        <Panel className="space-y-6">
          <h2 className="poster text-2xl">Your setup</h2>
          <ChoiceGroup label="Where you usually train" value={location} onChange={(v) => setLocation(v as Location)}
            options={Object.entries(LOCATIONS).map(([value, label]) => ({ value, label }))} />
          <ChoiceGroup label="Equipment you have" value={equipment} multi onChange={(v) => setEquipment(v as string[])}
            options={Object.entries(EQUIPMENT).map(([value, label]) => ({ value, label }))} />
        </Panel>

        <Button type="submit" variant="lime" size="lg">Save changes</Button>
      </form>

      <div className="mt-10 max-w-2xl space-y-6">
        <Panel>
          <h2 className="poster text-2xl">Appearance</h2>
          <div className="mt-4 flex gap-3">
            <Button variant={profile.theme === "light" ? "lime" : "outline"} onClick={() => setTheme("light")}>
              <Sun className="size-4" aria-hidden /> Light
            </Button>
            <Button variant={profile.theme === "dark" ? "lime" : "outline"} onClick={() => setTheme("dark")}>
              <Moon className="size-4" aria-hidden /> Dark
            </Button>
          </div>
        </Panel>

        <Panel>
          <h2 className="poster text-2xl">Account</h2>
          <p className="mt-2 text-sm text-muted-foreground">Signed in as {user?.email}</p>
          <Button variant="ghost" className="mt-4"
            onClick={() => { auth.signOut(); navigate({ to: "/login", replace: true }); }}>
            <LogOut className="size-4" aria-hidden /> Log out
          </Button>
        </Panel>
      </div>
    </>
  );
}
