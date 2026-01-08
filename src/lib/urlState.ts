export type AppDeepLink =
  | { page: "none" };

export function parseDeepLinkFromLocation(loc: Location): AppDeepLink {
  const params = new URLSearchParams(loc.search);
  // Live class deep links removed; keep function for future expansion.
  void params;
  return { page: "none" };
}

export function clearDeepLinkFromUrl(): void {
  try {
    const url = new URL(window.location.href);
    url.searchParams.delete("page");
    url.searchParams.delete("sessionId");
    window.history.replaceState({}, "", url.pathname + url.search + url.hash);
  } catch {
    // ignore
  }
}
