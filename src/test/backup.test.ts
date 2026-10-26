import { beforeEach, describe, expect, it } from "vitest";

import { auth, exportState, importState } from "@/lib/store";

// Rule: exporting the app state and importing it back restores every account,
// profile and session so users can move data between browsers or devices.
describe("Backup export / import", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("round-trips a signed-up account through export and import", () => {
    auth.signUp("runner@test.dev", "password123");

    const backup = exportState();
    localStorage.clear(); // simulate a wiped browser

    const res = importState(backup);
    expect(res).toEqual({ ok: true, accounts: 1 });
    expect(auth.currentUser()?.email).toBe("runner@test.dev");
  });

  it("rejects files that are not FitQuest backups", () => {
    expect(importState("not json")).toEqual({ ok: false, error: "That file is not valid JSON." });
    expect(importState(JSON.stringify({ hello: "world" }))).toEqual({
      ok: false,
      error: "That file is not a FitQuest backup.",
    });
  });
});
