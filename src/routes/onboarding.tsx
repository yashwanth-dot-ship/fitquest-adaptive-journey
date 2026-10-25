import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button, ChoiceGroup, Field, Input, Logo, Panel } from "@/components/fq";
import { DURATIONS, EQUIPMENT, EXPERIENCE, GOALS, LOCATIONS, WEEKDAYS } from "@/lib/labels";
import { getState, profiles } from "@/lib/store";
import type { Experience, Goal, Location, Weekday } from "@/lib/types";

export const Route = createFileRoute("/onboarding")({
  ssr: false,
  beforeLoad: () => {
    const s = getState();
    if (!s.currentUserId) throw redirect({ to: "/login", search: { redirect: "/onboarding" } });
    if (s.profiles[s.currentUserId]) throw redirect({ to: "/dashboard" });
  },
  head: () => ({
    meta: [
      { title: "Set up your profile — FitQuest" },
      { name: "description", content: "Tell FitQuest about your goals, schedule and equipment so it can adapt your workouts." },
      { property: "og:title", content: "Set up your profile — FitQuest" },
      { property: "og:description", content: "Tell FitQuest about your goals, schedule and equipment so it can adapt your workouts." },
    ],
  }),
  component: OnboardingPage,
});

const STEPS = ["About you", "Your week", "Your setup"] as const;

function OnboardingPage() {
  const navigate = useNavigate();
  const uid = getState().currentUserId!;
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [experience, setExperience] = useState<Experience>("beginner");
  const [goal, setGoal] = useState<Goal>("general_fitness");
  const [days, setDays] = useState<Weekday[]>(["mon", "wed", "fri"]);
  const [duration, setDuration] = useState<number>(30);
  const [location, setLocation] = useState<Location>("home");
  const [equipment, setEquipment] = useState<string[]>(["none"]);
  const [errors, setErrors] = useState<{ name?: string; age?: string; days?: string }>({});

  const next = () => {
    if (step === 0) {
      const e: typeof errors = {};
      if (!name.trim()) e.name = "Tell us what to call you";
      const a = Number(age);
      if (!age || !Number.isInteger(a) || a < 13 || a > 100) e.age = "Enter an age between 13 and 100";
      setErrors(e);
      if (Object.keys(e).length) return;
    }
    if (step === 1 && days.length === 0) {
      setErrors({ days: "Pick at least one day" });
      return;
    }
    setErrors({});
    setStep(step + 1);
  };

  const finish = () => {
    profiles.save({
      userId: uid,
      name: name.trim(),
      age: Number(age),
      experience,
      goal,
      workoutDays: days,
      typicalDuration: duration,
      preferredLocation: location,
      equipment: equipment as never,
      theme: "light",
    });
    navigate({ to: "/dashboard" });
  };

  return (
    <main className="mx-auto max-w-2xl px-5 py-10 md:py-16">
      <div className="mb-10 flex items-center justify-between">
        <Logo />
        <span className="text-sm font-semibold text-muted-foreground">
          Step {step + 1} of {STEPS.length}
        </span>
      </div>
      <div className="mb-8 flex gap-2" aria-hidden>
        {STEPS.map((s, i) => (
          <div key={s} className={`h-2 flex-1 rounded-full ${i <= step ? "bg-lime" : "bg-muted"}`} />
        ))}
      </div>

      <h1 className="poster text-4xl leading-none sm:text-5xl">{STEPS[step]}</h1>
      <p className="mt-3 text-muted-foreground">
        {step === 0 && "FitQuest adapts every session to you. This takes about a minute."}
        {step === 1 && "When do you usually train? You'll still check in each day — this just sets the baseline."}
        {step === 2 && "Where do you train and what do you have? You can change this at every check-in."}
      </p>

      <Panel className="mt-8 space-y-6">
        {step === 0 && (
          <>
            <Field id="name" label="First name" error={errors.name}>
              <Input id="name" value={name} autoComplete="given-name" aria-invalid={!!errors.name}
                onChange={(e) => setName(e.target.value)} placeholder="Alex" />
            </Field>
            <Field id="age" label="Age" error={errors.age}>
              <Input id="age" type="number" min={13} max={100} value={age} aria-invalid={!!errors.age}
                onChange={(e) => setAge(e.target.value)} placeholder="21" />
            </Field>
            <ChoiceGroup label="Training experience" value={experience} onChange={(v) => setExperience(v as Experience)}
              options={Object.entries(EXPERIENCE).map(([value, label]) => ({ value, label }))} />
            <ChoiceGroup label="Main goal" value={goal} onChange={(v) => setGoal(v as Goal)}
              options={Object.entries(GOALS).map(([value, label]) => ({ value, label }))} />
          </>
        )}
        {step === 1 && (
          <>
            <ChoiceGroup label="Days you want to train" value={days} multi error={errors.days}
              onChange={(v) => setDays(v as Weekday[])}
              options={Object.entries(WEEKDAYS).map(([value, label]) => ({ value, label }))} />
            <ChoiceGroup label="Typical session length" value={duration} onChange={(v) => setDuration(v as number)}
              options={DURATIONS.map((d) => ({ value: d, label: `${d} min` }))} />
          </>
        )}
        {step === 2 && (
          <>
            <ChoiceGroup label="Where you usually train" value={location} onChange={(v) => setLocation(v as Location)}
              options={Object.entries(LOCATIONS).map(([value, label]) => ({ value, label }))} />
            <ChoiceGroup label="Equipment you have" value={equipment} multi onChange={(v) => setEquipment(v as string[])}
              options={Object.entries(EQUIPMENT).map(([value, label]) => ({ value, label }))} />
          </>
        )}
      </Panel>

      <div className="mt-8 flex items-center justify-between">
        <Button variant="ghost" disabled={step === 0} onClick={() => setStep(step - 1)}>
          <ArrowLeft className="size-4" aria-hidden /> Back
        </Button>
        {step < STEPS.length - 1 ? (
          <Button variant="lime" onClick={next}>
            Continue <ArrowRight className="size-4" aria-hidden />
          </Button>
        ) : (
          <Button variant="coral" size="lg" onClick={finish}>
            Start my journey
          </Button>
        )}
      </div>
    </main>
  );
}
