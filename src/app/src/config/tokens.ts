export const TOKENS = [
  {
    symbol: 'SOL',
    name: 'Solana',
    mint: 'So11111111111111111111111111111111111111112',
    pyth: 'Crypto.SOL/USD',
    logo: 'https://assets.coingecko.com/coins/images/4128/large/solana.png'
  },
  {
    symbol: 'USDC',
    name: 'USD Coin',
    mint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
    pyth: 'Crypto.USDC/USD',
    logo: 'https://assets.coingecko.com/coins/images/6319/large/USD_Coin_icon.png'
  }
];

export const ALLOWED_MINTS = new Set(TOKENS.map(t => t.mint));
