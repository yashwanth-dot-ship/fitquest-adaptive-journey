import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { AuthLayout } from "@/components/auth-layout";
import { Button, Field, Input } from "@/components/fq";
import { auth, getState, signInDemo } from "@/lib/store";
import { fieldErrors, loginSchema } from "@/lib/validation";

export const Route = createFileRoute("/login")({
  validateSearch: z.object({ redirect: z.string().optional() }),
  head: () => ({
    meta: [
      { title: "Log in — FitQuest" },
      { name: "description", content: "Log in to FitQuest to get today's adaptive workout." },
      { property: "og:title", content: "Log in — FitQuest" },
      { property: "og:description", content: "Log in to FitQuest to get today's adaptive workout." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);

  const go = () => {
    const s = getState();
    navigate({ to: s.currentUserId && s.profiles[s.currentUserId] ? "/dashboard" : "/onboarding" });
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const r = loginSchema.safeParse(form);
    if (!r.success) return setErrors(fieldErrors(r.error));
    try { auth.signIn(r.data.email, r.data.password); go(); }
    catch (err) { setErrors({ form: (err as Error).message }); }
  };

  return (
    <AuthLayout title="Welcome back" subtitle="Check in and get today's session."
      footer={<>New here? <Link to="/signup" className="font-bold text-foreground underline">Create an account</Link></>}>
      <form onSubmit={submit} className="space-y-5" noValidate>
        <Field id="email" label="Email" error={errors.email}>
          <Input id="email" type="email" autoComplete="email" value={form.email} aria-invalid={!!errors.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })} />
        </Field>
        <Field id="password" label="Password" error={errors.password}>
          <Input id="password" type="password" autoComplete="current-password" value={form.password} aria-invalid={!!errors.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })} />
        </Field>
        <div className="flex justify-end">
          <Link to="/forgot-password" className="text-sm font-semibold underline">Forgot password?</Link>
        </div>
        {errors.form && <p role="alert" className="rounded-2xl bg-destructive/10 p-3 text-sm font-medium text-destructive">{errors.form}</p>}
        <Button type="submit" className="w-full" size="lg">Log in</Button>
        <Button type="button" variant="outline" className="w-full" disabled={busy}
          onClick={async () => { setBusy(true); await signInDemo(); go(); }}>
          Explore with a demo account
        </Button>
      </form>
    </AuthLayout>
  );
}
