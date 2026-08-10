import type { TestResult } from "./types";

export interface Achievement {
  id: string;
  label: string;
  description: string;
  icon: string; // emoji, kept dependency-free for both server + client use
  earned: boolean;
  earnedAt?: string;
}

const TEST_COUNT_MILESTONES = [
  { count: 10, label: "Number Ninja", icon: "🌱" },
  { count: 25, label: "Practice Warrior", icon: "🔥" },
  { count: 50, label: "Abacus Expert", icon: "💎" },
  { count: 75, label: "Abacus Champion", icon: "🚀" },
  { count: 100, label: "Abacus Legend", icon: "👑" },
] as const;

const MASTERY_THRESHOLD = 80; // percent

/** A completed test finished well inside its time limit - a proxy for
 * "fast" without needing to compare across different students. Only
 * meaningful for timed (exam-mode) tests. */
function isSpeedy(r: TestResult): boolean {
  if (r.answered < r.totalQuestions) return false;
  const parMinutes = Math.max(1, Math.round((r.totalQuestions * 6) / 60));
  return r.timeTakenSeconds > 0 && r.timeTakenSeconds <= parMinutes * 60 * 0.5;
}

function dateKey(iso: string): string {
  return new Date(iso).toDateString();
}

export function computeAchievements(results: TestResult[]): Achievement[] {
  const sorted = [...results].sort(
    (a, b) => new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime()
  );

  const achievements: Achievement[] = [];

  // Perfect Mind
  const firstPerfect = sorted.find((r) => r.scorePercent === 100);
  achievements.push({
    id: "perfect_mind",
    label: "Perfect Mind",
    description: "Score 100% on any test.",
    icon: "🏆",
    earned: Boolean(firstPerfect),
    earnedAt: firstPerfect?.submittedAt,
  });

  // Lightning Mind
  const firstSpeedy = sorted.find(isSpeedy);
  achievements.push({
    id: "lightning_mind",
    label: "Lightning Mind",
    description: "Finish every question in under half the allotted time.",
    icon: "⚡",
    earned: Boolean(firstSpeedy),
    earnedAt: firstSpeedy?.submittedAt,
  });

  // Test-count progression
  TEST_COUNT_MILESTONES.forEach(({ count, label, icon }) => {
    const earned = sorted.length >= count;
    achievements.push({
      id: `tests_${count}`,
      label,
      description: `Complete ${count} practice tests.`,
      icon,
      earned,
      earnedAt: earned ? sorted[count - 1]?.submittedAt : undefined,
    });
  });

  // 7-Day Streak - practice on 7 distinct calendar days.
  const seenDays = new Set<string>();
  let streakEarnedAt: string | undefined;
  for (const r of sorted) {
    seenDays.add(dateKey(r.submittedAt));
    if (seenDays.size >= 7 && !streakEarnedAt) {
      streakEarnedAt = r.submittedAt;
      break;
    }
  }
  achievements.push({
    id: "seven_day_streak",
    label: "7-Day Streak",
    description: "Practice on 7 different days.",
    icon: "📅",
    earned: Boolean(streakEarnedAt),
    earnedAt: streakEarnedAt,
  });

  // First Breakthrough - a big jump in score from the previous test.
  let breakthroughAt: string | undefined;
  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i].scorePercent - sorted[i - 1].scorePercent >= 20) {
      breakthroughAt = sorted[i].submittedAt;
      break;
    }
  }
  achievements.push({
    id: "first_breakthrough",
    label: "First Breakthrough",
    description: "Improve your score by 20 points or more from one test to the next.",
    icon: "🌟",
    earned: Boolean(breakthroughAt),
    earnedAt: breakthroughAt,
  });

  // New Personal Best - beat your own previous high score.
  let runningMax = -Infinity;
  let personalBestAt: string | undefined;
  sorted.forEach((r) => {
    if (runningMax > -Infinity && r.scorePercent > runningMax && !personalBestAt) {
      personalBestAt = r.submittedAt;
    }
    runningMax = Math.max(runningMax, r.scorePercent);
  });
  achievements.push({
    id: "new_personal_best",
    label: "New Personal Best",
    description: "Beat your previous highest score.",
    icon: "🏅",
    earned: Boolean(personalBestAt),
    earnedAt: personalBestAt,
  });

  // Operation mastery badges.
  const additionAce = sorted.find(
    (r) => r.operation === "addition_subtraction" && r.variant === "2-digit" && r.scorePercent >= MASTERY_THRESHOLD
  );
  achievements.push({
    id: "addition_ace",
    label: "Addition Ace",
    description: "Score 80% or higher on a 2-digit Addition & Subtraction test.",
    icon: "🧮",
    earned: Boolean(additionAce),
    earnedAt: additionAce?.submittedAt,
  });

  const subtractionStar = sorted.find(
    (r) => r.operation === "addition_subtraction" && r.variant === "3-digit" && r.scorePercent >= MASTERY_THRESHOLD
  );
  achievements.push({
    id: "subtraction_star",
    label: "Subtraction Star",
    description: "Score 80% or higher on a 3-digit Addition & Subtraction test.",
    icon: "➖",
    earned: Boolean(subtractionStar),
    earnedAt: subtractionStar?.submittedAt,
  });

  const multiplicationMaster = sorted.find(
    (r) => r.operation === "multiplication" && r.scorePercent >= MASTERY_THRESHOLD
  );
  achievements.push({
    id: "multiplication_master",
    label: "Multiplication Master",
    description: "Score 80% or higher on a Multiplication test.",
    icon: "✖️",
    earned: Boolean(multiplicationMaster),
    earnedAt: multiplicationMaster?.submittedAt,
  });

  const divisionPro = sorted.find(
    (r) => r.operation === "division" && r.scorePercent >= MASTERY_THRESHOLD
  );
  achievements.push({
    id: "division_pro",
    label: "Division Pro",
    description: "Score 80% or higher on a Division test.",
    icon: "➗",
    earned: Boolean(divisionPro),
    earnedAt: divisionPro?.submittedAt,
  });

  return achievements;
}

export function hasAnyMilestone(achievements: Achievement[]): boolean {
  return achievements.some((a) => a.earned);
}
