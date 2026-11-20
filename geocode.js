// Vercel serverless funkcija: pretraga lokacija (HERE Geocoding & Search)
export default async function handler(req, res) {
  const key = process.env.HERE_API_KEY;
  if (!key) return res.status(500).json({ error: 'HERE_API_KEY nije postavljen na Vercelu.' });

  const q = String(req.query.q || '').trim();
  if (q.length < 2) return res.status(400).json({ error: 'Prekratak upit.' });

  try {
    const url = new URL('https://geocode.search.hereapi.com/v1/geocode');
    url.searchParams.set('q', q);
    url.searchParams.set('limit', '6');
    url.searchParams.set('lang', 'hr');
    url.searchParams.set('apiKey', key);
    const r = await fetch(url);
    const j = await r.json();
    if (!r.ok) return res.status(r.status).json({ error: j.error_description || j.title || 'Greška geokodiranja' });

    const items = (j.items || [])
      .filter(i => i.position)
      .map(i => ({ title: i.title, lat: i.position.lat, lng: i.position.lng }));
    res.setHeader('Cache-Control', 's-maxage=86400');
    res.status(200).json({ items });
  } catch (e) {
    res.status(502).json({ error: 'Servis za pretragu lokacija nije dostupan.' });
  }
}
