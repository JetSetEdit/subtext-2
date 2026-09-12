/**
 * Thin enrichment from allowlisted domains only.
 * MVP: best-effort fetch; failures return null (never blocks pipeline).
 */

const ALLOWLISTED_DOMAINS = [
  "thestorygraph.com",
  "commonsensemedia.org",
  "kirkusreviews.com",
];

function isAllowlisted(url: string): boolean {
  try {
    const host = new URL(url).hostname.replace(/^www\./, "");
    return ALLOWLISTED_DOMAINS.some(
      (d) => host === d || host.endsWith(`.${d}`)
    );
  } catch {
    return false;
  }
}

/**
 * Search for allowlisted review snippets via DuckDuckGo lite HTML (no API key).
 * Returns concatenated snippet text or null.
 */
export async function fetchEnrichment(
  title: string,
  author: string | null
): Promise<string | null> {
  const query = encodeURIComponent(
    `"${title}"${author ? ` "${author}"` : ""} site:commonsensemedia.org OR site:kirkusreviews.com`
  );

  try {
    const res = await fetch(
      `https://html.duckduckgo.com/html/?q=${query}`,
      {
        headers: { "User-Agent": "Subtext2-MVP/0.1" },
        signal: AbortSignal.timeout(8000),
      }
    );
    if (!res.ok) return null;

    const html = await res.text();
    const snippets: string[] = [];

    // Extract result snippets and filter by allowlist
    const linkRegex = /<a[^>]+class="result__a"[^>]+href="([^"]+)"[^>]*>([^<]+)<\/a>/g;
    const snippetRegex =
      /<a[^>]+class="result__snippet"[^>]*>([\s\S]*?)<\/a>/g;

    const links = [...html.matchAll(linkRegex)];
    const snippetMatches = [...html.matchAll(snippetRegex)];

    for (let i = 0; i < Math.min(links.length, snippetMatches.length, 3); i++) {
      const url = links[i][1];
      if (!isAllowlisted(url)) continue;
      const text = snippetMatches[i][1]
        .replace(/<[^>]+>/g, "")
        .replace(/&[^;]+;/g, " ")
        .trim();
      if (text.length > 30) snippets.push(text);
    }

    if (snippets.length === 0) return null;
    return snippets.join("\n\n").slice(0, 1500);
  } catch {
    return null;
  }
}
