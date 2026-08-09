// Central definitions for the operation/digit choices a student picks
// before a test is generated. Used by both the selection page (client)
// and the question generator (server), so the two never drift apart.

export type OperationType = "addition_subtraction" | "multiplication" | "division";

export interface VariantOption {
  value: string;
  label: string;
  example: string;
}

export interface OperationDef {
  value: OperationType;
  label: string;
  icon: string;
  description: string;
  variants: VariantOption[];
}

export const OPERATIONS: OperationDef[] = [
  {
    value: "addition_subtraction",
    label: "Addition & Subtraction",
    icon: "➕",
    description: "A running total of 3 numbers, added or subtracted.",
    variants: [
      { value: "2-digit", label: "2-Digit", example: "45 + 27 - 13" },
      { value: "3-digit", label: "3-Digit", example: "245 + 127 - 63" },
    ],
  },
  {
    value: "multiplication",
    label: "Multiplication",
    icon: "✖️",
    description: "A multi-digit number times a single digit.",
    variants: [
      { value: "2x1", label: "2 x 1", example: "45 x 3" },
      { value: "3x1", label: "3 x 1", example: "345 x 2" },
    ],
  },
  {
    value: "division",
    label: "Division",
    icon: "➗",
    description: "A multi-digit number divided evenly by a single digit.",
    variants: [{ value: "2x1", label: "2 x 1", example: "84 / 4" }],
  },
];

export const DEFAULT_OPERATION: OperationType = "addition_subtraction";
export const DEFAULT_VARIANT = "2-digit";

export function getOperation(op: string | undefined): OperationDef {
  return OPERATIONS.find((o) => o.value === op) ?? OPERATIONS[0];
}

export function getVariant(op: string | undefined, variant: string | undefined): VariantOption {
  const def = getOperation(op);
  return def.variants.find((v) => v.value === variant) ?? def.variants[0];
}

export function isValidOperation(op: string | undefined): op is OperationType {
  return OPERATIONS.some((o) => o.value === op);
}

export function isValidVariant(op: string | undefined, variant: string | undefined): boolean {
  return getOperation(op).variants.some((v) => v.value === variant);
}

/** Human label shown on results, e.g. "Addition & Subtraction (2-Digit)". */
export function operationLabel(op: string | undefined, variant: string | undefined): string {
  const def = getOperation(op);
  const v = getVariant(op, variant);
  return def.variants.length > 1 ? `${def.label} (${v.label})` : def.label;
}
