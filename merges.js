import { SF, isMint, pick, sfToken } from './_util.js';
export default async function handler(req, res) {
  const creator = String(req.query.creator || '').trim();
  if (!isMint(creator)) return res.status(400).json({ error: 'creator required' });
  try {
    const r = await fetch(`${SF}/launches?creator=${creator}&pageSize=100`);
    if (!r.ok) throw new Error('stonkfun ' + r.status);
    const j = await r.json();
    const list = j?.data?.launches || j?.data?.items || (Array.isArray(j?.data) ? j.data : []);
    const mints = [...new Set(list.map(l => pick(l, 'mint', 'tokenMint', 'baseMint')).filter(Boolean))].slice(0, 30);
    const merges = (await Promise.all(mints.map(m => sfToken(m).catch(() => null)))).filter(Boolean);
    res.setHeader('Cache-Control', 's-maxage=30, stale-while-revalidate=120');
    res.status(200).json({ merges });
  } catch (e) { res.status(502).json({ error: String(e.message || e) }); }
}
