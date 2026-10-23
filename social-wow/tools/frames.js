// Anteprima rapida: node tools/frames.js <nome> t1 t2 ... → build/test/<nome>_sheet.jpg
const path = require('path'); const fs = require('fs'); const { execSync } = require('child_process');
let chromium; try { ({ chromium } = require('playwright')); } catch { ({ chromium } = require('/opt/node22/lib/node_modules/playwright')); }
const name = process.argv[2]; const ts = process.argv.slice(3).map(Number);
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
  p.on('pageerror', (e) => console.error('pageerror:', e.message));
  await p.goto('file://' + path.join(__dirname, '..', 'src', name, 'index.html') + '?record'); await p.evaluate(() => window.__ready);
  fs.mkdirSync('build/test', { recursive: true }); const files = [];
  for (const t of ts) { await p.evaluate((t) => window.__seek(t), t); await p.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));
    const f = `build/test/${name}_${t}.png`; await p.screenshot({ path: f }); files.push(f); }
  await b.close();
  execSync(`ffmpeg -v error -y ${files.map((f) => `-i ${f}`).join(' ')} -filter_complex "${files.map((_, i) => `[${i}]`).join('')}${files.length > 1 ? `hstack=${files.length},` : ""}scale=${Math.min(files.length * 360, 2880)}:-1" build/test/${name}_sheet.jpg`);
  console.log(`build/test/${name}_sheet.jpg`);
})();
