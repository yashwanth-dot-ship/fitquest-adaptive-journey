import { createFileRoute, Link } from "@tanstack/react-router";
import { Clock, Flame, LineChart, MapPin, MessageSquareText, Zap } from "lucide-react";
import hero from "@/assets/hero.jpg";
import { Logo, Panel, Tag, buttonVariants, Eyebrow } from "@/components/fq";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "FitQuest — A workout built for your day, not a plan" },
      { name: "description", content: "Adaptive fitness for students: check in with your time, energy, sleep and gear, and get a workout that fits today." },
      { property: "og:title", content: "FitQuest — A workout built for your day, not a plan" },
      { property: "og:description", content: "Adaptive fitness for students: check in with your time, energy, sleep and gear, and get a workout that fits today." },
    ],
  }),
  component: Landing,
});

const STEPS = [
  { tone: "sky", n: "01", t: "Check in", d: "Tell FitQuest your time, energy, sleep, location, and gear. Takes about 20 seconds." },
  { tone: "sun", n: "02", t: "Get today's session", d: "An app-generated plan adapts to your history and constraints — with a plain-language reason behind it." },
  { tone: "coral", n: "03", t: "Move & log", d: "Tick off sets, note weights and reps, finish strong, and watch your streak climb." },
] as const;

const FEATURES = [
  { icon: Zap, tone: "bg-lime", t: "Adaptive, not prescriptive", d: "Every session reshapes around your real day instead of a fixed calendar." },
  { icon: Clock, tone: "bg-coral", t: "Fits any gap between classes", d: "Pick 20, 30, 45, 60, or 90 minutes — the plan scales to match." },
  { icon: MapPin, tone: "bg-sky", t: "Gym, home, or outdoors", d: "Tell us your location and what you've got — a mat, a backpack, or a full rack." },
  { icon: Flame, tone: "bg-sun", t: "Streaks that feel fair", d: "Short, doable sessions keep momentum going without burnout." },
  { icon: LineChart, tone: "bg-lime", t: "Progress you can see", d: "Consistency, volume, and personal records — no calorie math required." },
  { icon: MessageSquareText, tone: "bg-coral", t: "Honest explanations", d: "A clear \"why this workout?\" note so you understand every recommendation." },
];

const PREVIEW = [
  ["Goblet squat", "Dumbbell · 4 sets × 10 · 45s rest"],
  ["Reverse lunge", "Bodyweight · 3 sets × 12 · 45s rest"],
  ["Glute bridge", "Bodyweight · 3 sets × 15 · 30s rest"],
  ["Wall sit", "Isometric · 3 × 30s · 30s rest"],
];

function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-background/95 ring-1 ring-border">
        <div className="mx-auto flex max-w-[76rem] items-center justify-between px-6 py-4">
          <Link to="/" aria-label="FitQuest home"><Logo /></Link>
          <nav className="hidden items-center gap-8 text-sm font-medium md:flex">
            <a href="#how" className="transition-colors hover:text-coral">How it works</a>
            <a href="#features" className="transition-colors hover:text-coral">Features</a>
            <a href="#dashboard" className="transition-colors hover:text-coral">Dashboard</a>
            <Link to="/login" search={{}} className="transition-colors hover:text-coral">Log in</Link>
          </nav>
          <Link to="/signup" className={buttonVariants({ variant: "coral", size: "sm" })}>Start</Link>
        </div>
      </header>

      <section className="rule-b">
        <div className="mx-auto grid max-w-[76rem] items-center gap-10 px-6 py-16 lg:grid-cols-[1.05fr_.95fr] lg:py-24">
          <div className="rise">
            <Tag tone="sky" className="gap-2 px-4 py-1.5"><span className="size-2 rounded-full bg-ink" /> Adaptive fitness for real life</Tag>
            <h1 className="poster mt-6 text-6xl leading-[0.92] text-balance sm:text-7xl lg:text-8xl xl:text-9xl">
              A workout <span className="text-coral">built for</span> your day, <span className="text-lime [-webkit-text-stroke:2px_var(--ink)]">not a plan.</span>
            </h1>
            <p className="mt-6 max-w-[46ch] text-lg leading-relaxed text-muted-foreground">
              FitQuest asks how much time, energy, and equipment you actually have today — then builds the session that fits. No rigid plans. No guilt. Just the right move for right now.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link to="/signup" className={buttonVariants({ variant: "primary", size: "lg" })}>Start your fitness journey</Link>
              <a href="#dashboard" className={buttonVariants({ variant: "lime", size: "lg" })}>See the dashboard</a>
            </div>
            <div className="mt-8 flex flex-wrap gap-x-8 gap-y-2 text-sm font-medium text-muted-foreground">
              <span>Free to start</span><span>No equipment needed</span><span>Built for busy schedules</span>
            </div>
          </div>
          <img src={hero} alt="Student doing push-ups on a rug in a sunlit dorm room" width={912} height={1088}
            className="aspect-[3/4] w-full rounded-[28px] object-cover ring-1 ring-border" />
        </div>
      </section>

      <section id="how" className="rule-b">
        <div className="mx-auto max-w-[76rem] px-6 py-16 lg:py-20">
          <h2 className="poster text-4xl leading-none sm:text-5xl">How it works</h2>
          <p className="mt-3 max-w-[52ch] text-muted-foreground">Three quick steps turn your day into a workout you can actually do.</p>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {STEPS.map((s) => (
              <Panel key={s.n} tone={s.tone} className="rounded-[20px]">
                <span className="poster text-5xl opacity-25">{s.n}</span>
                <h3 className="mt-4 text-xl font-semibold">{s.t}</h3>
                <p className="mt-2 opacity-75">{s.d}</p>
              </Panel>
            ))}
          </div>
        </div>
      </section>

      <section id="features" className="rule-b">
        <div className="mx-auto max-w-[76rem] px-6 py-16 lg:py-20">
          <h2 className="poster text-4xl leading-none sm:text-5xl">Why students stick with it</h2>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <Panel key={f.t} className="rounded-[20px] bg-background">
                <span className={cn("grid size-10 place-items-center rounded-xl text-on-brand", f.tone)}><f.icon className="size-5" aria-hidden /></span>
                <h3 className="mt-4 text-lg font-semibold">{f.t}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{f.d}</p>
              </Panel>
            ))}
          </div>
        </div>
      </section>

      <section id="dashboard" className="rule-b bg-ink text-paper">
        <div className="mx-auto max-w-[76rem] px-6 py-16 lg:py-20">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-lime">Today's dashboard</span>
              <h2 className="poster mt-2 text-4xl leading-none sm:text-5xl">Your day, decoded</h2>
            </div>
            <Link to="/signup" className={buttonVariants({ variant: "lime", size: "sm" })}>Quick check-in</Link>
          </div>
          <div className="mt-10 grid gap-5 lg:grid-cols-[1.3fr_.7fr]">
            <div className="rounded-3xl bg-paper p-6 text-ink sm:p-8">
              <div className="flex flex-wrap gap-3"><Tag tone="lime">Lower body</Tag><Tag tone="coral">Moderate</Tag></div>
              <h3 className="poster mt-5 text-3xl leading-tight sm:text-4xl">Lower-body power · Home</h3>
              <div className="mt-5 grid grid-cols-3 gap-3 text-center">
                {[["30", "Minutes"], ["4", "Exercises"], ["Home", "Location"]].map(([v, l]) => (
                  <div key={l} className="rounded-2xl p-3 ring-1 ring-ink/10">
                    <div className="poster text-3xl">{v}</div>
                    <div className="text-xs font-medium uppercase tracking-wide opacity-50">{l}</div>
                  </div>
                ))}
              </div>
              <ul className="mt-6 space-y-3">
                {PREVIEW.map(([n, d]) => (
                  <li key={n} className="flex items-center justify-between gap-3 rounded-xl px-4 py-3 ring-1 ring-ink/10">
                    <div><div className="font-semibold">{n}</div><div className="text-xs opacity-50">{d}</div></div>
                    <span className="size-6 shrink-0 rounded-md border-2 border-ink/20" />
                  </li>
                ))}
              </ul>
              <div className="mt-6 rounded-2xl bg-sky/25 p-5">
                <Eyebrow>Why this workout?</Eyebrow>
                <p className="mt-2 text-sm opacity-80">You have 30 minutes, slept 5–7 hours, and your energy is medium. You trained chest yesterday, so today focuses on lower body. App-generated recommendation for general wellness — not medical advice.</p>
              </div>
            </div>
            <div className="grid gap-5">
              <Panel tone="coral"><Eyebrow>Current streak</Eyebrow><div className="poster mt-2 text-6xl leading-none">12<span className="text-2xl"> days</span></div><p className="mt-3 text-sm font-medium opacity-80">Keep the chain going.</p></Panel>
              <Panel tone="sun"><Eyebrow>This week</Eyebrow><div className="poster mt-2 text-6xl leading-none">4<span className="text-2xl"> / 5</span></div><p className="mt-3 text-sm font-medium opacity-80">One more hits your weekly goal.</p></Panel>
              <Panel tone="sky"><Eyebrow>Goal</Eyebrow><div className="poster mt-2 text-3xl leading-tight">General fitness</div><p className="mt-3 text-sm font-medium opacity-80">Consistency over intensity.</p></Panel>
            </div>
          </div>
        </div>
      </section>

      <section className="rule-b bg-lime text-on-brand">
        <div className="mx-auto flex max-w-[76rem] flex-col items-start gap-6 px-6 py-16 lg:flex-row lg:items-center lg:justify-between lg:py-20">
          <h2 className="poster max-w-[18ch] text-5xl leading-[0.95] sm:text-6xl">Ready to move on your terms?</h2>
          <Link to="/signup" className={cn(buttonVariants({ size: "lg" }), "bg-ink text-lime")}>Start your fitness journey</Link>
        </div>
      </section>

      <footer className="bg-ink text-paper">
        <div className="mx-auto flex max-w-[76rem] flex-col gap-6 px-6 py-10 md:flex-row md:items-center md:justify-between">
          <Logo inverted />
          <p className="max-w-[46ch] text-sm opacity-60">Recommendations are general wellness guidance generated by the app — not medical advice. Consult a professional before starting a new program.</p>
          <div className="flex gap-6 text-sm font-medium opacity-70">
            <Link to="/login" search={{}} className="hover:text-lime">Log in</Link>
            <Link to="/signup" className="hover:text-lime">Sign up</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
