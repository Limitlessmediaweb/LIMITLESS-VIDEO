// Precalcola il globo wireframe (proiezione ortografica centrata su coverage.center)
// e le posizioni dei pin. Output: src/globe-data.js (window.GLOBE).
// Uso: npm run globe
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
  const [lon, lat] = CONTENT.coverage.center;
  const proj = d3.geoOrthographic().rotate([-lon, -lat]).scale(R).translate([0, 0]).precision(0.2);
  const gen = d3.geoPath(proj).digits(1);

  const land = topojson.feature(land50, land50.objects.land);
  const italy = topojson.feature(countries50, countries50.objects.countries).features.find((f) => f.id === '380');

  const out = {
    R,
    sphere: gen({ type: 'Sphere' }),
    graticule: gen(d3.geoGraticule().step([10, 10])()),
    graticuleFine: gen(d3.geoGraticule().step([2, 2]).extent([[-2, 30], [28, 54]])()),
    land: gen(land),
    focus: gen(italy),
    pins: CONTENT.coverage.pins.map((p) => {
      const [x, y] = proj([p.lon, p.lat]);
      return { ...p, x: +x.toFixed(1), y: +y.toFixed(1) };
    }),
  };
  const file = path.join(__dirname, '..', 'src', 'globe-data.js');
  fs.writeFileSync(file, '// Generato da tools/build-globe.js — non modificare a mano\nwindow.GLOBE = ' + JSON.stringify(out) + ';\n');
  console.log('globe-data.js', (fs.statSync(file).size / 1024).toFixed(0) + ' KB');
})();
