// src/lib/heat.ts
type Point = { t: number; p: number };

const WINDOW_MS = 10 * 60 * 1000;
const hist: Record<string, Point[]> = {};

const JUP = process.env.NEXT_PUBLIC_JUPITER_PRICE_URL || "https://price.jup.ag/v6/price";

async function jupPrice(mint: string): Promise<number | null> {
  try {
    const r = await fetch(`${JUP}?ids=${encodeURIComponent(mint)}`, { cache: "no-store" });
    if (!r.ok) return null;
    const j = await r.json();
    const price = j?.data?.[mint]?.price;
    return typeof price === "number" ? price : null;
  } catch {
    return null;
  }
}

export async function getHeatForMint(symbol: string, mint: string) {
  const price = await jupPrice(mint);
  if (price == null) {
    return { mint, symbol, price: null, pct10m: null, note: "no price source", source: "JUP" as const };
  }

  const now = Date.now();
  hist[mint] ??= [];
  hist[mint].push({ t: now, p: price });
  hist[mint] = hist[mint].filter(pt => now - pt.t <= WINDOW_MS);

  const base = hist[mint][0];
  const pct10m = base ? ((price - base.p) / (base.p || 1)) * 100 : 0;

  return {
    mint,
    symbol,
    price,
    pct10m: Number.isFinite(pct10m) ? pct10m : 0,
    note: undefined as string | undefined,
    source: "JUP" as const,
  };
}
