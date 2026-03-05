/**
 * app/api/deals/route.ts
 *
 * GET /api/deals
 *   nextToken (optional): cursor for next page
 *   maxRows   (optional): rows per page (default 20, max 200)
 */

import { NextRequest, NextResponse } from "next/server";
import type { DealsApiResponse } from "@/types/deals";
import { getDealsTable } from "@/lib/catalyst";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const nextToken = searchParams.get("nextToken") ?? undefined;
    const maxRows = Math.min(
      200,
      Math.max(1, parseInt(searchParams.get("maxRows") ?? "20", 10))
    );

    const table = getDealsTable();
    const result = await table.getPagedRows({ nextToken, maxRows });

    const response: DealsApiResponse = {
      success: true,
      data: result.data ?? [],
      total: result.data?.length ?? 0,
      nextToken: result.next_token,
      hasMore: result.more_records ?? false,
    };
    return NextResponse.json(response, { status: 200 });
  } catch (err: unknown) {
    console.error("[/api/deals] Error:", err);
    const message = err instanceof Error ? err.message : "Failed to fetch deals";
    return NextResponse.json(
      { success: false, error: message } as DealsApiResponse,
      { status: 500 }
    );
  }
}
