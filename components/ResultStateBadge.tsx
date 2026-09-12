import type { ResultState } from "@/lib/types";
import { RESULT_STATE_CONFIG } from "@/lib/result-display";

const TONE_CLASSES: Record<
  (typeof RESULT_STATE_CONFIG)[ResultState]["tone"],
  string
> = {
  neutral: "border-slate-300 bg-slate-50 text-slate-800 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100",
  positive: "border-green-300 bg-green-50 text-green-900 dark:border-green-800 dark:bg-green-950 dark:text-green-100",
  caution: "border-amber-300 bg-amber-50 text-amber-950 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-100",
  error: "border-red-300 bg-red-50 text-red-900 dark:border-red-800 dark:bg-red-950 dark:text-red-100",
};

export function ResultStateBadge({ state }: { state: ResultState }) {
  const config = RESULT_STATE_CONFIG[state];
  return (
    <div
      className={`rounded-lg border p-4 ${TONE_CLASSES[config.tone]}`}
      data-result-state={state}
    >
      <h2 className="text-lg font-semibold">{config.label}</h2>
      <p className="mt-1 text-sm opacity-90">{config.description}</p>
    </div>
  );
}
