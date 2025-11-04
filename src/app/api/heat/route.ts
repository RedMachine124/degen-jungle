import { NextResponse } from 'next/server';
import { TOKENS } from '@/config/tokens';
import { getHeatForMint } from '@/lib/heat';

export const revalidate = 5;

export async function GET() {
  try {
    const rows = await Promise.all(TOKENS.map(t => getHeatForMint(t.symbol, t.mint, t.pyth)));
    rows.sort((a, b) => Math.abs((b.pct10m ?? 0)) - Math.abs((a.pct10m ?? 0)));
    return NextResponse.json({ data: rows });
  } catch (e:any) {
    return NextResponse.json({ error: e?.message ?? 'heat failed' }, { status: 500 });
  }
}
