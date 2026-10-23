// Render frame per frame di una pagina HTML+GSAP (timeline deterministica).
// Uso: node tools/render.js <cartella-in-src> [--fps 30] [--cover 7.5] [--only-cover] [--audit-only]
// La pagina deve esporre window.__ready (Promise), window.__seek(t), window.__DUR (secondi).
const fs = require('fs');
const path = require('path');
let chromium;
try { ({ chromium } = require('playwright')); } catch { ({ chromium } = require('/opt/node22/lib/node_modules/playwright')); }

const ROOT = path.join(__dirname, '..');
const name = process.argv[2];
if (!name) { console.error('manca il nome della cartella in src/'); process.exit(1); }
const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i > 0 ? process.argv[i + 1] : d; };
const has = (k) => process.argv.includes('--' + k);
const FPS = +arg('fps', 30);
const COVER_T = arg('cover', null);
const SAFE = { top: 150, bottom: 1920 - 380, right: 1080 - 140 };
const URL = 'file://' + path.join(ROOT, 'src', name, 'index.html') + '?record';
const FRAMES = path.join(ROOT, 'build', name);
const OUTDIR = path.join(ROOT, 'out');

(async () => {
  const browser = await chromium.launch({ args: ['--force-color-profile=srgb', '--hide-scrollbars', '--disable-gpu-vsync'] });
  const ctx = await browser.newContext({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  page.on('pageerror', (e) => { console.error('pageerror:', e.message); process.exitCode = 1; });
  page.on('console', (m) => { if (m.type() === 'error') console.error('console:', m.text()); });
  await page.goto(URL);
  await page.evaluate(() => window.__ready);
  const DUR = await page.evaluate(() => window.__DUR);
  const N = Math.round(DUR * FPS);

  // ---- audit safe zone (ogni 0.1 s, testi visibili con opacità > 0.03) ----
  const issues = await page.evaluate(({ DUR, SAFE }) => {
    const stage = document.getElementById('stage');
    const out = [];
    const opacityOf = (e) => { let o = 1; for (; e && e.nodeType === 1; e = e.parentElement) { const cs = getComputedStyle(e); o *= +cs.opacity; if (cs.visibility === 'hidden' || cs.display === 'none') return 0; } return o; };
    const walker = () => document.createTreeWalker(stage, NodeFilter.SHOW_TEXT, { acceptNode: (n) => (n.nodeValue.trim() ? 1 : 3) });
    for (let t = 0; t <= DUR + 1e-6; t += 0.1) {
      window.__seek(t);
      const w = walker();
      for (let n; (n = w.nextNode());) {
        if (opacityOf(n.parentElement) < 0.03) continue;
        const r = document.createRange(); r.selectNodeContents(n);
        let b = r.getBoundingClientRect();
        if (!b.width || !b.height) continue;
        // ritaglio per gli antenati con overflow nascosto (es. schermo del telefono) e per lo stage
        let clipped = false;
        for (let e = n.parentElement; e; e = e.parentElement) {
          const cs = getComputedStyle(e);
          if (cs.overflow !== 'visible' || e === stage) {
            const c = e.getBoundingClientRect();
            const L = Math.max(b.left, c.left), T = Math.max(b.top, c.top), Rr = Math.min(b.right, c.right), B = Math.min(b.bottom, c.bottom);
            if (Rr - L <= 1 || B - T <= 1) { clipped = true; break; }
            b = { left: L, top: T, right: Rr, bottom: B, width: Rr - L, height: B - T };
          }
          if (e === stage) break;
        }
        if (clipped) continue;
        if (b.top < SAFE.top || b.bottom > SAFE.bottom || b.right > SAFE.right)
          out.push(`t=${t.toFixed(1)}s "${n.nodeValue.trim().slice(0, 40)}" x=${b.left.toFixed(0)}..${b.right.toFixed(0)} y=${b.top.toFixed(0)}..${b.bottom.toFixed(0)}`);
      }
    }
    return out;
  }, { DUR, SAFE });
  if (issues.length) {
    console.error('SAFE ZONE VIOLATA:\n  ' + [...new Set(issues)].slice(0, 40).join('\n  '));
    await browser.close();
    process.exit(2);
  }
  console.log(`[${name}] audit safe zone OK · durata ${DUR}s · ${N} frame @ ${FPS}fps`);
  if (has('audit-only')) { await browser.close(); return; }

  const settle = () => page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));

  // ---- copertina ----
  if (COVER_T !== null) {
    fs.mkdirSync(OUTDIR, { recursive: true });
    await page.evaluate(() => document.body.classList.add('cover'));
    await page.evaluate((t) => window.__seek(t), +COVER_T);
    await settle();
    await page.screenshot({ path: path.join(OUTDIR, `${name}-cover.jpg`), type: 'jpeg', quality: 93 });
    await page.evaluate(() => document.body.classList.remove('cover'));
    console.log(`[${name}] copertina → out/${name}-cover.jpg (t=${COVER_T})`);
    if (has('only-cover')) { await browser.close(); return; }
  }

  // ---- frame ----
  fs.rmSync(FRAMES, { recursive: true, force: true });
  fs.mkdirSync(FRAMES, { recursive: true });
  const t0 = Date.now();
  for (let i = 0; i < N; i++) {
    await page.evaluate((t) => window.__seek(t), i / FPS);
    await settle();
    await page.screenshot({ path: path.join(FRAMES, `f${String(i).padStart(5, '0')}.png`), type: 'png' });
    if (i % 60 === 0) process.stdout.write(`\r[${name}] frame ${i}/${N} (${((Date.now() - t0) / 1000).toFixed(0)}s)`);
  }
  console.log(`\n[${name}] ${N} frame in ${((Date.now() - t0) / 1000).toFixed(0)}s`);
  await browser.close();
})().catch((e) => { console.error(e); process.exit(1); });
