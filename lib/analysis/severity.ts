import type { Severity } from "@/lib/types";

/** Terms that force severity floor to severe when found in evidence text. */
export const SEVERE_FLOOR_TERMS = [
  "rape",
  "suicide",
  "abuse",
  "torture",
] as const;

/**
 * Apply severity floor: if evidence contains rape/suicide/abuse/torture
 * (case-insensitive), severity is at least severe.
 */
export function applySeverityFloor(
  severity: Severity,
  evidenceText: string
): Severity {
  const lower = evidenceText.toLowerCase();
  const hasFloorTerm = SEVERE_FLOOR_TERMS.some((term) => lower.includes(term));
  if (hasFloorTerm) {
    return "severe";
  }
  return severity;
}

export function compareSeverity(a: Severity, b: Severity): Severity {
  const order: Record<Severity, number> = {
    mild: 0,
    moderate: 1,
    severe: 2,
  };
  return order[a] >= order[b] ? a : b;
}

export function scoreToSeverity(score: number): Severity {
  if (score >= 0.7) return "severe";
  if (score >= 0.35) return "moderate";
  return "mild";
}
