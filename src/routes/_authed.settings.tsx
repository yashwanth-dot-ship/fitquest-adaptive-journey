import { createFileRoute } from "@tanstack/react-router";
import { EmptyState, PageHeader } from "@/components/fq";

export const Route = createFileRoute("/_authed/settings")({
  head: () => ({ meta: [{ title: "FitQuest — settings" }, { name: "description", content: "FitQuest settings" }, { property: "og:title", content: "FitQuest — settings" }, { property: "og:description", content: "FitQuest settings" }] }),
  component: Page,
});

function Page() {
  return (
    <>
      <PageHeader eyebrow="FitQuest" title="settings" />
      <EmptyState title="Coming next" body="This screen is not built yet." />
    </>
  );
}
