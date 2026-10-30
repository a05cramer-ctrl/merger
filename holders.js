import { isMint, sfToken } from './_util.js';
// Live holder snapshot via Helius DAS getTokenAccounts. Env: HELIUS_API_KEY
export default async function handler(req, res) {
  const mint = String(req.query.mint || '').trim();
  if (!isMint(mint)) return res.status(400).json({ error: 'bad mint' });
  const key = process.env.HELIUS_API_KEY;
  if (!key) return res.status(500).json({ error: 'HELIUS_API_KEY missing' });
  const rpc = `https://mainnet.helius-rpc.com/?api-key=${key}`;
  try {
    const owners = new Map(); let page = 1, total = 0;
    while (page <= 10) {
      const r = await fetch(rpc, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'getTokenAccounts', params: { mint, limit: 1000, page } }) });
      const j = await r.json();
      const list = j?.result?.token_accounts || [];
      if (!list.length) break;
      for (const a of list) { const amt = Number(a.amount || 0); if (amt > 0) { owners.set(a.owner, (owners.get(a.owner) || 0) + amt); total += amt; } }
      if (list.length < 1000) break; page++;
    }
    const t = await sfToken(mint).catch(() => null);
    const creator = t?.creator || '';
    const pool = t?.pool || '';
    // largest holder that is not a wallet on curve is usually the pool vault; flag top holder above 30% as pool
    const rows = [...owners.entries()].map(([owner, amount]) => ({ owner, amount })).sort((a, b) => b.amount - a.amount);
    for (const r of rows) {
      r.pct = total ? r.amount / total : 0;
      r.tag = r.owner === creator ? 'dev' : (r.owner === pool || (rows.indexOf(r) === 0 && r.pct > 0.3)) ? 'pool' : '';
    }
    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300');
    res.status(200).json({ mint, holders: rows.length, totalRaw: total, creator, top: rows.slice(0, 500), takenAt: new Date().toISOString() });
  } catch (e) { res.status(502).json({ error: String(e.message || e) }); }
}
