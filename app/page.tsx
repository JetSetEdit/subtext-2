import Link from "next/link";

export default function HomePage() {
  return (
    <div className="space-y-8">
      <section className="space-y-4">
        <h1 className="text-3xl font-bold tracking-tight">
          Know what&apos;s in the book before your child reads it
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-300">
          Subtext scans an ISBN and returns honest content guidance for Australian
          parents — based on public metadata, not a full-text read.
        </p>
      </section>

      <Link
        href="/scan"
        className="inline-block rounded-lg bg-slate-900 px-6 py-3 font-medium text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white"
      >
        Start scan
      </Link>

      <p className="text-sm text-slate-500">
        <Link href="/transparency" className="underline hover:no-underline">
          How Subtext works and its limitations
        </Link>
      </p>
    </div>
  );
}
