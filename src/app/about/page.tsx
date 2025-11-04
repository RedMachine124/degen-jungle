export default function AboutPage() {
  return (
    <main className="grid">
      <section className="card">
        <h2>About The Degen Jungle</h2>
        <p>We’re a Solana degen intelligence hub. Our goal is simple: show useful signals fast.</p>
        <ul>
          <li>Non-custodial (we don’t hold funds)</li>
          <li>Data from Jupiter (executable) + Pyth (oracle)</li>
          <li>Allowlist-first to reduce obvious scams</li>
        </ul>
        <p className="warn"><b>Disclaimer:</b> Data can be wrong, delayed, or manipulated. This is not financial advice. DYOR.</p>
      </section>
    </main>
  );
}
