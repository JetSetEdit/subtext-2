import { describe, it, expect } from "vitest";
import {
  determineResultState,
  isInputAdequate,
  ADEQUATE_INPUT_THRESHOLD,
} from "@/lib/analysis/result-state";
import type { ContentWarning } from "@/lib/types";

const emptyWarnings: ContentWarning[] = [];

const sampleWarning: ContentWarning = {
  category: "violence",
  categoryLabel: "Violence",
  severity: "moderate",
  description: "Physical harm themes",
  reasoning: "Contains themes of violence based on metadata.",
};

describe("determineResultState", () => {
  it("returns could_not_analyze when pipeline fails", () => {
    expect(
      determineResultState({
        pipelineSuccess: false,
        inputAdequate: true,
        warnings: [],
        explicitEmptySet: true,
      })
    ).toBe("could_not_analyze");
  });

  it("returns warnings when warnings exist", () => {
    expect(
      determineResultState({
        pipelineSuccess: true,
        inputAdequate: true,
        warnings: [sampleWarning],
        explicitEmptySet: false,
      })
    ).toBe("warnings");
  });

  it("returns clear_confident only when all conditions met", () => {
    expect(
      determineResultState({
        pipelineSuccess: true,
        inputAdequate: true,
        warnings: emptyWarnings,
        explicitEmptySet: true,
      })
    ).toBe("clear_confident");
  });

  it("never returns clear_confident with thin input", () => {
    expect(
      determineResultState({
        pipelineSuccess: true,
        inputAdequate: false,
        warnings: emptyWarnings,
        explicitEmptySet: true,
      })
    ).toBe("low_confidence");
  });

  it("returns low_confidence when empty set is not explicit", () => {
    expect(
      determineResultState({
        pipelineSuccess: true,
        inputAdequate: true,
        warnings: emptyWarnings,
        explicitEmptySet: false,
      })
    ).toBe("low_confidence");
  });

  it("error swallowed as empty never yields clear", () => {
    const state = determineResultState({
      pipelineSuccess: true,
      inputAdequate: true,
      warnings: [],
      explicitEmptySet: false,
    });
    expect(state).not.toBe("clear_confident");
  });
});

describe("isInputAdequate", () => {
  it(`requires at least ${ADEQUATE_INPUT_THRESHOLD} chars`, () => {
    expect(isInputAdequate(ADEQUATE_INPUT_THRESHOLD - 1)).toBe(false);
    expect(isInputAdequate(ADEQUATE_INPUT_THRESHOLD)).toBe(true);
  });
});
