// Genera preventivo-liseo-2026-10-23.pdf da src/preventivo.html e controlla che nulla esca dalla pagina.
// Uso: node src/build-pdf.js
const path = require('path');
let chromium;
try { ({ chromium } = require('playwright')); } catch { ({ chromium } = require('/opt/node22/lib/node_modules/playwright')); }
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage();
  await p.goto('file://' + path.join(__dirname, 'preventivo.html'));
  await p.evaluate(() => document.fonts.ready);
  const issues = await p.evaluate(() => {
    const out = [];
    document.querySelectorAll('.page').forEach((pg) => {
      const pr = pg.getBoundingClientRect();
      if (pg.scrollHeight > pg.clientHeight + 1) out.push(`${pg.id}: contenuto più alto della pagina (${pg.scrollHeight} > ${pg.clientHeight})`);
      pg.querySelectorAll('*').forEach((e) => {
        const r = e.getBoundingClientRect();
        if (!r.width) return;
        if (r.bottom > pr.bottom + 0.5 || r.right > pr.right + 0.5) out.push(`${pg.id}: <${e.tagName.toLowerCase()} class="${e.className}"> esce dalla pagina`);
        if (e.scrollWidth > e.clientWidth + 1 && getComputedStyle(e).overflow !== 'visible') out.push(`${pg.id}: testo tagliato in ${e.className}`);
      });
      const foot = pg.querySelector('.foot').getBoundingClientRect();
      const kids = [...pg.children].filter((c) => !c.classList.contains('foot'));
      const last = kids[kids.length - 1].getBoundingClientRect();
      out.push(`INFO ${pg.id}: spazio libero sopra il piè di pagina ${(foot.top - last.bottom).toFixed(0)} px`);
    });
    const fams = new Set(); document.fonts.forEach((f) => { if (f.status === 'loaded') fams.add(f.family + ' ' + f.weight); });
    out.push('INFO font caricati: ' + [...fams].join(', '));
    return out;
  });
  console.log(issues.join('\n'));
  await p.pdf({ path: path.join(__dirname, '..', 'preventivo-liseo-2026-10-23.pdf'), format: 'A4', printBackground: true, preferCSSPageSize: true });
  await b.close();
})();
