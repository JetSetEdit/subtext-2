"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { AnalysisMode } from "@/lib/types";

export default function ScanPage() {
  const router = useRouter();
  const [isbn, setIsbn] = useState("");
  const [mode, setMode] = useState<AnalysisMode>("quick");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const cleaned = isbn.replace(/[-\s]/g, "");
    if (!/^\d{10}(\d{3})?$/.test(cleaned)) {
      setError("Enter a valid 10- or 13-digit ISBN.");
      return;
    }
    setLoading(true);
    router.push(`/book/${cleaned}?mode=${mode}`);
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Scan a book</h1>
        <p className="mt-2 text-slate-600 dark:text-slate-300">
          Enter an ISBN to look up content guidance.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="isbn" className="block text-sm font-medium">
            ISBN
          </label>
          <input
            id="isbn"
            type="text"
            inputMode="numeric"
            placeholder="9780593804216"
            value={isbn}
            onChange={(e) => setIsbn(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-600 dark:bg-slate-900"
            required
          />
        </div>

        <div>
          <button
            type="button"
            disabled
            className="rounded-lg border border-dashed border-slate-300 px-4 py-2 text-sm text-slate-400 dark:border-slate-600"
            title="Camera barcode scanning coming later"
          >
            Tap to scan (coming soon)
          </button>
        </div>

        <fieldset className="space-y-3">
          <legend className="text-sm font-medium">Analysis depth</legend>

          <label className="flex cursor-pointer gap-3 rounded-lg border border-slate-200 p-4 dark:border-slate-700">
            <input
              type="radio"
              name="mode"
              value="quick"
              checked={mode === "quick"}
              onChange={() => setMode("quick")}
              className="mt-1"
            />
            <div>
              <span className="font-medium">Quick</span>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Uses publisher metadata only. Faster (~10–20 sec) but thinner
                evidence. Not definitive — treat uncertain results carefully.
              </p>
            </div>
          </label>

          <label className="flex cursor-pointer gap-3 rounded-lg border border-slate-200 p-4 dark:border-slate-700">
            <input
              type="radio"
              name="mode"
              value="deep"
              checked={mode === "deep"}
              onChange={() => setMode("deep")}
              className="mt-1"
            />
            <div>
              <span className="font-medium">Deep</span>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Adds allowlisted review sources (Common Sense Media, Kirkus, etc.).
                Slower (~30–60 sec) with richer context. Still metadata-based, not
                a full-text read.
              </p>
            </div>
          </label>
        </fieldset>

        {error && (
          <p className="text-sm text-red-600 dark:text-red-400" role="alert">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-slate-900 px-6 py-3 font-medium text-white disabled:opacity-50 dark:bg-slate-100 dark:text-slate-900"
        >
          {loading ? "Analyzing…" : "Analyze book"}
        </button>
      </form>
    </div>
  );
}
