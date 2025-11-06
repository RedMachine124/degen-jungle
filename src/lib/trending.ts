// src/lib/trending.ts
type HotToken = { mint: string; symbol?: string; name?: string; score?: number };

export async function getJupiterHot(limit = 150): Promise<HotToken[]> {
  try {
    const r = await fetch("https://stats.jup.ag/hot", { cache: "no-store" });
    if (!r.ok) return [];
    const j = await r.json();
    return (j?.hotTokens ?? []).slice(0, limit).map((t: any) => ({
      mint: t?.mint ?? "",
      symbol: t?.symbol ?? t?.ticker ?? undefined,
      name: t?.name ?? undefined,
      score: t?.score ?? undefined,
    })).filter(x => x.mint);
  } catch { return []; }
}

export async function getDexScreenerTop(limit = 150): Promise<HotToken[]> {
  try {
    const r = await fetch("https://api.dexscreener.com/latest/dex/pairs/solana", { cache: "no-store" });
    if (!r.ok) return [];
    const j = await r.json();
    const pairs: any[] = j?.pairs ?? [];
    const ranked = pairs
      .filter(p => p?.baseToken?.address)
      .map(p => ({
        mint: p.baseToken.address,
        symbol: p.baseToken.symbol,
        name: p.baseToken.name,
        score:
          (Number(p.txns?.m5?.buys || 0) + Number(p.txns?.m5?.sells || 0)) * 5 +
          Number(p.volume?.h1 || 0),
      }));
    const best = new Map<string, HotToken>();
    for (const t of ranked) {
      const prev = best.get(t.mint);
      if (!prev || (t.score ?? 0) > (prev.score ?? 0)) best.set(t.mint, t);
    }
    return Array.from(best.values()).slice(0, limit);
  } catch { return []; }
}

export async function getTrendingMints(max = 200): Promise<HotToken[]> {
  const [jup, dex] = await Promise.all([getJupiterHot(150), getDexScreenerTop(150)]);
  const byMint = new Map<string, HotToken>();
  for (const t of [...jup, ...dex]) {
    if (!t.mint) continue;
    const prev = byMint.get(t.mint);
    if (!prev) byMint.set(t.mint, t);
    else {
      byMint.set(t.mint, {
        mint: t.mint,
        symbol: prev.symbol || t.symbol,
        name: prev.name || t.name,
        score: Math.max(prev.score ?? 0, t.score ?? 0),
      });
    }
  }
  return Array.from(byMint.values()).slice(0, max);
}

