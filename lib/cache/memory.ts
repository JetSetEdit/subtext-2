import type { CachedResult } from "@/lib/types";

/**
 * MVP storage: in-memory cache with TTL.
 * Resets on server restart / cold start (Vercel serverless).
 * Documented in README — swap for Supabase when env is ready.
 */

const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours
const store = new Map<string, CachedResult>();

function cacheKey(isbn: string, mode: string): string {
  return `${isbn}:${mode}`;
}

export function getCached(isbn: string, mode: string): CachedResult | null {
  const key = cacheKey(isbn, mode);
  const entry = store.get(key);
  if (!entry) return null;
  if (Date.now() - entry.cachedAt > CACHE_TTL_MS) {
    store.delete(key);
    return null;
  }
  return entry;
}

export function setCached(
  isbn: string,
  mode: string,
  result: Omit<CachedResult, "cachedAt">
): CachedResult {
  const entry: CachedResult = { ...result, cachedAt: Date.now() };
  store.set(cacheKey(isbn, mode), entry);
  return entry;
}

/** Test helper */
export function clearCache(): void {
  store.clear();
}
