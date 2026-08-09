# Abacus Test Portal

A student portal for timed abacus mental-math practice tests — dashboard,
pre-test instructions, a 100-question timed test grid, and a results/scorecard
view, modeled after a typical abacus academy's online testing portal.

## Stack

- **Next.js 16** (App Router) + TypeScript + Tailwind CSS 4
- No external database — test sessions and submitted results are persisted
  as JSON files under [`data/`](data) via server-side API routes
  ([`src/lib/store.ts`](src/lib/store.ts))

## Flow

1. **[Dashboard](src/app/(portal)/dashboard/page.tsx)** — shows the student's
   test specifications and a "Start Practice Test" call to action.
2. **[Instructions](src/app/(portal)/instructions/page.tsx)** — test rules;
   "Proceed to Test" creates a new test session
   ([`POST /api/tests`](src/app/api/tests/route.ts)) with a freshly generated
   question set.
3. **[Online Test](src/app/test/[testId]/page.tsx)** — a live countdown timer,
   a 100-question grid, and a per-question answer modal. Progress is mirrored
   to `sessionStorage` so an accidental refresh doesn't lose answers or reset
   the clock. The timer auto-submits when it hits zero.
4. **[Results](src/app/(portal)/results/[resultId]/page.tsx)** — score ring,
   answered/unanswered/correct stats, and a full per-question answer review.

Questions are abacus-style running-sum drills (add/subtract a short sequence
of numbers) generated per level in [`src/lib/questions.ts`](src/lib/questions.ts).

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The portal starts on a
seeded demo student defined in [`data/students.json`](data/students.json).

## Next steps for a real deployment

- Swap the JSON file store for a real database and add student authentication.
- Add an admin/teacher view for managing question banks and reviewing a whole
  class's results.
- Support multiple students/centers instead of the single hardcoded demo
  student.
