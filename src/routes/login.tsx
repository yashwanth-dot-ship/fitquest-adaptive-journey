import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AuthLayout } from "@/components/auth-layout";
import { Button, Field, Input } from "@/components/fq";
import { useAuth } from "@/lib/auth";
import { hasProfile } from "@/lib/data";
import { safeRedirect } from "@/lib/redirect";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { fieldErrors, loginSchema } from "@/lib/validation";

export const Route = createFileRoute("/login")({
  validateSearch: (raw: Record<string, unknown>) => ({ redirect: typeof raw.redirect === "string" ? raw.redirect : undefined }),
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
  const { user } = useAuth();
  const { search } = Route.useSearch();
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState<{ email?: string; password?: string; form?: string }>({});
  const [busy, setBusy] = useState(false);

  const go = (to: string) => {
    if (to === "/dashboard") navigate({ to: "/dashboard", replace: true });
    else if (to === "/onboarding") navigate({ to: "/onboarding", replace: true });
    else window.location.assign(to);
  };

  const onward = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    const uid = session?.user.id;
    if (!uid) return;
    go(safeRedirect(search.redirect) ?? ((await hasProfile(uid)) ? "/dashboard" : "/onboarding"));
  };

  // Arriving back from Google (or already signed in) — carry on to the right screen.
  useEffect(() => { if (user) void onward(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [user]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const r = loginSchema.safeParse(form);
    if (!r.success) return setErrors(fieldErrors(r.error));
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({ email: r.data.email, password: r.data.password });
    setBusy(false);
    if (error) return setErrors({ form: "Email or password is incorrect." });
    await onward();
  };

  const withGoogle = async () => {
    setBusy(true);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: `${window.location.origin}/login`,
    });
    if (result.error) {
      setBusy(false);
      toast.error(result.error.message);
      return;
    }
    if (result.redirected) return; // full-page flow: the browser is on its way to Google
    await onward();
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
        <Button type="submit" className="w-full" size="lg" disabled={busy}>Log in</Button>
        <p className="text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">or</p>
        <Button type="button" variant="outline" className="w-full" disabled={busy} onClick={withGoogle}>
          Continue with Google
        </Button>
      </form>
    </AuthLayout>
  );
}
