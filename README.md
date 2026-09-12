# Subtext 2.0 MVP

Ground-up rebuild of [Subtext](https://subtextscanner.com.au) for Jet Set Edit. **Trust > features.**

ISBN → honest content-advisory result for Australian parents. Not a port of v1 (`book-scanner-app`).

## Quick start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment variables

Copy `.env.example` to `.env.local`:

| Variable | Required | Description |
|----------|----------|-------------|
| `OPENAI_API_KEY` | No | Enables AI analysis. Without it, keyword heuristics run on metadata (conservative — never implies high confidence). |
| `OPENAI_MODEL` | No | Default `gpt-4o-mini` |
| `FORCE_ANALYSIS_FAILURE` | No | Set `true` to test failure paths |

## What this MVP does

- **`/`** — Value prop + Start scan CTA
- **`/scan`** — ISBN input, Quick/Deep toggle, barcode stub
- **`/book/[isbn]`** — Cover, title, result state, warnings
- **`/transparency`** — How it works, states, limitations

### Result states (only four — no "Comfort Read")

| State | Meaning |
|-------|---------|
| `warnings` | One or more content advisories |
| `clear_confident` | Successful analysis + adequate input (≥200 chars) + explicit empty warning set |
| `low_confidence` | Ran, but thin input or weak evidence |
| `could_not_analyze` | Pipeline failed, rate-limited, or no usable input |

**Conservative defaults:** errors and thin metadata never produce `clear_confident`.

### Pipeline

1. Fetch metadata (Google Books + Open Library)
2. Deep mode: optional enrichment from allowlisted domains (Common Sense Media, Kirkus, StoryGraph)
3. Analyze via OpenAI (or keyword heuristics without API key)
4. Map to fixed taxonomy subset: violence, sexual content, abuse, self-harm/suicide, substance, discrimination, language
5. Severity floor: evidence containing rape/suicide/abuse/torture → at least `severe`

### Storage

**In-memory cache** with 24h TTL (`lib/cache/memory.ts`). Resets on server restart / Vercel cold start. Documented choice for MVP — swap for Supabase when env is trivial.

## Testing trust rules

```bash
npm test
```

Tests cover:

- Result state machine (`tests/result-state.test.ts`)
- Severity floor (`tests/severity.test.ts`)
- Error ≠ clear, thin input ≠ clear, dark synopsis → warnings (`tests/pipeline-trust.test.ts`)

### Manual failure test

- ISBN `0000000000000` forces `could_not_analyze`
- Or set `FORCE_ANALYSIS_FAILURE=true`

### Known v1 failure (reference)

ISBN `9780593804216` (Yesteryear) showed "Comfort Read" despite dark synopsis in v1. Subtext 2.0 must never show cozy/safe empty states.

## What this MVP is NOT

- Full v1 taxonomy, themes, VIP, paywall, affiliate, community
- Bookshelf, flip cards, BookTok chrome
- Full barcode camera (stub only)
- Legal ACB equivalence
- Full-text book reading

## Deploy

Vercel-ready. Set env vars in dashboard. No secrets in repo.

## Trust model (commit/PR summary)

1. **No false safety** — four honest states; no Comfort Read badge
2. **`clear_confident` is gated** — requires pipeline success + adequate input + explicit empty set
3. **Errors fail closed** — timeouts/rate limits → `could_not_analyze`
4. **Disclaimer on every page** — metadata guide, not substitute for judgment
5. **Quick vs Deep labeled honestly** — Quick is thinner/faster, not definitive

When ambiguous, we choose the more conservative trust behaviour.
