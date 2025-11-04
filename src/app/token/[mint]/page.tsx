'use client';

import { useEffect, useState } from 'react';
import { TOKENS } from '@/config/tokens';
import { getMergedPrice } from '@/lib/price';

export default function TokenPage({ params }: { params: { mint: string } }) {
  const mint = params.mint;
  const t = TOKENS.find(x => x.mint === mint);
  const [price, setPrice] = useState<{p: number|null, src: string, note?: string} | null>(null);

  useEffect(() => {
    (async () => {
      if (!t) return;
      const r = await getMergedPrice(t.symbol, t.mint, t.pyth);
      setPrice({ p: r.price, src: r.source, note: r.note });
    })();
  }, [mint]);

  if (!t) return <main className="card"><h2>Unknown token</h2><small>Not in the jungle allowlist.</small></main>;

  return (
    <main className="grid">
      <section className="card">
        <div className="row" style={{ gap: 10 }}>
          {t.logo && <img src={t.logo} width={32} height={32} alt="" style={{ borderRadius: 8 }} />}
          <div>
            <h2>{t.name} ({t.symbol})</h2>
            <small>Mint: {t.mint}</small>
          </div>
        </div>
        <hr/>
        <div style={{ fontSize: 18 }}>
          Price: {price?.p ? <b>${price.p.toLocaleString()}</b> : '—'} <span className="badge">{price?.src ?? ''}</span>
        </div>
        {price?.note && <div className="warn" style={{ marginTop: 6 }}>{price.note}</div>}
        <hr/>
        <small>Sources: Jupiter (executable), Pyth (oracle). Not financial advice.</small>
      </section>
    </main>
  );
}
