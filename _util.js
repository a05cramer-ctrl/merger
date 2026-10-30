export const SF = 'https://www.stonkfun.xyz/api/public/v1';
export const isMint = s => /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(String(s || ''));
export const pick = (o, ...ks) => { for (const k of ks) { const v = k.split('.').reduce((a, p) => a?.[p], o); if (v != null && v !== '') return v; } return null; };
export async function sfToken(mint) {
  const r = await fetch(`${SF}/tokens/${mint}`, { headers: { accept: 'application/json' } });
  if (!r.ok) return null;
  const j = await r.json(); const t = j?.data?.token || j?.data || {};
  let launch = j?.data?.launch || null;
  return {
    mint,
    name: pick(t, 'name') || '', symbol: pick(t, 'symbol') || '',
    image: pick(t, 'image', 'imageUrl', 'logo', 'logoUrl') || '',
    quote: pick(t, 'quote.symbol', 'quoteSymbol') || '',
    marketCapUsd: pick(t, 'marketCapUsd', 'marketCap'),
    priceUsd: pick(t, 'priceUsd', 'price', 'market.priceUsd'),
    volume24hUsd: pick(t, 'volume24hUsd', 'volume24h'),
    createdAt: pick(t, 'createdAt', 'launchedAt') || pick(launch || {}, 'createdAt') || '',
    creator: pick(t, 'creator', 'creatorWallet', 'launch.creator') || pick(launch || {}, 'creator', 'creatorWallet') || '',
    pool: pick(t, 'pool', 'poolId', 'poolAddress') || '',
    supply: pick(t, 'supply', 'totalSupply') || 1e9,
  };
}
