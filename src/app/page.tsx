'use client';

import { useEffect, useMemo, useState } from 'react';
import { TOKENS } from '@/config/tokens';
import { getMergedPrice } from '@/lib/price';
import { getWatchlist, toggleWatch, isWatched } from '@/lib/watchlist';

type Row = {
  symbol: string; mint: string; name: string; logo?: string;
  price: number | null; source: string; ts: number; note?: string; watched: boolean;
};

type HeatRow = { mint: string; symbol: string; price: number|null; pct10m: number|null; note?: string; source: string; };
type NewItem = { mint: string; symbol: string; name: string; createdAt: number|null; supply: string|null; decimals: number|null; risky: boolean; };

export default function Home() {
  const [rows, setRows] = useState<Row[]>([]);
  const [watch, setWatch] = useState<string[]>([]);
  const [heat, setHeat] = useState<HeatRow[]>([]);
  const [newTokens, setNewTokens] = useState<NewItem[]>([]);
  const [heliusNote, setHeliusNote] = useState<string|undefined>(undefined);

  useEffect(() => {
    setWatch(getWatchlist());
    (async () => {
      const results = await Promise.all(TOKENS.map(async t => {
        const r = await getMergedPrice(t.symbol, t.mint, t.pyth);
        return {
          symbol: t.symbol, mint: t.mint, name: t.name, logo: t.logo,
          price: r.price, source: r.source, ts: r.ts, note: r.note, watched: isWatched(t.mint),
        } as Row;
      }));
      setRows(results);
    })();
  }, []);

  useEffect(() => {
    const pullHeat = async () => {
      const r = await fetch('/api/heat', { cache: 'no-store' });
      const j = await r.json();
      setHeat(j.data ?? []);
    };
    pullHeat();
    const id = setInterval(pullHeat, 10000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const pullNew = async () => {
      const r = await fetch('/api/newlp', { cache: 'no-store' });
      const j = await r.json();
      setNewTokens(j.data ?? []);
      setHeliusNote(j.note);
    };
    pullNew();
    const id = setInterval(pullNew, 30000);
    return () => clearInterval(id);
  }, []);

  function onToggle(mint: string) {
    toggleWatch(mint);
    setWatch(getWatchlist());
    setRows(prev => prev.map(r => r.mint === mint ? { ...r, watched: isWatched(mint) } : r));
  }

  const promoted = useMemo(() => rows.slice(0, 1), [rows]);

  return (
    <main className="grid" style={{ gap: 16 }}>
      <section className="card promoted">
        <div className="hdr">
          <h1>🦍 Mohawkfoot — The Degen Jungle</h1>
          <span className="badge">Alpha v0 — Free data</span>
        </div>
        <div>Survive the jungle. Hunt pumps early. Avoid rugs. <span className="warn">Not financial advice.</span></div>
      </section>

      <section className="card">
        <div className="hdr">
          <h2>🌟 Promoted (Paid Listing)</h2>
          <a href="/promote"><small>Promote your coin →</small></a>
        </div>
        {promoted.length === 0 ? <small>None yet.</small> : (
          <div className="grid grid-3">
            {promoted.map(r => <TokenCard key={r.mint} row={r} onToggle={onToggle} />)}
          </div>
        )}
      </section>

      <section className="card">
        <div className="hdr">
          <h2>🔥 Heating Up (10m momentum)</h2>
          <small>Sorted by absolute % change in ~10 minutes</small>
        </div>
        {heat?.length ? (
          <div className="grid grid-3">
            {heat.slice(0, 9).map(h => (
              <div key={h.mint} className="card" style={{ borderColor: '#21252e' }}>
                <b>{h.symbol}</b> <span className="badge">{h.source}</span>
                <div style={{ marginTop: 6, fontSize: 14 }}>
                  {h.price ? `$${h.price.toLocaleString()}` : '—'} &nbsp;
                  {h.pct10m != null && <b className={h.pct10m >= 0 ? 'ok' : 'bad'}>
                    {h.pct10m >= 0 ? '+' : ''}{h.pct10m.toFixed(2)}%
                  </b>}
                </div>
                {h.note && <div className="warn" style={{ fontSize: 12, marginTop: 6 }}>{h.note}</div>}
                <div style={{ marginTop: 8 }}><a href={`/token/${h.mint}`}><small>Open token →</small></a></div>
              </div>
            ))}
          </div>
        ) : <small>Collecting data…</small>}
      </section>

      <section className="card">
        <div className="hdr">
          <h2>🍼 New Tokens (last ~15m)</h2>
          <small>Helius DAS — fungible assets</small>
        </div>
        {heliusNote && <div className="warn" style={{ marginBottom: 8 }}>{heliusNote}</div>}
        {newTokens?.length ? (
          <div className="grid grid-3">
            {newTokens.map(n => (
              <div key={n.mint} className="card" style={{ borderColor: '#21252e' }}>
                <b>{n.symbol || '—'}</b> {n.name ? <small>· {n.name}</small> : null}
                <div style={{ marginTop: 6 }}><small>Mint: {n.mint}</small></div>
                <div style={{ marginTop: 6 }}>
                  <small>Decimals: {n.decimals ?? '—'} | Supply: {n.supply ?? '—'}</small>
                </div>
                {n.risky && <div className="warn" style={{ marginTop: 6, fontSize: 12 }}>Heads up: incomplete metadata</div>}
              </div>
            ))}
          </div>
        ) : <small>No fresh mints detected (or key missing).</small>}
      </section>

      <section className="card">
        <div className="hdr">
          <h2>📊 Live Prices (Allowlist)</h2>
          <small>Source: Jupiter (executable) + Pyth (oracle)</small>
        </div>
        <div className="grid grid-3">
          {rows.map(r => <TokenCard key={r.mint} row={r} onToggle={onToggle} />)}
        </div>
      </section>
    </main>
  );
}

function TokenCard({ row, onToggle }: { row: Row, onToggle: (m: string) => void }) {
  const fresh = Date.now() - row.ts < 30000;
  return (
    <div className="card" style={{ borderColor: '#21252e' }}>
      <div className="row" style={{ justifyContent: 'space-between' }}>
        <div className="row">
          {row.logo && <img src={row.logo} width={22} height={22} alt="" style={{ borderRadius: 6 }} />}
          <strong>{row.symbol}</strong>
          <span className="badge">{row.source}</span>
        </div>
        <button
          aria-label="watch"
          className={`star ${row.watched ? 'active' : ''}`}
          onClick={() => onToggle(row.mint)}
          title={row.watched ? 'Remove from watchlist' : 'Add to watchlist'}
        >★</button>
      </div>
      <div style={{ marginTop: 6, fontSize: 14 }}>
        {row.price ? <span className="ok">${row.price.toLocaleString()}</span> : <span className="bad">no price</span>}
        {!fresh && <span className="badge" style={{ marginLeft: 8 }}>refreshing…</span>}
      </div>
      {row.note && <div className="warn" style={{ fontSize: 12, marginTop: 6 }}>{row.note}</div>}
      <div style={{ marginTop: 8 }}>
        <a href={`/token/${row.mint}`}><small>Open token page →</small></a>
      </div>
    </div>
  );
}
