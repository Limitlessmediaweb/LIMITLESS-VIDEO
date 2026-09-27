// Verifica il video finale:
//  - estrae un frame al secondo (a metà di ogni secondo) dal file .mp4
//  - misura la luminanza (ffmpeg signalstats): un frame senza nulla di chiaro = "vuoto"
//  - compone un contact sheet etichettato con le safe zone TikTok sovrapposte
// Uso: node tools/verify.js
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
let chromium;
try { ({ chromium } = require('playwright')); } catch { ({ chromium } = require('/opt/node22/lib/node_modules/playwright')); }

const ROOT = path.join(__dirname, '..');
const VIDEO = path.join(ROOT, 'out', 'limitless-analisi.mp4');
const DIR = path.join(ROOT, 'build', 'sheet');
fs.rmSync(DIR, { recursive: true, force: true });
fs.mkdirSync(DIR, { recursive: true });

// ffmpeg -i senza output esce con errore ma stampa la durata su stderr
const dur = (() => {
  try { execFileSync('ffmpeg', ['-hide_banner', '-i', VIDEO], { stdio: 'pipe' }); } catch (e) {
    const m = String(e.stderr).match(/Duration: (\d+):(\d+):([\d.]+)/);
    return +m[1] * 3600 + +m[2] * 60 + +m[3];
  }
})();

const rows = [];
for (let s = 0; s < Math.floor(dur); s++) {
  const t = s + 0.5;
  const file = path.join(DIR, `s${String(s).padStart(2, '0')}.png`);
  execFileSync('ffmpeg', ['-v', 'error', '-y', '-ss', String(t), '-i', VIDEO, '-frames:v', '1', file]);
  const stats = execFileSync('ffmpeg', ['-v', 'error', '-i', file, '-vf', 'signalstats,metadata=print:file=-', '-f', 'null', '-'], { encoding: 'utf8' });
  const g = (k) => +(stats.match(new RegExp('signalstats\\.' + k + '=([\\d.]+)')) || [])[1];
  const ymax = g('YMAX'), yavg = g('YAVG');
  const empty = !(ymax > 120); // nessun testo/linea chiara nel frame
  rows.push({ t, file, ymax, yavg, empty });
}
const bad = rows.filter((r) => r.empty);
rows.forEach((r) => console.log(`t=${r.t.toFixed(1)}s  YMAX=${r.ymax}  YAVG=${r.yavg.toFixed(1)}${r.empty ? '  ← VUOTO' : ''}`));

(async () => {
  const cols = 5, W = 324, H = 576;
  const cells = rows.map((r) => `
    <figure class="${r.empty ? 'bad' : ''}">
      <div class="img"><img src="file://${r.file}"><i class="st"></i><i class="sb"></i><i class="sr"></i></div>
      <figcaption><b>${r.t.toFixed(1)}s</b><span>${r.empty ? 'VUOTO' : 'ok · Ymax ' + r.ymax}</span></figcaption>
    </figure>`).join('');
  const html = `<!doctype html><meta charset="utf-8"><style>
    body{margin:0;background:#16181c;font:14px ui-monospace,monospace;color:#c9ccd2;padding:24px}
    h1{font:600 18px system-ui;margin:0 0 4px;color:#fff} p{margin:0 0 20px;color:#8a8f98}
    .grid{display:grid;grid-template-columns:repeat(${cols},${W}px);gap:16px}
    figure{margin:0} .img{position:relative;width:${W}px;height:${H}px;outline:1px solid #2a2d33}
    img{width:100%;height:100%;display:block}
    .img i{position:absolute;background:rgba(255,60,60,.14);border:0 dashed rgba(255,80,80,.55)}
    .st{left:0;right:0;top:0;height:${(150 / 1920) * 100}%;border-bottom-width:1px!important}
    .sb{left:0;right:0;bottom:0;height:${(380 / 1920) * 100}%;border-top-width:1px!important}
    .sr{top:0;bottom:0;right:0;width:${(140 / 1080) * 100}%;border-left-width:1px!important}
    figcaption{display:flex;justify-content:space-between;padding:6px 2px} b{color:#fff}
    .bad .img{outline:2px solid #ff4d4d} .bad span{color:#ff6b6b}
  </style><h1>LIMITLESS — contact sheet (1 frame/s, a metà di ogni secondo)</h1>
  <p>${path.basename(VIDEO)} · zone rosse = safe zone TikTok (top 150px, bottom 380px, destra 140px) · frame vuoti: ${bad.length}</p>
  <div class="grid">${cells}</div>`;
  const htmlFile = path.join(DIR, 'sheet.html');
  fs.writeFileSync(htmlFile, html);
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 48 + cols * W + (cols - 1) * 16, height: 400 } });
  await page.goto('file://' + htmlFile);
  await page.waitForLoadState('load');
  await page.screenshot({ path: path.join(ROOT, 'out', 'contact-sheet.jpg'), type: 'jpeg', quality: 90, fullPage: true });
  await browser.close();
  console.log(`→ out/contact-sheet.jpg (${rows.length} frame, vuoti: ${bad.length})`);
  if (bad.length) process.exitCode = 3;
})();
