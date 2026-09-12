import type { ResultState } from "@/lib/types";

export const RESULT_STATE_CONFIG: Record<
  ResultState,
  {
    label: string;
    description: string;
    tone: "neutral" | "positive" | "caution" | "error";
  }
> = {
  warnings: {
    label: "Content warnings found",
    description:
      "We found themes that may matter for your family. Review each advisory below.",
    tone: "caution",
  },
  clear_confident: {
    label: "No warnings in our taxonomy",
    description:
      "We completed analysis on adequate metadata and, with high confidence, found no warnings in our taxonomy. This is not a guarantee the book is risk-free.",
    tone: "neutral",
  },
  low_confidence: {
    label: "Not enough to be sure",
    description:
      "We ran analysis but available metadata was thin or evidence was weak. Do not treat this as an all-clear.",
    tone: "caution",
  },
  could_not_analyze: {
    label: "Could not analyze",
    description:
      "Analysis did not complete successfully. We cannot provide guidance for this book right now. Nothing here means the book is clear.",
    tone: "error",
  },
};

/** Age guidance is shown only when analysis reached a trustworthy conclusion. */
export function shouldShowAgeGuidance(
  resultState: ResultState,
  ageGuidance: string | null,
): boolean {
  if (!ageGuidance) return false;
  return resultState === "warnings" || resultState === "clear_confident";
}

export const DISCLAIMER =
  "Guide based on public metadata — not a substitute for your judgment. Not a full-text read of the book.";
