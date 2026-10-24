import { createFileRoute } from "@tanstack/react-router";
import { EmptyState, PageHeader } from "@/components/fq";

export const Route = createFileRoute("/_authed/dashboard")({
  head: () => ({ meta: [{ title: "FitQuest — dashboard" }, { name: "description", content: "FitQuest dashboard" }, { property: "og:title", content: "FitQuest — dashboard" }, { property: "og:description", content: "FitQuest dashboard" }] }),
  component: Page,
});

function Page() {
  return (
    <>
      <PageHeader eyebrow="FitQuest" title="dashboard" />
      <EmptyState title="Coming next" body="This screen is not built yet." />
    </>
  );
}
