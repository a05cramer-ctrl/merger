import { isMint, sfToken } from './_util.js';
export default async function handler(req, res) {
  const mint = String(req.query.mint || '').trim();
  if (!isMint(mint)) return res.status(400).json({ error: 'bad mint' });
  try {
    const t = await sfToken(mint);
    if (!t) return res.status(404).json({ error: 'not a StonkFun coin' });
    res.setHeader('Cache-Control', 's-maxage=30, stale-while-revalidate=120');
    res.status(200).json(t);
  } catch (e) { res.status(502).json({ error: String(e.message || e) }); }
}
