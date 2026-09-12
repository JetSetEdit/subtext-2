import { DISCLAIMER } from "@/lib/result-display";

export function DisclaimerBanner() {
  return (
    <aside
      role="note"
      className="border-t border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-100"
    >
      {DISCLAIMER}
    </aside>
  );
}
