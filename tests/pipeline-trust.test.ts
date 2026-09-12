import { describe, it, expect } from "vitest";
import { determineResultState } from "@/lib/analysis/result-state";
import { runPipelineWithMetadata } from "@/lib/analysis/pipeline";
import type { BookMetadata } from "@/lib/types";

describe("trust rules: error ≠ clear", () => {
  it("forced failure produces could_not_analyze", async () => {
    const metadata: BookMetadata = {
      isbn: "9780593804216",
      title: "Yesteryear",
      author: "Test Author",
      description: "A long description ".repeat(30),
      coverUrl: null,
      categories: ["Fiction"],
      enrichmentText: null,
      inputCharCount: 600,
    };

    const result = await runPipelineWithMetadata({
      metadata,
      mode: "quick",
      forceFailure: true,
    });

    expect(result.pipelineSuccess).toBe(false);
    expect(result.resultState).toBe("could_not_analyze");
    expect(result.resultState).not.toBe("clear_confident");
  });

  it("thin description never produces clear_confident", async () => {
    const metadata: BookMetadata = {
      isbn: "9780000000000",
      title: "Unknown Book",
      author: null,
      description: "Short blurb.",
      coverUrl: null,
      categories: [],
      enrichmentText: null,
      inputCharCount: 12,
    };

    const result = await runPipelineWithMetadata({
      metadata,
      mode: "quick",
    });

    expect(result.inputAdequate).toBe(false);
    if (result.warnings.length === 0 && result.pipelineSuccess) {
      expect(result.resultState).toBe("low_confidence");
    }
    expect(result.resultState).not.toBe("clear_confident");
  });

  it("dark synopsis keywords produce warnings, not cozy clear", async () => {
    const darkDescription =
      "A harrowing tale of abuse, suicide, and torture in a dystopian society where violence and discrimination are rampant. " +
      "The protagonist struggles with addiction and self-harm while facing sexual assault and domestic abuse. ".repeat(3);

    const metadata: BookMetadata = {
      isbn: "9780593804216",
      title: "Dark Book",
      author: "Test",
      description: darkDescription,
      coverUrl: null,
      categories: ["Fiction"],
      enrichmentText: null,
      inputCharCount: darkDescription.length,
    };

    const result = await runPipelineWithMetadata({
      metadata,
      mode: "quick",
    });

    expect(result.warnings.length).toBeGreaterThan(0);
    expect(result.resultState).toBe("warnings");
    expect(result.resultState).not.toBe("clear_confident");

    const hasSevereFloor = result.warnings.some((w) => w.severity === "severe");
    expect(hasSevereFloor).toBe(true);
  });
});

describe("state machine invariants", () => {
  it("could_not_analyze beats everything", () => {
    const state = determineResultState({
      pipelineSuccess: false,
      inputAdequate: true,
      warnings: [],
      explicitEmptySet: true,
    });
    expect(state).toBe("could_not_analyze");
  });
});
