import { createFileRoute } from "@tanstack/react-router";
import { EmptyState, PageHeader } from "@/components/fq";

export const Route = createFileRoute("/_authed/check-in")({
  head: () => ({ meta: [{ title: "FitQuest — check-in" }, { name: "description", content: "FitQuest check-in" }, { property: "og:title", content: "FitQuest — check-in" }, { property: "og:description", content: "FitQuest check-in" }] }),
  component: Page,
});

function Page() {
  return (
    <>
      <PageHeader eyebrow="FitQuest" title="check-in" />
      <EmptyState title="Coming next" body="This screen is not built yet." />
    </>
  );
}
