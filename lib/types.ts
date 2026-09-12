export type ResultState =
  | "warnings"
  | "clear_confident"
  | "low_confidence"
  | "could_not_analyze";

export type Severity = "mild" | "moderate" | "severe";

export type AnalysisMode = "quick" | "deep";

export type WarningCategory =
  | "violence"
  | "sexual_content"
  | "abuse"
  | "self_harm_suicide"
  | "substance"
  | "discrimination"
  | "language";

export interface ContentWarning {
  category: WarningCategory;
  categoryLabel: string;
  severity: Severity;
  description: string;
  reasoning: string;
}

export interface BookMetadata {
  isbn: string;
  title: string | null;
  author: string | null;
  description: string | null;
  coverUrl: string | null;
  categories: string[];
  enrichmentText: string | null;
  inputCharCount: number;
}

export interface PipelineInput {
  metadata: BookMetadata;
  mode: AnalysisMode;
  forceFailure?: boolean;
}

export interface PipelineOutput {
  resultState: ResultState;
  warnings: ContentWarning[];
  ageGuidance: string | null;
  metadata: BookMetadata;
  analysisMode: AnalysisMode;
  pipelineSuccess: boolean;
  inputAdequate: boolean;
  explicitEmptySet: boolean;
  errorMessage?: string;
}

export interface CachedResult extends PipelineOutput {
  cachedAt: number;
}
