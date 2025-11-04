import { getMergedPrice } from './price';

type Point = { t: number; p: number };
const windowMs = 10 * 60 * 1000;
const hist: Record<string, Point[]> = {};

export async function getHeatForMint(symbol: string, mint: string, pyth?: string) {
  const r = await getMergedPrice(symbol, mint, pyth);
  if (r.price == null) return { mint, symbol, price: null, pct10m: null, note: r.note, source: r.source };

  const now = Date.now();
  hist[mint] ??= [];
  hist[mint].push({ t: now, p: r.price });
  hist[mint] = hist[mint].filter(pt => now - pt.t <= windowMs);

  const base = hist[mint][0];
  const pct10m = base ? ((r.price - base.p) / (base.p || 1)) * 100 : 0;

  return {
    mint, symbol, price: r.price, pct10m: Number.isFinite(pct10m) ? pct10m : 0,
    note: r.note, source: r.source,
  };
}
