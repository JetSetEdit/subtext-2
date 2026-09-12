import type { AnalysisMode, BookMetadata, ContentWarning } from "@/lib/types";
import { isValidCategory, TAXONOMY } from "./taxonomy";
import { applySeverityFloor, scoreToSeverity } from "./severity";

interface RawWarning {
  category: string;
  severity: string;
  description: string;
  reasoning: string;
}

interface AnalysisResult {
  warnings: ContentWarning[];
  explicitEmptySet: boolean;
  ageGuidance: string | null;
  pipelineSuccess: boolean;
  errorMessage?: string;
}

const SYSTEM_PROMPT = `You analyze book metadata for content warnings aimed at Australian parents.
Rules:
- Only flag content you can support from the provided text about THIS specific book.
- Never infer from genre, author reputation, or similar books.
- Use ONLY these categories: violence, sexual_content, abuse, self_harm_suicide, substance, discrimination, language.
- Severity: mild, moderate, or severe.
- Reasoning must use categorical language ("Contains themes of…") — no plot spoilers, no character names, no quotes.
- If insufficient evidence, return an empty warnings array.
- Respond with JSON only: { "warnings": [...], "ageGuidance": "optional string or null" }`;

function buildUserPrompt(metadata: BookMetadata, mode: AnalysisMode): string {
  const parts = [
    `Title: ${metadata.title ?? "Unknown"}`,
    `Author: ${metadata.author ?? "Unknown"}`,
    `ISBN: ${metadata.isbn}`,
  ];
  if (metadata.description) {
    parts.push(`Description:\n${metadata.description}`);
  }
  if (metadata.enrichmentText) {
    parts.push(`Additional context (allowlisted sources):\n${metadata.enrichmentText}`);
  }
  if (metadata.categories.length > 0) {
    parts.push(`Categories: ${metadata.categories.join(", ")}`);
  }
  parts.push(`Analysis mode: ${mode} (${mode === "quick" ? "metadata only" : "metadata + enrichment"})`);
  return parts.join("\n\n");
}

function parseWarnings(raw: RawWarning[], evidenceText: string): ContentWarning[] {
  const valid: ContentWarning[] = [];
  for (const w of raw) {
    if (!isValidCategory(w.category)) continue;
    const severity = applySeverityFloor(
      scoreToSeverity(
        w.severity === "severe" ? 0.8 : w.severity === "moderate" ? 0.5 : 0.2
      ),
      `${evidenceText} ${w.reasoning} ${w.description}`
    );
    valid.push({
      category: w.category,
      categoryLabel: TAXONOMY[w.category].label,
      severity,
      description: w.description,
      reasoning: w.reasoning,
    });
  }
  return valid;
}

export async function analyzeBook(
  metadata: BookMetadata,
  mode: AnalysisMode,
  options: { forceFailure?: boolean } = {}
): Promise<AnalysisResult> {
  if (options.forceFailure) {
    return {
      warnings: [],
      explicitEmptySet: false,
      ageGuidance: null,
      pipelineSuccess: false,
      errorMessage: "Forced failure (test mode)",
    };
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return heuristicAnalysis(metadata);
  }

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
        temperature: 0.2,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: buildUserPrompt(metadata, mode) },
        ],
      }),
      signal: AbortSignal.timeout(45000),
    });

    if (res.status === 429) {
      return {
        warnings: [],
        explicitEmptySet: false,
        ageGuidance: null,
        pipelineSuccess: false,
        errorMessage: "Rate limited",
      };
    }

    if (!res.ok) {
      return {
        warnings: [],
        explicitEmptySet: false,
        ageGuidance: null,
        pipelineSuccess: false,
        errorMessage: `API error: ${res.status}`,
      };
    }

    const data = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const content = data.choices?.[0]?.message?.content;
    if (!content) {
      return {
        warnings: [],
        explicitEmptySet: false,
        ageGuidance: null,
        pipelineSuccess: false,
        errorMessage: "Empty model response",
      };
    }

    const parsed = JSON.parse(content) as {
      warnings?: RawWarning[];
      ageGuidance?: string | null;
    };
    const evidenceText = [
      metadata.description,
      metadata.enrichmentText,
    ]
      .filter(Boolean)
      .join(" ");

    const warnings = parseWarnings(parsed.warnings ?? [], evidenceText);

    return {
      warnings,
      explicitEmptySet: Array.isArray(parsed.warnings),
      ageGuidance: parsed.ageGuidance ?? null,
      pipelineSuccess: true,
    };
  } catch (err) {
    return {
      warnings: [],
      explicitEmptySet: false,
      ageGuidance: null,
      pipelineSuccess: false,
      errorMessage: err instanceof Error ? err.message : "Analysis failed",
    };
  }
}

/**
 * Fallback when no OpenAI key: keyword heuristics on description.
 * Never returns clear_confident-worthy explicit empty — conservative.
 */
function heuristicAnalysis(metadata: BookMetadata): AnalysisResult {
  const text = [
    metadata.description,
    metadata.enrichmentText,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  if (!text || text.length < 50) {
    return {
      warnings: [],
      explicitEmptySet: false,
      ageGuidance: null,
      pipelineSuccess: true,
      errorMessage: "No API key; insufficient text for heuristic analysis",
    };
  }

  const warnings: ContentWarning[] = [];
  const rules: { category: ContentWarning["category"]; terms: string[] }[] = [
    { category: "violence", terms: ["violence", "murder", "kill", "blood", "war", "fight"] },
    { category: "sexual_content", terms: ["sexual", "sex ", "romance", "affair", "nude"] },
    { category: "abuse", terms: ["abuse", "abusive", "domestic violence", "neglect"] },
    { category: "self_harm_suicide", terms: ["suicide", "self-harm", "self harm", "depression"] },
    { category: "substance", terms: ["drug", "alcohol", "addiction", "substance"] },
    { category: "discrimination", terms: ["racism", "racist", "discrimination", "prejudice", "homophob"] },
    { category: "language", terms: ["profanity", "swearing", "strong language"] },
  ];

  for (const rule of rules) {
    const matched = rule.terms.some((t) => text.includes(t));
    if (matched) {
      const evidence = text;
      warnings.push({
        category: rule.category,
        categoryLabel: TAXONOMY[rule.category].label,
        severity: applySeverityFloor("moderate", evidence),
        description: TAXONOMY[rule.category].description,
        reasoning: `Contains themes related to ${TAXONOMY[rule.category].label.toLowerCase()} based on metadata keywords.`,
      });
    }
  }

  return {
    warnings,
    explicitEmptySet: warnings.length === 0,
    ageGuidance: null,
    pipelineSuccess: true,
  };
}
