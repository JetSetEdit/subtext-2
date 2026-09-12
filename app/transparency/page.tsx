import Link from "next/link";
import { RESULT_STATE_CONFIG } from "@/lib/result-display";

export default function TransparencyPage() {
  return (
    <div className="space-y-8 prose prose-slate dark:prose-invert max-w-none">
      <div>
        <h1 className="text-2xl font-bold">How Subtext works</h1>
        <p className="text-slate-600 dark:text-slate-300">
          Subtext helps Australian parents make informed reading choices. It is
          not censorship, not a safety guarantee, and not a substitute for reading
          the book yourself or talking with your child.
        </p>
      </div>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">What we analyze</h2>
        <ul className="list-disc space-y-2 pl-5 text-slate-700 dark:text-slate-300">
          <li>
            Public book metadata from Google Books and Open Library (title,
            author, publisher description, categories).
          </li>
          <li>
            Optional enrichment from allowlisted review sites (Common Sense Media,
            Kirkus, The StoryGraph) in Deep mode only.
          </li>
          <li>
            <strong>We do not read the full text of the book.</strong>
          </li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Result states explained</h2>
        <p className="text-slate-600 dark:text-slate-300">
          Subtext uses four honest states. We never show a &quot;Comfort Read&quot;
          or cozy all-clear badge.
        </p>
        <dl className="space-y-4">
          {(Object.entries(RESULT_STATE_CONFIG) as [keyof typeof RESULT_STATE_CONFIG, typeof RESULT_STATE_CONFIG[keyof typeof RESULT_STATE_CONFIG]][]).map(
            ([key, config]) => (
              <div
                key={key}
                className="rounded-lg border border-slate-200 p-4 dark:border-slate-700"
              >
                <dt className="font-semibold">{config.label}</dt>
                <dd className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                  <code className="text-xs">{key}</code> — {config.description}
                </dd>
              </div>
            )
          )}
        </dl>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Quick vs Deep</h2>
        <p className="text-slate-600 dark:text-slate-300">
          <strong>Quick</strong> uses publisher metadata only. It is faster but
          relies on thinner evidence — a missing or vague description may produce
          a &quot;Not enough to be sure&quot; result rather than an all-clear.
        </p>
        <p className="text-slate-600 dark:text-slate-300">
          <strong>Deep</strong> adds allowlisted third-party review snippets. It
          is slower and richer, but still metadata-based — not a full-text
          analysis.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Limitations</h2>
        <ul className="list-disc space-y-2 pl-5 text-slate-700 dark:text-slate-300">
          <li>
            Metadata may be incomplete, outdated, or vague — especially for new or
            niche titles.
          </li>
          <li>
            Severity is AU-style guidance inspired by classification language, not
            legal ACB equivalence.
          </li>
          <li>
            Errors, rate limits, and timeouts produce &quot;Could not analyze&quot;
            — never a false all-clear.
          </li>
          <li>
            AI analysis is constrained to a fixed taxonomy and evidence from the
            provided text only.
          </li>
        </ul>
      </section>

      <Link href="/scan" className="inline-block text-sm underline hover:no-underline">
        Start a scan
      </Link>
    </div>
  );
}
