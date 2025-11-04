import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Mohawkfoot — The Degen Jungle',
  description: 'Solana degen intelligence: live prices, trends, watchlist, promos. Not financial advice.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="container">
          <header className="hdr">
            <div className="row">
              <div style={{ width: 36, height: 36, borderRadius: 8, background: '#1a1f2a', display: 'grid', placeItems: 'center', fontWeight: 800 }}>🦍</div>
              <div>
                <div style={{ fontWeight: 800, fontSize: 18 }}>The Degen Jungle</div>
                <small>Hunt pumps early. Avoid rugs. DYOR.</small>
              </div>
            </div>
            <nav className="row">
              <a href="/">Home</a>
              <a href="/watchlist">Watchlist</a>
              <a href="/promote">Promote</a>
              <a href="/status">Status</a>
              <a href="/about">About</a>
            </nav>
          </header>
          {children}
          <footer style={{ marginTop: 20, opacity: .7, fontSize: 12 }}>
            Non-custodial data tool. Prices from third-party protocols. Not financial advice.
          </footer>
        </div>
      </body>
    </html>
  );
}
