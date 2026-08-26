/** How to render one operand row, depending on the question's operation
 * (or, for a "mixed" test, that specific question's own opKind). Shared
 * between the live test runner and the results/answer-review page so
 * they never drift out of sync. */
export function formatRow(operation: string, value: number, index: number, sign: number): string {
  if (index === 0) return String(value);
  if (operation === "multiplication") return `x ${value}`;
  if (operation === "division") return `/ ${value}`;
  return sign < 0 ? `- ${value}` : String(value);
}
