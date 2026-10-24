import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { AuthLayout } from "@/components/auth-layout";
import { Button, Field, Input } from "@/components/fq";
import { auth } from "@/lib/store";
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
  const [errors, setErrors] = useState<Record<string, string>>({});

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const r = signupSchema.safeParse(form);
    if (!r.success) return setErrors(fieldErrors(r.error));
    try { auth.signUp(r.data.email, r.data.password); navigate({ to: "/onboarding" }); }
    catch (err) { setErrors({ email: (err as Error).message }); }
  };

  const bind = (k: keyof typeof form) => ({
    value: form[k], "aria-invalid": !!errors[k],
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, [k]: e.target.value }),
  });

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
        <Button type="submit" className="w-full" size="lg">Create account</Button>
      </form>
    </AuthLayout>
  );
}
