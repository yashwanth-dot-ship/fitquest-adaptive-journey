import { createFileRoute } from "@tanstack/react-router";
import { EmptyState, PageHeader } from "@/components/fq";

export const Route = createFileRoute("/_authed/progress")({
  head: () => ({ meta: [{ title: "FitQuest — progress" }, { name: "description", content: "FitQuest progress" }, { property: "og:title", content: "FitQuest — progress" }, { property: "og:description", content: "FitQuest progress" }] }),
  component: Page,
});

function Page() {
  return (
    <>
      <PageHeader eyebrow="FitQuest" title="progress" />
      <EmptyState title="Coming next" body="This screen is not built yet." />
    </>
  );
}
