// src/app/api/heat/route.ts
import { NextResponse } from "next/server";
import { getTrendingMints } from "@/lib/trending";
import { getHeatRows } from "@/lib/heat";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const limitParam = Number(searchParams.get("limit") || "200");
    const limit = Math.max(1, Math.min(200, Math.floor(limitParam)));

    const trending = await getTrendingMints(limit);
    const pairs = trending.map(t => ({
      symbol: t.symbol || t.name || t.mint.slice(0, 4),
      mint: t.mint
    }));

    const rows = await getHeatRows(pairs);
    rows.sort((a, b) => Math.abs((b.pct10m ?? 0)) - Math.abs((a.pct10m ?? 0)));

    return NextResponse.json({ data: rows });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "heat failed" }, { status: 500 });
  }
}
