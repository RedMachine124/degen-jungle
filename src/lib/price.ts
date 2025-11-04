type PriceReading = {
  symbol: string;
  mint: string;
  price: number | null;
  source: 'JUP' | 'NONE';
  ts: number;
  note?: string;
};

const JUP_DEFAULT = 'https://price.jup.ag/v6/price';

export async function getJupiterPrice(mint: string): Promise<number | null> {
  try {
    const base = process.env.NEXT_PUBLIC_JUPITER_PRICE_URL || JUP_DEFAULT;
    const r = await fetch(`${base}?ids=${encodeURIComponent(mint)}`, { cache: 'no-store' });
    if (!r.ok) return null;
    const j = await r.json();
    const price = j?.data?.[mint]?.price;
    return typeof price === 'number' ? price : null;
  } catch {
    return null;
  }
}

export async function getMergedPrice(symbol: string, mint: string): Promise<PriceReading> {
  const jup = await getJupiterPrice(mint);
  const ts = Date.now();
  if (jup) return { symbol, mint, price: jup, source: 'JUP', ts };
  return { symbol, mint, price: null, source: 'NONE', ts, note: 'no price source' };
}
