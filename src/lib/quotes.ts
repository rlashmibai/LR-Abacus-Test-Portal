// Original encouragement lines about abacus practice and mental math -
// not attributed to anyone, so nothing here is a quotation of a real
// person's words.
export const ABACUS_QUOTES: string[] = [
  "Every bead you move is a small step toward a sharper mind.",
  "The abacus doesn't just count - it teaches patience, precision, and calm.",
  "Speed comes later. First, let your hands learn to be sure.",
  "Small daily practice, moved bead by bead, builds a lifetime of skill.",
  "Mistakes are just beads waiting to be moved back into place.",
  "Focus on one column at a time - mastery is built row by row.",
  "A steady rhythm today becomes lightning-fast mental math tomorrow.",
  "The quiet click of beads is the sound of a mind getting stronger.",
  "Great calculators were once beginners who kept practicing anyway.",
  "Confidence with numbers starts with ten patient fingers and one abacus.",
];

export function pickQuote(seed?: number): string {
  const n = ABACUS_QUOTES.length;
  if (seed === undefined) {
    return ABACUS_QUOTES[Math.floor(Math.random() * n)];
  }
  return ABACUS_QUOTES[((seed % n) + n) % n];
}

/** Deterministic seed that only changes once a day - handy for server
 * components that want a quote that's stable across a render but still
 * varies day to day. */
export function todaySeed(): number {
  const d = new Date();
  return d.getFullYear() * 372 + d.getMonth() * 31 + d.getDate();
}
