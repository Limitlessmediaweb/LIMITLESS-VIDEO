// Precalcola il globo wireframe (proiezione ortografica centrata sull'immobile,
// content.location.center). Output: src/map-data.js (window.MAPDATA).
// Uso: npm run map
const fs = require('fs');
const path = require('path');
const CONTENT = require('../content.js');

(async () => {
  const d3 = await import('d3-geo');
  const topojson = await import('topojson-client');
  const land50 = require('world-atlas/land-50m.json');
  const countries50 = require('world-atlas/countries-50m.json');

  // Scala: a scale 1 l'Italia (~10.5° di latitudine) occupa ~620px di altezza.
  const R = 3400;
  const COUNTRY = '380'; // ISO 3166 numerico dell'Italia: cambialo per un altro paese
  const [lon, lat] = CONTENT.location.center;
  const proj = d3.geoOrthographic().rotate([-lon, -lat]).scale(R).translate([0, 0]).precision(0.2);
  const gen = d3.geoPath(proj).digits(1);

  const land = topojson.feature(land50, land50.objects.land);
  const country = topojson.feature(countries50, countries50.objects.countries).features.find((f) => f.id === COUNTRY);

  const out = {
    R,
    sphere: gen({ type: 'Sphere' }),
    graticule: gen(d3.geoGraticule().step([10, 10])()),
    graticuleFine: gen(d3.geoGraticule().step([2, 2]).extent([[lon - 16, lat - 14], [lon + 16, lat + 12]])()),
    land: gen(land),
    focus: gen(country),
  };
  const file = path.join(__dirname, '..', 'src', 'map-data.js');
  fs.writeFileSync(file, '// Generato da tools/build-map.js — non modificare a mano\nwindow.MAPDATA = ' + JSON.stringify(out) + ';\n');
  console.log('map-data.js', (fs.statSync(file).size / 1024).toFixed(0) + ' KB');
})();
