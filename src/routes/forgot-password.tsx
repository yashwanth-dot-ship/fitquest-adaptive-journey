import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { AuthLayout } from "@/components/auth-layout";
import { Button, Field, Input, Panel } from "@/components/fq";
import { auth } from "@/lib/store";
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

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const r = emailSchema.safeParse(email);
    if (!r.success) return setError(r.error.issues[0].message);
    auth.requestReset(r.data);
    setSent(true);
  };

  return (
    <AuthLayout title="Reset password" subtitle="We'll send a reset link to your email."
      footer={<Link to="/login" search={{}} className="font-bold text-foreground underline">Back to log in</Link>}>
      {sent ? (
        <Panel tone="lime" role="status">
          <p className="font-semibold">If an account exists for {email}, a reset link is on its way.</p>
          <p className="mt-2 text-sm opacity-80">Prototype note: emails aren't sent until a backend is connected.</p>
        </Panel>
      ) : (
        <form onSubmit={submit} className="space-y-5" noValidate>
          <Field id="email" label="Email" error={error}>
            <Input id="email" type="email" autoComplete="email" value={email} aria-invalid={!!error} onChange={(e) => setEmail(e.target.value)} />
          </Field>
          <Button type="submit" className="w-full" size="lg">Send reset link</Button>
        </form>
      )}
    </AuthLayout>
  );
}
