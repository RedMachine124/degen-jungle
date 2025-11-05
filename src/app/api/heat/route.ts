// src/app/api/heat/route.ts
import { NextResponse } from "next/server";
import { getTrendingMints } from "@/lib/trending";
import { getHeatForMint } from "@/lib/heat";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const trending = await getTrendingMints(200); // whole market view
    // compute heat for top ~36 to keep UI snappy
    const top = trending.slice(0, 36);
    const rows = await Promise.all(
      top.map(t => getHeatForMint(t.symbol || t.name || t.mint.slice(0,4), t.mint))
    );
    rows.sort((a, b) => Math.abs((b.pct10m ?? 0)) - Math.abs((a.pct10m ?? 0)));
    return NextResponse.json({ data: rows });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "heat failed" }, { status: 500 });
  }
}
