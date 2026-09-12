import { NextRequest, NextResponse } from "next/server";
import { runPipeline } from "@/lib/analysis/pipeline";
import { getCached, setCached } from "@/lib/cache/memory";
import type { AnalysisMode } from "@/lib/types";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      isbn?: string;
      mode?: AnalysisMode;
      skipCache?: boolean;
    };

    const isbn = body.isbn?.replace(/[-\s]/g, "");
    if (!isbn || !/^\d{10}(\d{3})?$/.test(isbn)) {
      return NextResponse.json(
        { ok: false, error: { code: "INVALID_ISBN", message: "Valid 10 or 13 digit ISBN required" } },
        { status: 400 }
      );
    }

    const mode: AnalysisMode = body.mode === "deep" ? "deep" : "quick";

    if (!body.skipCache) {
      const cached = getCached(isbn, mode);
      if (cached) {
        return NextResponse.json({ ok: true, data: cached, cached: true });
      }
    }

    const result = await runPipeline(isbn, mode);
    const stored = setCached(isbn, mode, result);

    return NextResponse.json({ ok: true, data: stored, cached: false });
  } catch (err) {
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: "PIPELINE_ERROR",
          message: err instanceof Error ? err.message : "Unknown error",
        },
      },
      { status: 500 }
    );
  }
}
