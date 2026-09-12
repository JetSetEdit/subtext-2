import type { ContentWarning, ResultState } from "@/lib/types";

/** Minimum description/enrichment length for confident clear state. */
export const ADEQUATE_INPUT_THRESHOLD = 200;

export interface StateDecisionInput {
  pipelineSuccess: boolean;
  inputAdequate: boolean;
  warnings: ContentWarning[];
  /** Model returned an explicit empty warning set (not error swallowed). */
  explicitEmptySet: boolean;
}

/**
 * Pure result-state machine. Conservative by design:
 * errors and thin input never produce clear_confident.
 */
export function determineResultState(input: StateDecisionInput): ResultState {
  const { pipelineSuccess, inputAdequate, warnings, explicitEmptySet } = input;

  if (!pipelineSuccess) {
    return "could_not_analyze";
  }

  if (warnings.length > 0) {
    return "warnings";
  }

  if (
    pipelineSuccess &&
    inputAdequate &&
    explicitEmptySet &&
    warnings.length === 0
  ) {
    return "clear_confident";
  }

  // Thin input, weak evidence, or ambiguous empty set
  return "low_confidence";
}

export function isInputAdequate(inputCharCount: number): boolean {
  return inputCharCount >= ADEQUATE_INPUT_THRESHOLD;
}

export function computeInputCharCount(
  description: string | null,
  enrichmentText: string | null
): number {
  const desc = description?.trim() ?? "";
  const enrich = enrichmentText?.trim() ?? "";
  return desc.length + enrich.length;
}
