// Keeps a post-sign-in destination on this site only — never an external URL.
export function safeRedirect(path: string | undefined): string | null {
  if (!path) return null;
  try {
    const url = new URL(path, window.location.origin);
    if (url.origin !== window.location.origin) return null;
    return url.pathname + url.search;
  } catch {
    return null;
  }
}
