// Vercel serverless funkcija: ruta za kamion + putarine (HERE Routing API v8)
// Cijene putarina dolaze iz HERE baze koja se održava prema tarifama operatera po državama.
export default async function handler(req, res) {
  const key = process.env.HERE_API_KEY;
  if (!key) return res.status(500).json({ error: 'HERE_API_KEY nije postavljen na Vercelu.' });

  const q = req.query;
  const num = (v, def) => (Number.isFinite(Number(v)) && v !== undefined && v !== '' ? Number(v) : def);
  const coord = /^-?\d+(\.\d+)?,-?\d+(\.\d+)?$/;

  const origin = String(q.origin || '');
  const destination = String(q.destination || '');
  if (!coord.test(origin) || !coord.test(destination)) {
    return res.status(400).json({ error: 'Neispravno polazište ili odredište.' });
  }
  const vias = [].concat(q.via || []).map(String);
  if (vias.some(v => !coord.test(v))) return res.status(400).json({ error: 'Neispravna usputna tačka.' });

  const axles = Math.min(Math.max(num(q.axles, 5), 2), 12);
  const trailers = Math.min(Math.max(num(q.trailers, 0), 0), 3);
  const weightKg = Math.min(Math.max(num(q.weight, 40000), 500), 100000);
  const heightCm = Math.min(Math.max(num(q.height, 400), 100), 500);
  const euro = /^euro[0-6]$/.test(q.euro) ? q.euro : 'euro6';
  const type = q.type === 'straightTruck' ? 'straightTruck' : 'tractor';
  const currency = /^[A-Z]{3}$/.test(q.currency) ? q.currency : 'EUR';

  const url = new URL('https://router.hereapi.com/v8/routes');
  const sp = url.searchParams;
  sp.set('transportMode', 'truck');
  sp.set('origin', origin);
  sp.set('destination', destination);
  vias.forEach(v => sp.append('via', v));
  sp.set('return', 'polyline,summary,tolls');
  sp.set('currency', currency);
  sp.set('lang', 'hr');

  sp.set('truck[type]', type);
  sp.set('truck[axleCount]', String(axles));
  sp.set('truck[trailerCount]', String(trailers));
  sp.set('truck[grossWeight]', String(weightKg));
  sp.set('truck[height]', String(Math.round(heightCm)));
  sp.set('tolls[vehicleCategory]', 'Truck');
  sp.set('tolls[emissionType]', euro);
  if (['B', 'C', 'D', 'E'].includes(q.tunnel)) sp.set('truck[tunnelCategory]', q.tunnel);
  if (q.departureTime && !Number.isNaN(Date.parse(q.departureTime))) sp.set('departureTime', q.departureTime);
  sp.set('apiKey', key);

  try {
    const r = await fetch(url);
    const j = await r.json();
    if (!r.ok) {
      return res.status(r.status).json({ error: j.title || j.error_description || 'Greška pri računanju rute.' });
    }
    res.setHeader('Cache-Control', 'no-store');
    res.status(200).json(j);
  } catch (e) {
    res.status(502).json({ error: 'Servis za rutiranje nije dostupan.' });
  }
}
