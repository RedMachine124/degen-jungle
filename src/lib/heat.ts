// src/lib/heat.ts
type Point = { t: number; p: number };
type HeatRow = { mint: string; symbol: string; price: number|null; pct10m: number|null; note?: string; source: "JUP" };

const WINDOW_MS = 10 * 60 * 1000;
const hist: Record<string, Point[]> = {};
const JUP = process.env.NEXT_PUBLIC_JUPITER_PRICE_URL || "https://price.jup.ag/v6/price";

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

async function jupPrices(mints: string[]): Promise<Record<string, number | null>> {
  // Jupiter v6 accepts comma-separated ids
  const map: Record<string, number | null> = {};
  if (mints.length === 0) return map;

  // batch by 40 to be gentle on the API
  for (const group of chunk(mints, 40)) {
    try {
      const url = `${JUP}?ids=${encodeURIComponent(group.join(","))}`;
      const r = await fetch(url, { cache: "no-store" });
      if (!r.ok) continue;
      const j = await r.json();
      const data = j?.data ?? {};
      for (const mint of group) {
        const p = data?.[mint]?.price;
        map[mint] = typeof p === "number" ? p : null;
      }
    } catch {
      // mark this chunk as nulls on error
      for (const mint of group) map[mint] = map[mint] ?? null;
    }
  }
  return map;
}

export async function getHeatRows(symbolMintPairs: {symbol: string; mint: string}[]): Promise<HeatRow[]> {
  const mints = symbolMintPairs.map(x => x.mint);
  const prices = await jupPrices(mints);

  const now = Date.now();
  const rows: HeatRow[] = [];

  for (const { symbol, mint } of symbolMintPairs) {
    const price = prices[mint] ?? null;
    if (price == null) {
      rows.push({ mint, symbol, price: null, pct10m: null, note: "no price source", source: "JUP" });
      continue;
    }

    hist[mint] ??= [];
    hist[mint].push({ t: now, p: price });
    hist[mint] = hist[mint].filter(pt => now - pt.t <= WINDOW_MS);

    const base = hist[mint][0];
    const pct10m = base ? ((price - base.p) / (base.p || 1)) * 100 : 0;

    rows.push({
      mint, symbol, price,
      pct10m: Number.isFinite(pct10m) ? pct10m : 0,
      source: "JUP",
    });
  }

  return rows;
}
