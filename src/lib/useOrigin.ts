"use client";

import { useSyncExternalStore } from "react";

/** The site's address (e.g. "https://example.netlify.app"). Only known in the
 * browser, so it's empty while rendering on the server and filled in right
 * after the page loads - without causing a hydration mismatch. */
export function useOrigin(): string {
  return useSyncExternalStore(
    () => () => {},
    () => window.location.origin,
    () => ""
  );
}
