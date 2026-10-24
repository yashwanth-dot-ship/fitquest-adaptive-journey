import { createFileRoute } from "@tanstack/react-router";
import { EmptyState, PageHeader } from "@/components/fq";

export const Route = createFileRoute("/_authed/history")({
  head: () => ({ meta: [{ title: "FitQuest — history" }, { name: "description", content: "FitQuest history" }, { property: "og:title", content: "FitQuest — history" }, { property: "og:description", content: "FitQuest history" }] }),
  component: Page,
});

function Page() {
  return (
    <>
      <PageHeader eyebrow="FitQuest" title="history" />
      <EmptyState title="Coming next" body="This screen is not built yet." />
    </>
  );
}
