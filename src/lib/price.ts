type PriceReading = {
  symbol: string;
  mint: string;
  price: number | null;
  source: 'JUP' | 'PYTH' | 'MIX' | 'NONE';
  ts: number;
  note?: string;
};

export async function getJupiterPrice(mint: string): Promise<number | null> {
  try {
    const base = process.env.NEXT_PUBLIC_JUPITER_PRICE_URL!;
    const r = await fetch(`${base}?ids=${mint}`, { next: { revalidate: 5 } });
    if (!r.ok) return null;
    const j = await r.json();
    const price = j.data?.[mint]?.price ?? null;
    return typeof price === 'number' ? price : null;
  } catch {
    return null;
  }
}

export async function getPythPrice(product: string): Promise<number | null> {
  try {
    const base = process.env.NEXT_PUBLIC_PYTH_HERMES_URL!;
    const r = await fetch(`${base}?encoding=json`, { next: { revalidate: 10 } });
    if (!r.ok) return null;
    const j = await r.json();
    const updates = j?.parsed ?? [];
    const match = updates.find((u: any) => (u.product?.symbol ?? '').includes(product));
    const price = match?.price?.price;
    return typeof price === 'number' ? price : null;
  } catch {
    return null;
  }
}

export async function getMergedPrice(symbol: string, mint: string, pythKey?: string): Promise<PriceReading> {
  const [jup, pyth] = await Promise.all([
    getJupiterPrice(mint),
    pythKey ? getPythPrice(pythKey) : Promise.resolve(null),
  ]);

  const ts = Date.now();

  if (jup && pyth) {
    const diff = Math.abs(jup - pyth) / Math.max(1e-9, pyth);
    return {
      symbol, mint, price: jup, source: 'MIX', ts,
      note: diff > 0.05 ? '⚠ price diverges from oracle (>5%)' : undefined,
    };
  }
  if (jup) return { symbol, mint, price: jup, source: 'JUP', ts };
  if (pyth) return { symbol, mint, price: pyth, source: 'PYTH', ts };
  return { symbol, mint, price: null, source: 'NONE', ts, note: 'no price source' };
}
