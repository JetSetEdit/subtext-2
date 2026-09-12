import Link from "next/link";
import { runPipeline } from "@/lib/analysis/pipeline";
import { getCached, setCached } from "@/lib/cache/memory";
import { ResultStateBadge } from "@/components/ResultStateBadge";
import { WarningCard } from "@/components/WarningCard";
import type { AnalysisMode } from "@/lib/types";

interface PageProps {
  params: Promise<{ isbn: string }>;
  searchParams: Promise<{ mode?: string }>;
}

export default async function BookPage({ params, searchParams }: PageProps) {
  const { isbn: rawIsbn } = await params;
  const { mode: modeParam } = await searchParams;
  const isbn = rawIsbn.replace(/[-\s]/g, "");
  const mode: AnalysisMode = modeParam === "deep" ? "deep" : "quick";

  let result = getCached(isbn, mode);
  if (!result) {
    const pipelineResult = await runPipeline(isbn, mode);
    result = setCached(isbn, mode, pipelineResult);
  }

  const { metadata, warnings, resultState, ageGuidance, analysisMode } = result;

  return (
    <div className="space-y-8">
      <Link href="/scan" className="text-sm text-slate-500 hover:underline">
        ← Scan another book
      </Link>

      <header className="flex flex-col gap-4 sm:flex-row">
        {metadata.coverUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={metadata.coverUrl}
            alt={metadata.title ? `Cover of ${metadata.title}` : "Book cover"}
            className="h-48 w-32 shrink-0 rounded object-cover shadow"
          />
        )}
        <div>
          <h1 className="text-2xl font-bold">
            {metadata.title ?? "Unknown title"}
          </h1>
          {metadata.author && (
            <p className="text-slate-600 dark:text-slate-300">
              {metadata.author}
            </p>
          )}
          <p className="mt-1 font-mono text-xs text-slate-500">ISBN {isbn}</p>
          <p className="mt-2 text-xs text-slate-500 capitalize">
            {analysisMode} analysis · AU-style guidance inspired by classification
            language
          </p>
        </div>
      </header>

      <ResultStateBadge state={resultState} />

      {resultState === "warnings" && warnings.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Content advisories</h2>
          {warnings.map((w) => (
            <WarningCard key={w.category} warning={w} />
          ))}
        </section>
      )}

      {ageGuidance && (
        <section className="rounded-lg border border-slate-200 p-4 dark:border-slate-700">
          <h2 className="font-semibold">Age guidance</h2>
          <p className="mt-1 text-sm">{ageGuidance}</p>
        </section>
      )}

      {result.errorMessage && resultState === "could_not_analyze" && (
        <p className="text-sm text-slate-500">
          Technical detail: {result.errorMessage}
        </p>
      )}
    </div>
  );
}
