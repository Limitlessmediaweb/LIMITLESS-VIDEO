// Anteprima rapida: screenshot della pagina a istanti scelti (senza registrare).
// Uso: node tools/snap.js 1 3.5 7 11.8 14.5 17  → build/snap/t*.png
const fs = require('fs');
const path = require('path');
let chromium;
try { ({ chromium } = require('playwright')); } catch { ({ chromium } = require('/opt/node22/lib/node_modules/playwright')); }
const ROOT = path.join(__dirname, '..');
const DIR = path.join(ROOT, 'build', 'snap');
fs.mkdirSync(DIR, { recursive: true });
(async () => {
  const b = await chromium.launch({ args: ['--force-device-scale-factor=1'] });
  const p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
  p.on('pageerror', (e) => console.error('pageerror:', e.message));
  p.on('console', (m) => m.type() === 'error' && console.error('console:', m.text()));
  await p.goto('file://' + path.join(ROOT, 'src', 'index.html') + '?record');
  await p.evaluate(() => window.__ready);
  for (const t of process.argv.slice(2).map(Number)) {
    await p.evaluate((t) => window.__seek(t), t);
    const f = path.join(DIR, `t${t.toFixed(1)}.png`);
    await p.screenshot({ path: f });
    console.log(f);
  }
  await b.close();
})();
