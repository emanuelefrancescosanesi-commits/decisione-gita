// Genera index.html: prende src/app.html e sostituisce il segnaposto della mappa
// con i contorni dei paesi UE calcolati dai dati Natural Earth (world-atlas).
import fs from 'fs';
import * as topo from 'topojson-client';
import * as d3 from 'd3-geo';

const world = JSON.parse(fs.readFileSync('node_modules/world-atlas/countries-50m.json', 'utf8'));
const all = topo.feature(world, world.objects.countries).features;

// ISO 3166-1 numerico -> ISO alpha-2, solo i 27 paesi UE
const EU = {
  '040': 'AT', '056': 'BE', '100': 'BG', '191': 'HR', '196': 'CY', '203': 'CZ', '208': 'DK',
  '233': 'EE', '246': 'FI', '250': 'FR', '276': 'DE', '300': 'GR', '348': 'HU', '372': 'IE',
  '380': 'IT', '428': 'LV', '440': 'LT', '442': 'LU', '470': 'MT', '528': 'NL', '616': 'PL',
  '620': 'PT', '642': 'RO', '703': 'SK', '705': 'SI', '724': 'ES', '752': 'SE',
};
// Paesi vicini disegnati in grigio, solo come contesto
const CONTEXT = new Set([
  '826', '578', '756', '352', '688', '070', '499', '807', '008', '498', '804', '112', '792',
  '643', '504', '012', '788', '434', '818', '268', '051', '031', '760', '422', '400', '376', '275', '382',
]);

const W = 700, H = 620;
const polysOf = (f) => (f.geometry.type === 'Polygon' ? [f.geometry.coordinates] : f.geometry.coordinates);
// Tiene solo i poligoni in Europa: esclude Guyana francese, Azzorre, Canarie ecc.
const inEurope = (poly) => {
  const [lon, lat] = d3.geoCentroid({ type: 'Polygon', coordinates: poly });
  return lon > -12 && lon < 45 && lat > 34 && lat < 72;
};
const multi = (polys) => ({ type: 'Feature', geometry: { type: 'MultiPolygon', coordinates: polys } });

const eu = [];
const context = [];
for (const f of all) {
  const id = String(f.id).padStart(3, '0');
  if (EU[id]) {
    const polys = polysOf(f).filter(inEurope);
    if (polys.length) eu.push({ code: EU[id], polys });
  } else if (CONTEXT.has(id)) {
    context.push(multi(polysOf(f)));
  }
}

const projection = d3.geoConicConformal().rotate([-12, 0]).center([0, 52]).parallels([38, 62]);
projection.fitExtent([[6, 6], [W - 6, H - 26]], { type: 'FeatureCollection', features: eu.map((c) => multi(c.polys)) });
projection.clipExtent([[0, 0], [W, H]]);
const path = d3.geoPath(projection).digits(1);

const countries = eu.map(({ code, polys }) => {
  // scarta i puntini invisibili (isolotti), ma tiene sempre Malta
  const kept = polys.filter((p) => code === 'MT' || path.area({ type: 'Polygon', coordinates: p }) >= 3);
  let biggest = kept[0], best = -1;
  for (const p of kept) {
    const a = d3.geoArea({ type: 'Polygon', coordinates: p });
    if (a > best) { best = a; biggest = p; }
  }
  const [cx, cy] = path.centroid({ type: 'Polygon', coordinates: biggest });
  return { code, d: path(multi(kept)), cx: +cx.toFixed(1), cy: +cy.toFixed(1) };
});
const map = { w: W, h: H, countries, context: context.map((c) => path(c)).filter(Boolean).join('') };

const html = fs.readFileSync('src/app.html', 'utf8');
if (!html.includes('/*__MAP__*/null')) throw new Error('segnaposto mappa mancante in src/app.html');
fs.writeFileSync('index.html', html.replace('/*__MAP__*/null', JSON.stringify(map)));
console.log('index.html scritto,', Math.round(fs.statSync('index.html').size / 1024), 'KB');
