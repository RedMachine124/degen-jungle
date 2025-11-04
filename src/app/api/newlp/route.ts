import { NextResponse } from 'next/server';

export const revalidate = 30;

export async function GET() {
  const key = process.env.HELIUS_API_KEY;
  if (!key) {
    return NextResponse.json({ data: [], note: 'Set HELIUS_API_KEY to enable' });
  }

  const endpoint = `https://mainnet.helius-rpc.com/?api-key=${key}`;
  const createdAfter = Date.now() - (15 * 60 * 1000);

  const body = {
    jsonrpc: '2.0',
    id: 'dj-newlp',
    method: 'searchAssets',
    params: {
      page: 1,
      limit: 25,
      sortBy: 'created',
      sortDirection: 'desc',
      createdAfter,
      tokenType: 'fungible'
    }
  };

  try {
    const r = await fetch(endpoint, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
      next: { revalidate: 30 }
    });
    if (!r.ok) throw new Error(`status ${r.status}`);
    const j = await r.json();
    const items = (j?.result ?? []).map((it: any) => ({
      mint: it.id,
      symbol: it.token_info?.symbol ?? it.content?.metadata?.symbol ?? '',
      name: it.token_info?.name ?? it.content?.metadata?.name ?? '',
      createdAt: it.created_at ?? null,
      supply: it.token_info?.supply ?? null,
      decimals: it.token_info?.decimals ?? null,
      risky: !it.token_info?.symbol || (it.token_info?.decimals ?? 0) === 0
    }));
    return NextResponse.json({ data: items });
  } catch (e:any) {
    return NextResponse.json({ error: e?.message ?? 'newlp failed' }, { status: 500 });
  }
}
