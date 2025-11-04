'use client';

import { useEffect, useState } from 'react';
import { TOKENS } from '@/config/tokens';
import { getWatchlist } from '@/lib/watchlist';
import { getMergedPrice } from '@/lib/price';

export default function WatchlistPage() {
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      const mints = getWatchlist();
      const toks = TOKENS.filter(t => mints.includes(t.mint));
      const rows = await Promise.all(toks.map(async t => {
        const r = await getMergedPrice(t.symbol, t.mint, t.pyth);
        return { t, r };
      }));
      setItems(rows);
    })();
  }, []);

  return (
    <main className="grid">
      <section className="card">
        <div className="hdr">
          <h2>⭐ Your Watchlist</h2>
          <small>Saved locally in your browser.</small>
        </div>
        {items.length === 0 ? <small>No saved tokens yet.</small> : (
          <div className="grid grid-3">
            {items.map(({t, r}) => (
              <div className="card" key={t.mint}>
                <b>{t.symbol}</b> <span className="badge">{r.source}</span>
                <div style={{ marginTop: 6 }}>{r.price ? `$${r.price.toLocaleString()}` : '—'}</div>
                {r.note && <div className="warn" style={{ fontSize: 12, marginTop: 6 }}>{r.note}</div>}
                <div style={{ marginTop: 8 }}><a href={`/token/${t.mint}`}><small>Open token →</small></a></div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
