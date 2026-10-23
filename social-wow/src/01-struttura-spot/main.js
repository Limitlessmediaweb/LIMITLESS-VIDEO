// Video 1 — "Uno spot che vende, in tempo reale" (20 s). Timeline GSAP deterministica.
const DUR = 20, T0 = 1.2, SPOT = 15;             // lo spot "gira" da t=1.2 a t=16.2
const $ = (s) => document.querySelector(s);
const tl = gsap.timeline({ paused: true, defaults: { ease: 'power2.out' } });
const EASE_IN = 'power2.in';

// --- ticks del righello (0..15 s su 900 px → 60 px/s) ---
const ticks = $('#ticks');
for (let s = 0; s <= 15; s++) { const i = document.createElement('i'); i.style.left = s * 56 + 'px'; i.style.height = s % 5 ? '6px' : '12px'; ticks.appendChild(i);
  if (s % 5 === 0) { const b = document.createElement('b'); b.style.left = s * 56 + 'px'; b.textContent = s + ' s'; if (s === 15) b.style.transform = 'translateX(-100%)'; ticks.appendChild(b); } }
['#sg1', '#sg2', '#sg3', '#sg4'].forEach((id) => { const f = document.createElement('div'); f.className = 'fill'; $(id).appendChild(f); });

// --- 0–1.2 s: hook (titolo grande) ---
tl.fromTo('#titleBig', { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.7 }, 0.05);
tl.to('#titleBig', { opacity: 0, scale: 0.92, duration: 0.4, ease: EASE_IN, transformOrigin: '50% 50%' }, 0.85);
tl.fromTo('#clockWrap', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5 }, 1.0);
tl.fromTo('#panel', { opacity: 0, y: 30, scale: 0.98 }, { opacity: 1, y: 0, scale: 1, duration: 0.6 }, 1.0);
tl.fromTo('#ruler', { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.5 }, 1.1);
tl.fromTo('#callout', { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.4 }, T0);

// --- blocchi dello spot: [inizio, fine] in secondi di spot ---
const BLOCKS = [
  { id: '#bHook', seg: '#sg1', s0: 0, s1: 2, k: '01 · HOOK · 0–2 s', v: 'Una frase, non il logo.' },
  { id: '#bProva', seg: '#sg2', s0: 2, s1: 6, k: '02 · PROVA · 2–6 s', v: 'Il posto, non le promesse.' },
  { id: '#bOfferta', seg: '#sg3', s0: 6, s1: 10, k: '03 · OFFERTA · 6–10 s', v: 'Un numero chiaro.' },
  { id: '#bCta', seg: '#sg4', s0: 10, s1: 15, k: '04 · CTA · 10–15 s', v: 'Una sola azione.' },
];
BLOCKS.forEach((b, i) => {
  const at = T0 + b.s0, end = T0 + b.s1;
  tl.fromTo(b.id, { opacity: 0 }, { opacity: 1, duration: 0.3 }, at);
  if (i < BLOCKS.length - 1) tl.to(b.id, { opacity: 0, duration: 0.25, ease: EASE_IN }, end - 0.25);
  tl.fromTo(b.seg + ' .fill', { width: '0%' }, { width: '100%', duration: b.s1 - b.s0, ease: 'none' }, at);
  tl.to(b.seg + ' span', { color: '#f2f3f5', duration: 0.2 }, at);
  if (i > 0) {
    tl.to('#callout .row', { opacity: 0, y: -8, duration: 0.18, ease: EASE_IN }, at - 0.18);
    tl.fromTo('#callout .row', { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.28, immediateRender: false }, at);
  }
});

// Hook: "Domenica." poi "Pranzo in cascina."
tl.fromTo('#bHook .w1', { opacity: 0, y: 30, scale: 0.96 }, { opacity: 1, y: 0, scale: 1, duration: 0.6 }, T0 + 0.05);
tl.fromTo('#bHook .glow', { opacity: 0 }, { opacity: 1, duration: 1.2 }, T0);
tl.fromTo('#bHook .w2', { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.5 }, T0 + 0.8);
// Prova: 3 inquadrature, una ogni 1.2 s, con disegno delle linee
['.s1', '.s2', '.s3'].forEach((c, i) => {
  const at = T0 + 2 + 0.15 + i * 1.2;
  tl.fromTo('#bProva ' + c, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.45 }, at);
  $('#bProva ' + c + ' svg').querySelectorAll('path,circle,ellipse').forEach((p) => {
    const L = p.getTotalLength(); p.style.strokeDasharray = L; p.style.strokeDashoffset = L;
    tl.to(p, { strokeDashoffset: 0, duration: 0.7, ease: 'power2.inOut' }, at + 0.1);
  });
});
tl.fromTo('#bProva .pnote', { opacity: 0 }, { opacity: 1, duration: 0.4 }, T0 + 5.0);
// Offerta: prezzo che conta
const price = { v: 0 };
tl.fromTo('#bOfferta .olab', { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.4 }, T0 + 6.05);
tl.to(price, { v: 32, duration: 1.1, ease: 'power3.out', onUpdate: () => { $('#priceNum').textContent = Math.round(price.v); } }, T0 + 6.2);
tl.fromTo('#bOfferta .price', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5 }, T0 + 6.1);
tl.fromTo('#bOfferta .odesc', { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.45 }, T0 + 7.2);
// CTA: bottone, tap, conferma, wordmark
tl.fromTo('#bCta .btn', { opacity: 0, y: 24, scale: 0.96 }, { opacity: 1, y: 0, scale: 1, duration: 0.5 }, T0 + 10.1);
tl.fromTo('#bCta .btn .ring', { opacity: 0.9, scale: 0.3 }, { opacity: 0, scale: 3.2, duration: 0.7, ease: 'power2.out' }, T0 + 11.6);
tl.to('#bCta .btn', { scale: 0.97, duration: 0.12, yoyo: true, repeat: 1, ease: 'power1.inOut' }, T0 + 11.55);
tl.fromTo('#bCta .done', { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.4 }, T0 + 12.1);
tl.fromTo('#bCta .wm', { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.6 }, T0 + 13.2);

// --- fine spot: tutto scompare, finale ---
const E = T0 + SPOT; // 16.2
tl.to(['#panel', '#ruler', '#callout', '#titleSmall'], { opacity: 0, y: -16, duration: 0.5, ease: EASE_IN }, E + 0.1);
tl.to('#clockWrap', { y: -40, duration: 0.7, ease: 'power2.inOut' }, E + 0.1);
tl.to('#clock', { color: '#8fb3ff', duration: 0.4 }, E);
tl.fromTo('#end1', { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.6 }, E + 0.6);
tl.to('#end1', { opacity: 0, y: -16, duration: 0.35, ease: EASE_IN }, E + 2.3);
tl.fromTo('#end2', { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.6 }, E + 2.6);
tl.fromTo('#endL', { opacity: 0 }, { opacity: 1, duration: 0.5 }, E + 3.0);
tl.to('#stage > *:not(.hud)', { opacity: 0, duration: 0.4, ease: EASE_IN }, DUR - 0.45);

// --- sottotitoli ---
LX.subs($('#subs'), [
  { t0: 0.35, t1: 1.1, html: 'Cronometro alla mano.' },
  { t0: T0 + 0.1, t1: T0 + 2.0, html: 'Primi 2 secondi: <i>una frase</i>, non il logo.' },
  { t0: T0 + 2.1, t1: T0 + 6.0, html: 'Poi la prova: il posto, <i>non le promesse</i>.' },
  { t0: T0 + 6.1, t1: T0 + 10.0, html: 'L’offerta: un numero <i>chiaro</i>.' },
  { t0: T0 + 10.1, t1: T0 + 15.0, html: 'Una sola <i>azione</i> da fare.' },
  { t0: E + 0.7, t1: DUR - 0.5, html: 'Vale per ogni spot. <b>Salvalo.</b>' },
], tl);

// --- testi calcolati dal tempo (deterministici) ---
const clock = $('#clock'), tc = $('#tc'), pframe = $('#pframe'), head = $('#head'), cK = $('#cK'), cV = $('#cV');
LX.boot(tl, DUR, (t) => {
  const s = Math.max(0, Math.min(SPOT, t - T0));
  clock.textContent = LX.fmtClock(s);
  tc.textContent = 'TC ' + LX.fmtTC(t);
  pframe.textContent = 'F ' + String(Math.round(s * 30)).padStart(3, '0');
  head.style.left = (s * 56) + 'px';
  const b = BLOCKS.find((b) => s < b.s1) || BLOCKS[BLOCKS.length - 1];
  cK.textContent = b.k; cV.textContent = b.v;
});
