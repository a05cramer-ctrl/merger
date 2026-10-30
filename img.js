// Image proxy so token logos can be used as WebGL textures (CORS).
const OK = /^(gateway\.irys\.xyz|ipfs\.filebase\.io|gateway\.pinata\.cloud|[a-z0-9-]+\.mypinata\.cloud|axiomtrading[a-z0-9.-]*\.(io|com)|[a-z0-9.-]*axiom-cdn\.io|cdn\.dexscreener\.com|metadata\.j7tracker\.io|proximaimage\.hel1\.your-objectstorage\.com|ipfs\.io|arweave\.net|www\.stonkfun\.xyz|[a-z0-9-]+\.myfilebase\.com|pbs\.twimg\.com)$/i;
export default async function handler(req, res) {
  let u; try { u = new URL(String(req.query.url || '')); } catch { return res.status(400).end(); }
  if (u.protocol !== 'https:' || !OK.test(u.hostname)) return res.status(400).end();
  try {
    const r = await fetch(u, { headers: { 'user-agent': 'Mozilla/5.0' } });
    const type = r.headers.get('content-type') || '';
    if (!r.ok || !type.startsWith('image/')) return res.status(404).end();
    const buf = Buffer.from(await r.arrayBuffer());
    if (buf.length > 6e6) return res.status(413).end();
    res.setHeader('content-type', type); res.setHeader('Cache-Control', 's-maxage=86400, immutable');
    res.status(200).send(buf);
  } catch { res.status(502).end(); }
}
