import { NextRequest, NextResponse } from "next/server";
import { runPipeline } from "@/lib/analysis/pipeline";
import { getCached, setCached } from "@/lib/cache/memory";
import type { AnalysisMode } from "@/lib/types";

export const runtime = "nodejs";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ isbn: string }> }
) {
  const { isbn: rawIsbn } = await context.params;
  const isbn = rawIsbn.replace(/[-\s]/g, "");

  if (!/^\d{10}(\d{3})?$/.test(isbn)) {
    return NextResponse.json(
      { ok: false, error: { code: "INVALID_ISBN", message: "Valid ISBN required" } },
      { status: 400 }
    );
  }

  const mode = (request.nextUrl.searchParams.get("mode") ?? "quick") as AnalysisMode;
  const validMode: AnalysisMode = mode === "deep" ? "deep" : "quick";

  const cached = getCached(isbn, validMode);
  if (cached) {
    return NextResponse.json({ ok: true, data: cached, cached: true });
  }

  const result = await runPipeline(isbn, validMode);
  const stored = setCached(isbn, validMode, result);

  return NextResponse.json({ ok: true, data: stored, cached: false });
}
