import { createFileRoute } from "@tanstack/react-router";

// TEMPORARY verification helper — creates one confirmed demo account so the
// signed-in screens can be exercised end to end. Delete after use.
export const Route = createFileRoute("/api/public/seed-test-user")({
  server: {
    handlers: {
      POST: async () => {
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { data, error } = await supabaseAdmin.auth.admin.createUser({
          email: "alex@fitquest-demo.app",
          password: "Demo!2345",
          email_confirm: true,
        });
        if (error) return Response.json({ error: error.message }, { status: 400 });
        return Response.json({ ok: true, id: data.user.id });
      },
    },
  },
});
