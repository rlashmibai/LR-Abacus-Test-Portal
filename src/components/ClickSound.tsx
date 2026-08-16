"use client";

import { useEffect } from "react";
import { playClickTick } from "@/lib/sound";

const INTERACTIVE_SELECTOR =
  'button:not(:disabled), a[href], [role="button"], input[type="submit"], input[type="checkbox"], input[type="radio"], select';

/** Mounted once near the root of the app. Plays a soft tap sound on every
 * click of a real interactive control (buttons, links, checkboxes...) -
 * but not on plain text/number inputs, so filling in a grid of answer
 * boxes during a timed test never turns into a wall of ticking noise. */
export default function ClickSound() {
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      const target = e.target as HTMLElement | null;
      if (!target?.closest) return;
      if (target.closest(INTERACTIVE_SELECTOR)) {
        playClickTick();
      }
    }
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  return null;
}
