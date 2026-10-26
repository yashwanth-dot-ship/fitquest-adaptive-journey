import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { AuthLayout } from "@/components/auth-layout";
import { Button, Field, Input, Panel } from "@/components/fq";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { fieldErrors, signupSchema } from "@/lib/validation";

export const Route = createFileRoute("/signup")({
  head: () => ({
    meta: [
      { title: "Sign up — FitQuest" },
      { name: "description", content: "Create your FitQuest account and start your adaptive fitness journey." },
      { property: "og:title", content: "Sign up — FitQuest" },
      { property: "og:description", content: "Create your FitQuest account and start your adaptive fitness journey." },
    ],
  }),
  component: SignupPage,
});

function SignupPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "", confirm: "" });
  const [errors, setErrors] = useState<{ email?: string; password?: string; confirm?: string; form?: string }>({});
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const r = signupSchema.safeParse(form);
    if (!r.success) return setErrors(fieldErrors(r.error));
    setBusy(true);
    const { data, error } = await supabase.auth.signUp({ email: r.data.email, password: r.data.password });
    setBusy(false);
    if (error) return setErrors({ form: error.message });
    // A null session means the email still has to be confirmed.
    if (!data.session) return setSent(true);
    navigate({ to: "/onboarding" });
  };

  const withGoogle = async () => {
    setBusy(true);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: `${window.location.origin}/login`,
    });
    if (result.error) { setBusy(false); return setErrors({ form: result.error.message }); }
    if (result.redirected) return;
    navigate({ to: "/onboarding" });
  };

  const bind = (k: keyof typeof form) => ({
    value: form[k], "aria-invalid": !!errors[k],
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, [k]: e.target.value }),
  });

  if (sent) {
    return (
      <AuthLayout title="Confirm your email" subtitle="We sent a link to your inbox."
        footer={<Link to="/login" search={{}} className="font-bold text-foreground underline">Back to log in</Link>}>
        <Panel tone="lime">
          <p className="font-semibold">One click and you're in.</p>
          <p className="mt-2 text-sm opacity-85">
            Open <span className="font-bold">{form.email}</span> and click the confirmation link, then log in.
            If it hasn't arrived in a minute, check the spam folder.
          </p>
        </Panel>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Start your journey" subtitle="Takes a minute. No credit card, no rigid plan."
      footer={<>Already have an account? <Link to="/login" search={{}} className="font-bold text-foreground underline">Log in</Link></>}>
      <form onSubmit={submit} className="space-y-5" noValidate>
        <Field id="email" label="Email" error={errors.email}>
          <Input id="email" type="email" autoComplete="email" {...bind("email")} />
        </Field>
        <Field id="password" label="Password" error={errors.password} hint="At least 8 characters">
          <Input id="password" type="password" autoComplete="new-password" {...bind("password")} />
        </Field>
        <Field id="confirm" label="Confirm password" error={errors.confirm}>
          <Input id="confirm" type="password" autoComplete="new-password" {...bind("confirm")} />
        </Field>
        {errors.form && <p role="alert" className="rounded-2xl bg-destructive/10 p-3 text-sm font-medium text-destructive">{errors.form}</p>}
        <Button type="submit" className="w-full" size="lg" disabled={busy}>Create account</Button>
        <p className="text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">or</p>
        <Button type="button" variant="outline" className="w-full" disabled={busy} onClick={withGoogle}>
          Continue with Google
        </Button>
      </form>
    </AuthLayout>
  );
}
