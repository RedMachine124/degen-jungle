export function getWatchlist(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem('dj_watchlist');
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}
export function toggleWatch(mint: string) {
  if (typeof window === 'undefined') return;
  const cur = new Set(getWatchlist());
  cur.has(mint) ? cur.delete(mint) : cur.add(mint);
  localStorage.setItem('dj_watchlist', JSON.stringify([...cur]));
}
export function isWatched(mint: string) {
  return getWatchlist().includes(mint);
}
