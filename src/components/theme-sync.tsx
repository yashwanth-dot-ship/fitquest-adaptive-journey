import { useEffect } from "react";
import { useAppState } from "@/lib/store";

/** Applies the signed-in user's theme preference to <html>. */
export function ThemeSync() {
  const theme = useAppState((s) => (s.currentUserId ? s.profiles[s.currentUserId]?.theme : undefined));
  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);
  return null;
}
