import type { ContentWarning } from "@/lib/types";

const SEVERITY_CLASSES = {
  mild: "bg-yellow-100 text-yellow-900 dark:bg-yellow-900/40 dark:text-yellow-100",
  moderate: "bg-orange-100 text-orange-900 dark:bg-orange-900/40 dark:text-orange-100",
  severe: "bg-red-100 text-red-900 dark:bg-red-900/40 dark:text-red-100",
};

export function WarningCard({ warning }: { warning: ContentWarning }) {
  return (
    <article className="rounded-lg border border-slate-200 p-4 dark:border-slate-700">
      <div className="flex flex-wrap items-center gap-2">
        <h3 className="font-semibold">{warning.categoryLabel}</h3>
        <span
          className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${SEVERITY_CLASSES[warning.severity]}`}
        >
          {warning.severity}
        </span>
      </div>
      <p className="mt-2 text-sm">{warning.description}</p>
      <p className="mt-2 text-xs text-slate-600 dark:text-slate-400">
        {warning.reasoning}
      </p>
    </article>
  );
}
