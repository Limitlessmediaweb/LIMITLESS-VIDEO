// Video 2 — "Prima di filmarla, la leggiamo" (18 s). Bottiglia come nuvola di punti (canvas) + HUD DOM/SVG.
const DUR = 18;
const $ = (s) => document.querySelector(s);
const cv = $('#cv'), ctx = cv.getContext('2d');
const CX = 540, BOT = 1320, H = 800, TILT = 0.14, N = 3600;
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const sstep = (a, b, x) => { const u = clamp((x - a) / (b - a)); return u * u * (3 - 2 * u); };
const easeInOut = (u) => (u < 0.5 ? 2 * u * u : 1 - Math.pow(-2 * u + 2, 2) / 2);

// Profilo di rivoluzione: raggio (px) in funzione dell'altezza normalizzata h (0 fondo, 1 bocca)
function R(h) {
  if (h < 0.03) return 150 * Math.sqrt(clamp(h / 0.03));
  if (h < 0.60) return 150;
  if (h < 0.74) { const u = (h - 0.60) / 0.14; return 48 + (150 - 48) * (0.5 + 0.5 * Math.cos(Math.PI * u)); }
  if (h < 0.97) return 48 - 4 * ((h - 0.74) / 0.23);
  return 52;
}
const Y = (h) => BOT - h * H;

// PRNG deterministico
let seed = 20261023; const rnd = () => { seed |= 0; seed = (seed + 0x6D2B79F5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
// campionamento pesato sull'area (r(h)) con rigetto
const pts = [];
while (pts.length < N) { const h = rnd(); if (rnd() * 150 > R(h)) continue; pts.push({ h, th: rnd() * Math.PI * 2, j: rnd() }); }
pts.sort((a, b) => b.h - a.h); // dall'alto: così il contatore cresce con la scansione

// ---- parametri in funzione del tempo ----
const P = (t) => {
  const scanH = 1 - sstep(0.4, 4.2, t);                      // linea di scansione: 1 → 0
  const rotSpin = 0.35 * Math.min(t, 10);                     // rotazione lenta
  const rot = rotSpin * (1 - sstep(8.6, 10.2, t)) + 0.0;      // si ferma a 0 (etichetta frontale)
  const solid = sstep(8.6, 10.4, t);                          // materializzazione
  const ptsA = 1 - sstep(8.8, 10.6, t);                       // punti che svaniscono
  const rings = sstep(4.4, 5.6, t);
  const label = sstep(12.0, 12.9, t);
  const dim = 1 - 0.6 * sstep(15.3, 16.2, t);                 // il finale abbassa la bottiglia
  const fade = 1 - sstep(17.45, 17.95, t);
  return { scanH, rot, solid, ptsA, rings, label, dim, fade };
};

function proj(h, th, rot) {
  const r = R(h), a = th + rot, z = Math.sin(a) * r, p = 1 + z / 2400;
  return { x: CX + Math.cos(a) * r * p, y: Y(h) + z * TILT, z, r };
}

let fontsOK = false;
function draw(t) {
  const q = P(t);
  ctx.clearRect(0, 0, 1080, 1920);
  ctx.save(); ctx.globalAlpha = q.fade * q.dim;

  // --- corpo solido ---
  if (q.solid > 0) {
    ctx.save(); ctx.globalAlpha *= q.solid;
    const path = new Path2D();
    const steps = 160;
    for (let i = 0; i <= steps; i++) { const h = i / steps; const x = CX - R(h), y = Y(h); i ? path.lineTo(x, y) : path.moveTo(x, y); }
    for (let i = steps; i >= 0; i--) { const h = i / steps; path.lineTo(CX + R(h), Y(h)); }
    path.closePath();
    const g = ctx.createLinearGradient(CX - 150, 0, CX + 150, 0);
    g.addColorStop(0, '#111a13'); g.addColorStop(0.28, '#223525'); g.addColorStop(0.42, '#2f4a33'); g.addColorStop(0.62, '#1a2a1d'); g.addColorStop(0.92, '#0e150f'); g.addColorStop(1, '#253a29');
    const sg0 = ctx.createRadialGradient(CX, BOT + 8, 10, CX, BOT + 8, 230); sg0.addColorStop(0, 'rgba(0,0,0,.6)'); sg0.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.save(); ctx.translate(CX, BOT + 6); ctx.scale(1, 0.16); const sg1 = ctx.createRadialGradient(0, 0, 10, 0, 0, 230); sg1.addColorStop(0, 'rgba(0,0,0,.7)'); sg1.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = sg1; ctx.fillRect(-240, -240, 480, 480); ctx.restore();
    ctx.fillStyle = g; ctx.fill(path);
    // vino (visto attraverso il vetro)
    ctx.save(); ctx.clip(path);
    const wg = ctx.createLinearGradient(CX - 150, 0, CX + 150, 0);
    wg.addColorStop(0, 'rgba(60,10,26,.35)'); wg.addColorStop(0.35, 'rgba(120,24,48,.42)'); wg.addColorStop(0.7, 'rgba(90,16,36,.38)'); wg.addColorStop(1, 'rgba(40,8,20,.4)');
    ctx.fillStyle = wg; ctx.fillRect(CX - 160, Y(0.71), 320, Y(0) - Y(0.71) + 10);
    // menisco
    ctx.strokeStyle = 'rgba(200,120,140,.35)'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.ellipse(CX, Y(0.71), R(0.71) - 2, (R(0.71) - 2) * TILT, 0, 0, Math.PI * 2); ctx.stroke();
    // ombreggiatura dei bordi (cilindro)
    const sh = ctx.createLinearGradient(CX - 150, 0, CX + 150, 0);
    sh.addColorStop(0, 'rgba(0,0,0,.55)'); sh.addColorStop(0.18, 'rgba(0,0,0,0)'); sh.addColorStop(0.75, 'rgba(0,0,0,0)'); sh.addColorStop(0.95, 'rgba(0,0,0,.5)'); sh.addColorStop(1, 'rgba(0,0,0,.2)');
    ctx.fillStyle = sh; ctx.fillRect(CX - 160, Y(1.01), 320, Y(0) - Y(1.01) + 10);
    // riflesso principale (luce da sinistra)
    const hl = ctx.createLinearGradient(CX - 118, 0, CX - 66, 0);
    hl.addColorStop(0, 'rgba(242,243,245,0)'); hl.addColorStop(0.45, 'rgba(242,243,245,.34)'); hl.addColorStop(1, 'rgba(242,243,245,0)');
    ctx.fillStyle = hl; ctx.fillRect(CX - 118, Y(0.985), 52, Y(0.02) - Y(0.985));
    // riflesso sottile sul collo e luce di bordo a destra
    const rim = ctx.createLinearGradient(CX + 118, 0, CX + 150, 0);
    rim.addColorStop(0, 'rgba(143,179,255,0)'); rim.addColorStop(1, 'rgba(143,179,255,.42)');
    ctx.fillStyle = rim; ctx.fillRect(CX + 118, Y(0.62), 32, Y(0.03) - Y(0.62));
    const rimN = ctx.createLinearGradient(CX + 30, 0, CX + 48, 0);
    rimN.addColorStop(0, 'rgba(143,179,255,0)'); rimN.addColorStop(1, 'rgba(143,179,255,.4)');
    ctx.fillStyle = rimN; ctx.fillRect(CX + 30, Y(0.97), 18, Y(0.74) - Y(0.97));
    // ellisse della bocca
    ctx.strokeStyle = 'rgba(242,243,245,.5)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(CX, Y(1), 52, 52 * TILT, 0, 0, Math.PI * 2); ctx.stroke();
    ctx.restore();
    // contorno sottile
    ctx.strokeStyle = 'rgba(242,243,245,.18)'; ctx.lineWidth = 1.5; ctx.stroke(path);
    ctx.restore();
    // etichetta
    if (q.label > 0) {
      ctx.save(); ctx.globalAlpha *= q.label;
      const lx = 450, ly = 936, lw = 180, lh = 224, s = 0.92 + 0.08 * q.label;
      ctx.translate(lx + lw / 2, ly + lh / 2); ctx.scale(s, s); ctx.translate(-(lx + lw / 2), -(ly + lh / 2));
      const lg = ctx.createLinearGradient(lx, 0, lx + lw, 0); lg.addColorStop(0, '#d9d0bc'); lg.addColorStop(0.3, '#efe6d2'); lg.addColorStop(1, '#c9bfa9');
      ctx.fillStyle = lg; ctx.beginPath(); ctx.roundRect(lx, ly, lw, lh, 4); ctx.fill();
      ctx.strokeStyle = 'rgba(40,30,20,.35)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.roundRect(lx + 10, ly + 10, lw - 20, lh - 20, 2); ctx.stroke();
      ctx.fillStyle = '#2b2118'; ctx.textAlign = 'center';
      ctx.font = '400 15px "JetBrains Mono"'; ctx.fillText('CANTINA', CX, ly + 58);
      ctx.font = '400 34px "Instrument Serif"'; ctx.fillText('Roccabruna', CX, ly + 108);
      ctx.fillRect(CX - 30, ly + 128, 60, 1);
      ctx.font = '400 13px "JetBrains Mono"'; ctx.fillText('ROSSO · OLTREPÒ', CX, ly + 160);
      ctx.font = '400 12px "JetBrains Mono"'; ctx.fillStyle = 'rgba(43,33,24,.6)'; ctx.fillText('750 ml · 13,5% vol', CX, ly + 196);
      ctx.restore();
    }
  }

  // --- anelli (paralleli) ---
  if (q.rings > 0 && q.ptsA > 0) {
    ctx.save(); ctx.globalAlpha *= q.ptsA * 0.9; ctx.strokeStyle = 'rgba(143,179,255,.55)'; ctx.lineWidth = 1.2;
    [0.03, 0.3, 0.6, 0.74, 0.97].forEach((h, i) => {
      const u = clamp(q.rings * 1.6 - i * 0.15); if (u <= 0) return;
      ctx.beginPath(); ctx.ellipse(CX, Y(h), R(h), R(h) * TILT, 0, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * u); ctx.stroke();
    });
    ctx.restore();
  }

  // --- nuvola di punti ---
  let visible = 0;
  if (q.ptsA > 0) {
    ctx.save(); ctx.globalAlpha *= q.ptsA;
    for (const p of pts) {
      if (p.h < q.scanH) break;
      visible++;
      const o = proj(p.h, p.th, q.rot);
      const d = (o.z / 150 + 1) / 2;                       // 0 dietro, 1 davanti
      const near = Math.exp(-Math.pow((p.h - q.scanH) / 0.025, 2));
      const a = 0.22 + 0.68 * d;
      const sz = 1.6 + 1.6 * d + 1.4 * near;
      if (near > 0.08) { ctx.fillStyle = `rgba(190,212,255,${clamp(a + near)})`; }
      else ctx.fillStyle = `rgba(242,243,245,${a})`;
      ctx.beginPath(); ctx.arc(o.x, o.y, sz, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
    // linea di scansione
    if (q.scanH > 0 && q.scanH < 1) {
      const y = Y(q.scanH), r = R(q.scanH) + 40;
      ctx.save(); ctx.globalAlpha *= q.ptsA;
      const sg = ctx.createLinearGradient(CX - r - 90, 0, CX + r + 90, 0);
      sg.addColorStop(0, 'rgba(143,179,255,0)'); sg.addColorStop(0.5, 'rgba(143,179,255,.9)'); sg.addColorStop(1, 'rgba(143,179,255,0)');
      ctx.strokeStyle = sg; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(CX - r - 90, y); ctx.lineTo(CX + r + 90, y); ctx.stroke();
      ctx.fillStyle = 'rgba(143,179,255,.08)'; ctx.fillRect(CX - 230, y - 14, 460, 28);
      ctx.restore();
    }
  } else visible = N;
  ctx.restore();
  return { visible, rot: q.rot, scanH: q.scanH };
}

// ---- timeline DOM ----
const tl = gsap.timeline({ paused: true, defaults: { ease: 'power2.out' } });
const EI = 'power2.in';
const dash = (sel, at, dur = 0.5) => { document.querySelectorAll(sel).forEach((el) => { const L = el.getTotalLength(); el.style.strokeDasharray = L; el.style.strokeDashoffset = L; tl.to(el, { strokeDashoffset: 0, duration: dur, ease: 'power2.inOut' }, at); }); };
const show = (sel, at, from = { opacity: 0, y: 14 }, d = 0.45) => tl.fromTo(sel, from, { opacity: 1, y: 0, duration: d, immediateRender: false }, at);
const hideEl = (sel, at, d = 0.3) => tl.to(sel, { opacity: 0, duration: d, ease: EI }, at);

tl.fromTo('#title', { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.7 }, 0.05);
show('#readout', 0.5, { opacity: 0 });

// misure (4.6 → 8.4)
const dims = [['#dimH', '#l1', '#c1', 4.7], ['#dimD', '#l2', '#c2', 5.3], ['#dimN', '#l3', '#c3', 5.9], ['#dimL', '#l4', '#c4', 6.5]];
dims.forEach(([g, l, c, at]) => { tl.to(g, { opacity: 1, duration: 0.3 }, at); dash(g + ' line, ' + g + ' rect', at, 0.6); tl.to(l, { opacity: 1, duration: 0.2 }, at + 0.3); dash(l, at + 0.3, 0.3); show(c, at + 0.45); });
hideEl(['#dimH', '#dimD', '#dimN', '#dimL', '#l1', '#l2', '#l3', '#l4', '#c1', '#c2', '#c3', '#c4'], 8.4, 0.35);
// materia e luce (9.4 → 12)
[['#l5', '#c5', 9.4], ['#l6', '#c6', 10.0], ['#l7', '#c7', 10.6]].forEach(([l, c, at]) => { tl.to(l, { opacity: 1, duration: 0.2 }, at); dash(l, at, 0.3); show(c, at + 0.2); });
tl.to('#lightArrow', { opacity: 1, duration: 0.3 }, 10.2); dash('#lightArrow path', 10.2, 0.5);
hideEl(['#l5', '#l6', '#l7', '#c5', '#c6', '#c7', '#lightArrow'], 11.7, 0.35);
// etichetta (12 → 15.3)
show('#c8', 13.0);
hideEl(['#c8', '#readout', '#title'], 15.3, 0.4);
// finale
show('#end1', 15.7, { opacity: 0, y: 24 }, 0.6);
hideEl('#end1', 16.9, 0.3);
show('#end2', 17.1, { opacity: 0, y: 24 }, 0.5);
tl.to('#stage > *:not(.hud):not(#cv)', { opacity: 0, duration: 0.4, ease: EI }, DUR - 0.45);

LX.subs($('#subs'), [
  { t0: 0.5, t1: 4.3, html: 'Ogni prodotto ha <i>una forma</i>. Prima la misuriamo.' },
  { t0: 4.5, t1: 8.4, html: 'Misure, proporzioni, <i>dove cade la luce</i>.' },
  { t0: 8.8, t1: 11.9, html: 'Materia. Luce. <i>Un solo angolo giusto</i>.' },
  { t0: 12.2, t1: 15.2, html: 'Poi, e solo poi, <i>si filma</i>.' },
  { t0: 15.8, t1: DUR - 0.5, html: '<b>Condividilo</b> con chi lo produce.' },
], tl);

const rPts = $('#rPts'), rRot = $('#rRot'), rH = $('#rH'), tc = $('#tc');
LX.boot(tl, DUR, (t) => {
  const s = draw(t);
  rPts.textContent = 'PUNTI ' + LX.fmtInt(s.visible);
  rRot.textContent = 'ROT ' + String(Math.round(((s.rot * 180) / Math.PI) % 360)).padStart(3, '0') + '°';
  rH.textContent = 'H ' + Math.round(s.scanH * 300) + ' mm';
  tc.textContent = 'TC ' + LX.fmtTC(t);
});
