import { describe, it, expect } from "vitest";
import {
  applySeverityFloor,
  SEVERE_FLOOR_TERMS,
  scoreToSeverity,
} from "@/lib/analysis/severity";

describe("applySeverityFloor", () => {
  for (const term of SEVERE_FLOOR_TERMS) {
    it(`floors to severe when evidence contains "${term}"`, () => {
      expect(applySeverityFloor("mild", `A story about ${term} themes.`)).toBe(
        "severe"
      );
      expect(
        applySeverityFloor("moderate", `Contains themes of ${term.toUpperCase()}.`)
      ).toBe("severe");
    });
  }

  it("preserves mild when no floor terms present", () => {
    expect(applySeverityFloor("mild", "A gentle adventure for children.")).toBe(
      "mild"
    );
  });

  it("preserves severe when already severe", () => {
    expect(applySeverityFloor("severe", "No special terms here.")).toBe("severe");
  });
});

describe("scoreToSeverity", () => {
  it("maps scores to mild/moderate/severe thresholds", () => {
    expect(scoreToSeverity(0.1)).toBe("mild");
    expect(scoreToSeverity(0.35)).toBe("moderate");
    expect(scoreToSeverity(0.7)).toBe("severe");
  });
});
