import { createFileRoute } from "@tanstack/react-router";

// TEMPORARY verification helper — creates one confirmed demo account so the
// signed-in screens can be exercised end to end. Delete after use.
export const Route = createFileRoute("/api/public/seed-test-user")({
  server: {
    handlers: {
      POST: async () => {
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { data, error } = await supabaseAdmin.auth.admin.createUser({
          email: "sam@fitquest-demo.app",
          password: "Zp4#mLk!9Qw2$XvtR7",
          email_confirm: true,
        });
        if (error) return Response.json({ error: error.message }, { status: 400 });
        return Response.json({ ok: true, id: data.user.id });
      },
    },
  },
});
