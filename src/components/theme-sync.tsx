import { useEffect } from "react";
import { useFitData } from "@/lib/use-session";

/** Applies the signed-in user's theme preference to <html>. */
export function ThemeSync() {
  const { data } = useFitData();
  const theme = data?.profile?.theme;
  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);
  return null;
}
