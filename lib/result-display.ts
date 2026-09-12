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
    label: "Content advisories found",
    description:
      "We found themes that may matter for your family. Review each advisory below.",
    tone: "caution",
  },
  clear_confident: {
    label: "No advisories identified",
    description:
      "Analysis completed with adequate metadata and no content warnings were identified. This is not a guarantee the book contains no sensitive themes.",
    tone: "neutral",
  },
  low_confidence: {
    label: "Limited information",
    description:
      "We ran analysis but available metadata was thin or evidence was weak. Do not treat this as an all-clear.",
    tone: "caution",
  },
  could_not_analyze: {
    label: "Could not analyze",
    description:
      "Analysis did not complete successfully. We cannot provide guidance for this book right now.",
    tone: "error",
  },
};

export const DISCLAIMER =
  "Guide based on public metadata — not a substitute for your judgment. Not a full-text read of the book.";
