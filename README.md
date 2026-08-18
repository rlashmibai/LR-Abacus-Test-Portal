# LR Abacus Test Portal

A free online **Abacus Practice Test** created by **Lashmi Bai Ravindrapandian** as a learning resource for children practicing abacus.

I originally created this practice portal for my son, who is learning abacus and wanted a simple way to practice regularly and improve his speed and accuracy. What started as a small project for him became a free resource that I wanted to share with other abacus learners and parents.

🌐 **Practice Online:** [Abacus Practice Test](https://abacus-test-portal-lr.netlify.app)

👩‍💻 **Created by:** Lashmi Bai Ravindrapandian
🏫 **LR Virtual Classroom:** https://lrvirtualclassroom.co.in/
💻 **GitHub:** https://github.com/rlashmibai

### Why I Created This

Abacus learning takes regular practice, repetition, speed, and accuracy. I wanted to create a simple practice tool that children could use between their classes without needing a subscription or paid account.

This practice portal is completely free to use.

## What's inside

- Guest, register, and login flows with session-based auth
- Custom test length (25 / 50 / 100 questions) across addition & subtraction,
  multiplication, and division
- Practice mode (untimed) and Exam mode (timed, with auto-submit)
- Instant results with a full per-question answer review
- Progress dashboard with charts across a student's test history
- 14 badges/achievements earned automatically from test history
- A printable certificate, unlocked once a student earns their first badge
- Light sound effects and animations across the app
- An [About Me](src/app/about/page.tsx) page telling the story behind the site

## Stack

- **Next.js 16** (App Router, Turbopack) + TypeScript + Tailwind CSS 4
- **Neon** (serverless Postgres) for students, test sessions, and results in
  production ([`src/lib/db.ts`](src/lib/db.ts)); falls back to local JSON
  files under [`data/`](data) for local development when no database is
  configured ([`src/lib/store.ts`](src/lib/store.ts))
- Hosted on **Netlify**

## Flow

1. **[Dashboard](src/app/(portal)/dashboard/page.tsx)** — a student's stats
   and a "Start Practice Test" call to action.
2. **[Test setup](src/app/(portal)/test-setup/page.tsx)** — choose operation,
   digit size, length, and practice vs. exam mode.
3. **[Instructions](src/app/(portal)/instructions/page.tsx)** — test rules;
   "Proceed to Test" creates a new test session
   ([`POST /api/tests`](src/app/api/tests/route.ts)) with a freshly generated
   question set.
4. **[Online Test](src/app/test/[testId]/page.tsx)** — a live countdown timer
   (exam mode only) and a question grid. Progress is mirrored to
   `sessionStorage` so an accidental refresh doesn't lose answers or reset the
   clock. The timer auto-submits when it hits zero.
5. **[Results](src/app/(portal)/results/[resultId]/page.tsx)** — score ring,
   answered/unanswered/correct stats, and a full per-question answer review.
6. **[Achievements](src/app/(portal)/achievements/page.tsx)** and
   **[Certificate](src/app/(portal)/certificate/page.tsx)** — badges earned
   from a student's result history, and a printable certificate once any
   badge is earned.

Questions are abacus-style running-sum drills (add/subtract a short sequence
of numbers, or multiplication/division problems) generated per level in
[`src/lib/questions.ts`](src/lib/questions.ts).

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Without a `DATABASE_URL`
set, the portal runs against local JSON files and starts on a seeded demo
student defined in [`data/students.json`](data/students.json). Set
`DATABASE_URL` (a Neon/Postgres connection string) to run against a real
database instead.
