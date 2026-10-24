import { createFileRoute } from "@tanstack/react-router";
import { EmptyState } from "@/components/fq";

export const Route = createFileRoute("/onboarding")({
  ssr: false,
  head: () => ({ meta: [{ title: "Set up your profile — FitQuest" }, { name: "description", content: "Tell FitQuest about your goals." }, { property: "og:title", content: "Set up your profile — FitQuest" }, { property: "og:description", content: "Tell FitQuest about your goals." }] }),
  component: () => (
    <main className="mx-auto max-w-2xl px-5 py-16">
      <EmptyState title="Onboarding coming next" body="The profile setup steps are not built yet." />
    </main>
  ),
});
