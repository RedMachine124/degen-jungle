import { NextResponse } from 'next/server';
const JUP = process.env.NEXT_PUBLIC_JUPITER_PRICE_URL || 'https://price.jup.ag/v6/price';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const mint = searchParams.get('mint');
  if (!mint) return NextResponse.json({ error: 'mint param required' }, { status: 400 });

  const r = await fetch(`${JUP}?ids=${encodeURIComponent(mint)}`, { cache: 'no-store' });
  const j = await r.json();
  return NextResponse.json({ ok: r.ok, data: j });
}

