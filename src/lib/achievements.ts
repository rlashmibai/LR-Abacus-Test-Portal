import type { TestResult } from "./types";

export interface Achievement {
  id: string;
  label: string;
  description: string;
  icon: string; // emoji, kept dependency-free for both server + client use
  earned: boolean;
  earnedAt?: string;
}

const TEST_COUNT_MILESTONES = [10, 25, 50, 75, 100] as const;

/** A completed test finished well inside its time limit - a proxy for
 * "fast" without needing to compare across different students. Only
 * meaningful for timed (exam-mode) tests. */
function isSpeedy(r: TestResult): boolean {
  if (r.answered < r.totalQuestions) return false;
  const parMinutes = Math.max(1, Math.round((r.totalQuestions * 6) / 60));
  return r.timeTakenSeconds > 0 && r.timeTakenSeconds <= parMinutes * 60 * 0.5;
}

export function computeAchievements(results: TestResult[]): Achievement[] {
  const sorted = [...results].sort(
    (a, b) => new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime()
  );

  const achievements: Achievement[] = [];

  const firstPerfect = sorted.find((r) => r.scorePercent === 100);
  achievements.push({
    id: "first_perfect",
    label: "First Perfect Score",
    description: "Score 100% on any test.",
    icon: "🏆",
    earned: Boolean(firstPerfect),
    earnedAt: firstPerfect?.submittedAt,
  });

  const firstSpeedy = sorted.find(isSpeedy);
  achievements.push({
    id: "speed_star",
    label: "Speed Star",
    description: "Finish every question in under half the allotted time.",
    icon: "⚡",
    earned: Boolean(firstSpeedy),
    earnedAt: firstSpeedy?.submittedAt,
  });

  TEST_COUNT_MILESTONES.forEach((milestone) => {
    const earned = sorted.length >= milestone;
    achievements.push({
      id: `tests_${milestone}`,
      label: `${milestone} Tests Completed`,
      description: `Submit ${milestone} practice tests.`,
      icon: milestone >= 100 ? "👑" : milestone >= 50 ? "🥇" : milestone >= 25 ? "🥈" : "🥉",
      earned,
      earnedAt: earned ? sorted[milestone - 1]?.submittedAt : undefined,
    });
  });

  return achievements;
}

export function hasAnyMilestone(achievements: Achievement[]): boolean {
  return achievements.some((a) => a.earned);
}
