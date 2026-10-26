import { QueryClient } from "@tanstack/react-query";
import { createMemoryHistory, createRouter } from "@tanstack/react-router";
import { describe, expect, it, vi } from "vitest";

import { routeTree } from "@/routeTree.gen";

// The route tree is resolved headlessly via router.load(). Rendering through
// RouterProvider paints TanStack Start's document shell into the test DOM,
// which asserts nothing useful — so router state is the source of truth here.
function loadRouter(path: string) {
  const queryClient = new QueryClient();
  return createRouter({
    routeTree,
    context: { queryClient },
    history: createMemoryHistory({ initialEntries: [path] }),
  });
}

describe("App routing", () => {
  it("resolves the index route", async () => {
    const router = loadRouter("/");

    await router.load();
    expect(router.state.location.pathname).toBe("/");
    expect(router.state.matches.map((m) => m.routeId)).toEqual(["__root__", "/"]);
  });

  it("routes unknown paths to the not-found handler", async () => {
    vi.spyOn(console, "warn").mockImplementation(() => undefined);

    const router = loadRouter("/this-route-does-not-exist");

    // An unknown path may surface the not-found error through load(); either
    // way only the root layout should have matched.
    try {
      await router.load();
    } catch {
      // not-found surfaced as an error — expected for an unknown path.
    }
    expect(router.state.location.pathname).toBe("/this-route-does-not-exist");
    expect(router.state.matches.map((m) => m.routeId)).toEqual(["__root__"]);
  });
});
