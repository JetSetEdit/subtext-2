import { describe, it, expect } from "vitest";
import {
  RESULT_STATE_CONFIG,
  shouldShowAgeGuidance,
} from "@/lib/result-display";

describe("RESULT_STATE_CONFIG labels", () => {
  it("uses trust-first copy for each state", () => {
    expect(RESULT_STATE_CONFIG.warnings.label).toBe("Content warnings found");
    expect(RESULT_STATE_CONFIG.clear_confident.label).toBe(
      "No warnings in our taxonomy",
    );
    expect(RESULT_STATE_CONFIG.low_confidence.label).toBe(
      "Not enough to be sure",
    );
  });

  it("states clear_confident is not a risk-free guarantee", () => {
    expect(RESULT_STATE_CONFIG.clear_confident.description).toMatch(
      /not a guarantee the book is risk-free/i,
    );
  });

  it("states could_not_analyze does not imply the book is clear", () => {
    expect(RESULT_STATE_CONFIG.could_not_analyze.description).toMatch(
      /Nothing here means the book is clear/i,
    );
  });
});

describe("shouldShowAgeGuidance", () => {
  const guidance = "Suggested for ages 12+";

  it("shows age guidance for warnings and clear_confident", () => {
    expect(shouldShowAgeGuidance("warnings", guidance)).toBe(true);
    expect(shouldShowAgeGuidance("clear_confident", guidance)).toBe(true);
  });

  it("hides age guidance for low_confidence and could_not_analyze", () => {
    expect(shouldShowAgeGuidance("low_confidence", guidance)).toBe(false);
    expect(shouldShowAgeGuidance("could_not_analyze", guidance)).toBe(false);
  });

  it("hides age guidance when value is null or empty", () => {
    expect(shouldShowAgeGuidance("clear_confident", null)).toBe(false);
    expect(shouldShowAgeGuidance("warnings", "")).toBe(false);
  });
});
