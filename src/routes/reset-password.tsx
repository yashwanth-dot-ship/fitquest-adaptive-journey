import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { AuthLayout } from "@/components/auth-layout";
import { Button, Field, Input, Panel } from "@/components/fq";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { passwordSchema } from "@/lib/validation";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Choose a new password — FitQuest" },
      { name: "description", content: "Set a new password for your FitQuest account." },
      { property: "og:title", content: "Choose a new password — FitQuest" },
      { property: "og:description", content: "Set a new password for your FitQuest account." },
    ],
  }),
  component: ResetPage,
});

function ResetPage() {
  const navigate = useNavigate();
  const { user, ready } = useAuth();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string>();
  const [busy, setBusy] = useState(false);

  if (!ready) return null;

  if (!user) {
    return (
      <AuthLayout title="This link has expired" subtitle="For your safety, reset links only work once."
        footer={<Link to="/forgot-password" className="font-bold text-foreground underline">Request a new link</Link>}>
        <Panel tone="muted">
          <p className="text-sm">If you were already signed in, you can <Link to="/login" search={{}} className="font-bold underline">log in</Link> and use the reset form again.</p>
        </Panel>
      </AuthLayout>
    );
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const p = passwordSchema.safeParse(password);
    if (!p.success) return setError(p.error.issues[0]?.message);
    if (password !== confirm) return setError("Passwords don't match");
    setBusy(true);
    const { error: err } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (err) return setError(err.message);
    toast.success("Password updated — you're signed in.");
    navigate({ to: "/dashboard", replace: true });
  };

  return (
    <AuthLayout title="Choose a new password" subtitle={`Signed in as ${user.email}`}>
      <form onSubmit={submit} className="space-y-5" noValidate>
        <Field id="password" label="New password" error={error} hint="At least 8 characters">
          <Input id="password" type="password" autoComplete="new-password" value={password}
            aria-invalid={!!error} onChange={(e) => setPassword(e.target.value)} />
        </Field>
        <Field id="confirm" label="Confirm new password">
          <Input id="confirm" type="password" autoComplete="new-password" value={confirm}
            onChange={(e) => setConfirm(e.target.value)} />
        </Field>
        <Button type="submit" className="w-full" size="lg" disabled={busy}>Save new password</Button>
      </form>
    </AuthLayout>
  );
}
