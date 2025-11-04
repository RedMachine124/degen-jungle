export default function StatusPage() {
  const jup = process.env.NEXT_PUBLIC_JUPITER_PRICE_URL;
  const pyth = process.env.NEXT_PUBLIC_PYTH_HERMES_URL;
  const rpc = process.env.NEXT_PUBLIC_SOLANA_RPC;

  return (
    <main className="grid">
      <section className="card">
        <h2>Data Status</h2>
        <ul>
          <li>Jupiter Price: <code>{jup}</code></li>
          <li>Pyth Hermes: <code>{pyth}</code></li>
          <li>Solana RPC: <code>{rpc}</code></li>
        </ul>
        <small>Prices refresh every few seconds. If anything looks off, it might be API rate limits or network load.</small>
      </section>
    </main>
  );
}
