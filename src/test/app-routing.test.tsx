import { QueryClient } from "@tanstack/react-query";
import { createMemoryHistory, createRouter, RouterProvider } from "@tanstack/react-router";
import { cleanup, render, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { routeTree } from "@/routeTree.gen";

// TanStack Start's RouterProvider renders the document shell, so DOM content
// never lands in the render container. Assert on router state instead: it
// proves the route tree resolved without depending on page markup.
function makeRouter(path: string) {
  const queryClient = new QueryClient();
  return createRouter({
    routeTree,
    context: { queryClient },
    history: createMemoryHistory({ initialEntries: [path] }),
  });
}

function renderRouter(path: string) {
  const router = makeRouter(path);
  render(<RouterProvider router={router} />);
  return router;
}

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("App routing", () => {
  it("resolves the index route", async () => {
    const router = renderRouter("/");

    await waitFor(() => expect(router.state.status).toBe("ready"));
    expect(router.state.location.pathname).toBe("/");
    expect(router.state.matches.some((m) => m.routeId === "/")).toBe(true);
  });

  it("routes unknown paths to the not-found handler", async () => {
    vi.spyOn(console, "warn").mockImplementation(() => undefined);

    const router = renderRouter("/this-route-does-not-exist");

    await waitFor(() => expect(router.state.status).toBe("ready"));
    expect(router.state.location.pathname).toBe("/this-route-does-not-exist");
    // Only the root layout matched — the unknown segment produced a not-found
    // instead of a concrete route.
    expect(router.state.matches.every((m) => m.routeId === "__root__")).toBe(true);
  });
});
