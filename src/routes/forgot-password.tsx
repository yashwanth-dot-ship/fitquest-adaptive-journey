import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { AuthLayout } from "@/components/auth-layout";
import { Button, Field, Input, Panel } from "@/components/fq";
import { supabase } from "@/integrations/supabase/client";
import { emailSchema } from "@/lib/validation";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({
    meta: [
      { title: "Reset password — FitQuest" },
      { name: "description", content: "Request a password reset link for your FitQuest account." },
      { property: "og:title", content: "Reset password — FitQuest" },
      { property: "og:description", content: "Request a password reset link for your FitQuest account." },
    ],
  }),
  component: ForgotPage,
});

function ForgotPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string>();
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const r = emailSchema.safeParse(email);
    if (!r.success) return setError(r.error.issues[0]?.message);
    setBusy(true);
    const { error: err } = await supabase.auth.resetPasswordForEmail(r.data, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setBusy(false);
    if (err) return setError(err.message);
    // Always the same reply — the app never reveals whether an email is registered.
    setSent(true);
  };

  return (
    <AuthLayout title="Reset password" subtitle="We'll send a reset link to your email."
      footer={<Link to="/login" search={{}} className="font-bold text-foreground underline">Back to log in</Link>}>
      {sent ? (
        <Panel tone="lime" role="status">
          <p className="font-semibold">If an account exists for {email}, a reset link is on its way.</p>
          <p className="mt-2 text-sm opacity-85">Open the link and choose a new password. If it hasn't arrived in a minute, check the spam folder.</p>
        </Panel>
      ) : (
        <form onSubmit={submit} className="space-y-5" noValidate>
          <Field id="email" label="Email" error={error}>
            <Input id="email" type="email" autoComplete="email" value={email} aria-invalid={!!error} onChange={(e) => setEmail(e.target.value)} />
          </Field>
          <Button type="submit" className="w-full" size="lg" disabled={busy}>Send reset link</Button>
        </form>
      )}
    </AuthLayout>
  );
}
