// Registra src/index.html con Chrome DevTools Protocol (Page.startScreencast).
//
// 1. Audit safe zone: scorre la timeline ogni 0.1s e verifica che nessun testo
//    visibile cada nelle zone vietate TikTok (misurato dopo lo zoom camera).
// 2. Cattura: la timeline GSAP gira a velocità ridotta (--ts, default 0.1) così
//    lo screencast (PNG 1080x1920, viewport 540x960 @2x) produce molti più frame
//    per secondo di video; ogni frame viene rimappato sul tempo della timeline
//    tramite il suo timestamp CDP.
// 3. Scrive build/frames.ffconcat con la durata esatta di ogni frame: ffmpeg
//    (tools/encode.sh) ricostruisce poi un video a frame rate costante.
//
// Uso: node tools/record.js [--ts 0.1]
const fs = require('fs');
const path = require('path');
let chromium;
try { ({ chromium } = require('playwright')); } catch { ({ chromium } = require('/opt/node22/lib/node_modules/playwright')); }

const ROOT = path.join(__dirname, '..');
const BUILD = path.join(ROOT, 'build');
const FRAMES = path.join(BUILD, 'frames');
const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i > 0 ? process.argv[i + 1] : d; };
const TS = +arg('ts', 0.1);
const URL = 'file://' + path.join(ROOT, 'src', 'index.html') + '?record';
const SAFE = { top: 150, bottom: 1920 - 380, right: 1080 - 140 };

(async () => {
  const browser = await chromium.launch({ args: ['--force-color-profile=srgb', '--hide-scrollbars', '--force-device-scale-factor=2'] });
  const ctx = await browser.newContext({ viewport: { width: 540, height: 960 }, deviceScaleFactor: 2 });
  const page = await ctx.newPage();
  page.on('pageerror', (e) => { console.error('pageerror:', e.message); process.exitCode = 1; });

  // ---------- 1. audit safe zone ----------
  await page.goto(URL);
  await page.evaluate(() => window.__ready);
  const DUR = await page.evaluate(() => window.__tl.duration());
  const issues = await page.evaluate(({ DUR, SAFE }) => {
    const stage = document.getElementById('stage');
    const out = [];
    const opacityOf = (e) => { let o = 1; for (; e && e.nodeType === 1; e = e.parentElement) o *= +getComputedStyle(e).opacity; return o; };
    const walker = () => document.createTreeWalker(stage, NodeFilter.SHOW_TEXT, { acceptNode: (n) => (n.nodeValue.trim() ? 1 : 3) });
    for (let t = 0; t <= DUR + 1e-6; t += 0.1) {
      window.__seek(t);
      const sr = stage.getBoundingClientRect();
      const k = 1080 / sr.width;
      const w = walker();
      for (let n; (n = w.nextNode());) {
        if (opacityOf(n.parentElement) < 0.03) continue;
        const r = document.createRange(); r.selectNodeContents(n);
        const b = r.getBoundingClientRect();
        if (!b.width) continue;
        const x2 = (b.right - sr.left) * k, y1 = (b.top - sr.top) * k, y2 = (b.bottom - sr.top) * k;
        if (y1 < SAFE.top || y2 > SAFE.bottom || x2 > SAFE.right)
          out.push(`t=${t.toFixed(1)}s "${n.nodeValue.trim()}" x2=${x2.toFixed(0)} y=${y1.toFixed(0)}..${y2.toFixed(0)}`);
      }
    }
    return out;
  }, { DUR, SAFE });
  if (issues.length) {
    console.error('SAFE ZONE VIOLATA:\n  ' + [...new Set(issues)].slice(0, 30).join('\n  '));
    process.exit(2);
  }
  console.log(`audit safe zone OK (durata ${DUR}s, controllo ogni 0.1s)`);

  // ---------- 2. cattura ----------
  fs.rmSync(FRAMES, { recursive: true, force: true });
  fs.mkdirSync(FRAMES, { recursive: true });
  await page.goto(URL);
  await page.evaluate(() => window.__ready);
  await page.evaluate(() => window.__seek(0));

  const cdp = await ctx.newCDPSession(page);
  const frames = [];
  let writes = [];
  cdp.on('Page.screencastFrame', (f) => {
    cdp.send('Page.screencastFrameAck', { sessionId: f.sessionId }).catch(() => {});
    const i = frames.length;
    const file = path.join(FRAMES, `f${String(i).padStart(5, '0')}.png`);
    frames.push({ file, wall: f.metadata.timestamp * 1000 });
    writes.push(fs.promises.writeFile(file, Buffer.from(f.data, 'base64')));
  });
  await cdp.send('Page.startScreencast', { format: 'png', maxWidth: 1080, maxHeight: 1920, everyNthFrame: 1 });
  await page.waitForTimeout(800); // almeno un frame dello stato iniziale (t=0)
  const t0 = await page.evaluate((ts) => window.__play(ts), TS);
  const realDur = (DUR / TS) * 1000;
  process.stdout.write(`cattura a timeScale ${TS}: ${(realDur / 1000).toFixed(0)}s reali`);
  await page.waitForTimeout(realDur + 600);
  await cdp.send('Page.stopScreencast');
  await Promise.all(writes);
  await browser.close();

  // ---------- 3. mappa sul tempo della timeline ----------
  const mapped = frames.map((f) => ({ ...f, t: ((f.wall - t0) / 1000) * TS }));
  const pre = mapped.filter((f) => f.t <= 0).pop();
  const seq = [{ ...pre, t: 0 }];
  // scarta frame con timestamp (quasi) identico al precedente: durata 0 = DTS fuori ordine
  for (const f of mapped) if (f.t > 0 && f.t < DUR && f.t - seq[seq.length - 1].t > 0.001) seq.push(f);
  const gaps = seq.slice(1).map((f, i) => f.t - seq[i].t);
  let list = 'ffconcat version 1.0\n';
  seq.forEach((f, i) => {
    const d = (i < seq.length - 1 ? seq[i + 1].t : DUR) - f.t;
    list += `file '${path.relative(BUILD, f.file)}'\nduration ${d.toFixed(6)}\n`;
  });
  list += `file '${path.relative(BUILD, seq[seq.length - 1].file)}'\n`; // ultimo frame ripetuto (quirk concat)
  fs.writeFileSync(path.join(BUILD, 'frames.ffconcat'), list);
  const fpsEff = seq.length / DUR;
  console.log(`\n${frames.length} frame catturati, ${seq.length} usati → ${fpsEff.toFixed(1)} fps effettivi sulla timeline, gap max ${(Math.max(...gaps) * 1000).toFixed(1)}ms`);
  if (fpsEff < 30) console.warn('ATTENZIONE: meno di 30 fps effettivi, abbassa --ts');
})();
