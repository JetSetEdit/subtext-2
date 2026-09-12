import type { AnalysisMode, PipelineInput, PipelineOutput } from "@/lib/types";
import { fetchBookMetadata } from "@/lib/metadata/fetch";
import { fetchEnrichment } from "@/lib/metadata/enrichment";
import { analyzeBook } from "./analyze";
import {
  determineResultState,
  isInputAdequate,
  computeInputCharCount,
} from "./result-state";

/** ISBN that triggers forced failure for testing trust rules. */
export const FORCE_FAILURE_ISBN = "0000000000000";

export async function runPipeline(
  isbn: string,
  mode: AnalysisMode = "quick"
): Promise<PipelineOutput> {
  const forceFailure =
    isbn.replace(/[-\s]/g, "") === FORCE_FAILURE_ISBN ||
    process.env.FORCE_ANALYSIS_FAILURE === "true";

  let enrichmentText: string | null = null;

  // Fetch base metadata first
  let metadata = await fetchBookMetadata(isbn);

  if (mode === "deep" && metadata.title) {
    enrichmentText = await fetchEnrichment(metadata.title, metadata.author);
    if (enrichmentText) {
      metadata = {
        ...metadata,
        enrichmentText,
        inputCharCount: computeInputCharCount(
          metadata.description,
          enrichmentText
        ),
      };
    }
  }

  const inputAdequate = isInputAdequate(metadata.inputCharCount);

  const analysis = await analyzeBook(metadata, mode, { forceFailure });

  const resultState = determineResultState({
    pipelineSuccess: analysis.pipelineSuccess,
    inputAdequate,
    warnings: analysis.warnings,
    explicitEmptySet: analysis.explicitEmptySet,
  });

  return {
    resultState,
    warnings: analysis.warnings,
    ageGuidance: analysis.ageGuidance,
    metadata,
    analysisMode: mode,
    pipelineSuccess: analysis.pipelineSuccess,
    inputAdequate,
    explicitEmptySet: analysis.explicitEmptySet,
    errorMessage: analysis.errorMessage,
  };
}

export async function runPipelineWithMetadata(
  input: PipelineInput
): Promise<PipelineOutput> {
  const { metadata, mode, forceFailure } = input;
  const inputAdequate = isInputAdequate(metadata.inputCharCount);

  const analysis = await analyzeBook(metadata, mode, { forceFailure });

  const resultState = determineResultState({
    pipelineSuccess: analysis.pipelineSuccess,
    inputAdequate,
    warnings: analysis.warnings,
    explicitEmptySet: analysis.explicitEmptySet,
  });

  return {
    resultState,
    warnings: analysis.warnings,
    ageGuidance: analysis.ageGuidance,
    metadata,
    analysisMode: mode,
    pipelineSuccess: analysis.pipelineSuccess,
    inputAdequate,
    explicitEmptySet: analysis.explicitEmptySet,
    errorMessage: analysis.errorMessage,
  };
}
