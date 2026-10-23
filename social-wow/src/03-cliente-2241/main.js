// Video 3 — "22:41" (24 s). Simulazione: un cliente guarda una scheda, senza video se ne va; con un video prenota.
const DUR = 24;
const $ = (s) => document.querySelector(s);
const tl = gsap.timeline({ paused: true, defaults: { ease: 'power2.out' } });
const EI = 'power2.in';
const show = (sel, at, from = { opacity: 0, y: 14 }, d = 0.45, extra = {}) => tl.fromTo(sel, from, { opacity: 1, y: 0, duration: d, immediateRender: false, ...extra }, at);
const hideEl = (sel, at, d = 0.3, extra = {}) => tl.to(sel, { opacity: 0, duration: d, ease: EI, ...extra }, at);

// istanti chiave
const T_START = 1.4;         // parte il cronometro
const T_LEAVE = 4.8;         // scroll via (3,4 s dopo)
const T_REW = 8.0;           // riavvolgimento
const T_START2 = 10.0;       // seconda partenza
const T_SPEED = 13.6;        // accelerazione ×4 (da 3,6 s a 15 s)
const T_SPEED_END = 14.6;
const T_TAP = 16.3;          // tap su Prenota
const T_STOP2 = 16.8;        // cronometro fermo
const T_END = 18.4;          // finale

// cronometro deterministico (valore in secondi)
const ss = (a, b, x) => { const u = Math.max(0, Math.min(1, (x - a) / (b - a))); return u * u * (3 - 2 * u); };
function swValue(t) {
  if (t < T_START) return 0;
  if (t < T_LEAVE) return t - T_START;                 // 0 → 3,4
  if (t < T_REW) return 3.4;
  if (t < T_REW + 0.8) return 3.4 * (1 - ss(T_REW, T_REW + 0.8, t));
  if (t < T_START2) return 0;
  if (t < T_SPEED) return t - T_START2;                // 0 → 3,6
  if (t < T_SPEED_END) return 3.6 + (15 - 3.6) * ss(T_SPEED, T_SPEED_END, t);
  if (t < T_STOP2) return 15 + (t - T_SPEED_END);      // 15 → 17,2
  return 15 + (T_STOP2 - T_SPEED_END);
}

// --- hook 0–1.4 ---
tl.fromTo('#hour', { opacity: 0, scale: 1.06 }, { opacity: 1, scale: 1, duration: 0.6, transformOrigin: '50% 50%' }, 0.05);
tl.fromTo('#hookSub', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.55 }, 0.45);
tl.to('#hour', { opacity: 0, y: -60, scale: 0.6, duration: 0.5, ease: 'power2.inOut' }, 1.0);
tl.to('#hookSub', { opacity: 0, y: -30, duration: 0.4, ease: EI }, 1.0);
tl.fromTo('#swWrap', { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.5 }, 1.25);
tl.fromTo('#phone', { y: 90, opacity: 0, scale: 0.96 }, { y: 0, opacity: 1, scale: 1, duration: 0.8, ease: 'power3.out', transformOrigin: '50% 50%' }, 1.0);

// --- prima visita: chip di scansione ---
[['#ch1', 2.0], ['#ch2', 2.6], ['#ch3', 3.2]].forEach(([c, at]) => show(c, at, { opacity: 0, x: 10 }, 0.3, { x: 0 }));
// scroll via
tl.to('#scroll', { y: -740, duration: 0.5, ease: 'power3.inOut' }, T_LEAVE);
tl.to('#sw', { color: '#ffb36b', duration: 0.2 }, T_LEAVE + 0.1);
show('#swTag', T_LEAVE + 0.35, { opacity: 0, y: 8 }, 0.35);
// riavvolgimento
tl.to('#dimmer', { opacity: 0.75, duration: 0.5 }, T_REW - 0.4);
hideEl('#swTag', T_REW - 0.2, 0.3);
tl.to('#sw', { color: '#f2f3f5', duration: 0.4 }, T_REW);
// torna sulla scheda, ora con il video
tl.to('#scroll', { y: 0, duration: 0.6, ease: 'power2.inOut' }, 9.1);
tl.to('#dimmer', { opacity: 0, duration: 0.5 }, 9.4);
hideEl(['#ch1', '#ch2', '#ch3'], 9.0, 0.2);
tl.to('#cardA .photo .ph', { opacity: 0, duration: 0.3 }, 9.5);
tl.to('#vidA', { opacity: 1, duration: 0.4 }, 9.6);
tl.to('#cardA .txt .before', { opacity: 0, duration: 0.25 }, 9.7);
tl.to('#cardA .txt .after', { opacity: 1, duration: 0.25 }, 9.8);
tl.to('#cardA .row .dot.warn', { backgroundColor: '#8ff0c4', duration: 0.3 }, 9.8);
[['#ck3', 10.3], ['#ck2', 10.8], ['#ck1', 11.3]].forEach(([c, at]) => show(c, at, { opacity: 0, x: 10 }, 0.3, { x: 0 }));
// il video "gira": i fotogrammi scorrono
tl.fromTo('#vidA .frames', { x: 0 }, { x: -1000, duration: T_STOP2 - T_START2, ease: 'none' }, T_START2);
show('#speed', T_SPEED, { opacity: 0 }, 0.2); hideEl('#speed', T_SPEED_END + 0.3, 0.2);
// tap su Prenota
tl.to('#bPrenota', { backgroundColor: '#8fb3ff', borderColor: '#8fb3ff', duration: 0.3 }, 15.0);
tl.fromTo('#bPrenota .ring', { opacity: 0.9, scale: 0.3 }, { opacity: 0, scale: 3.6, duration: 0.6, immediateRender: false }, T_TAP);
tl.to('#bPrenota', { scale: 0.96, duration: 0.1, yoyo: true, repeat: 1 }, T_TAP - 0.05);
show('#sent', T_TAP + 0.35, { opacity: 0, y: 6 }, 0.3);
tl.to('#sw', { color: '#8fb3ff', duration: 0.2 }, T_STOP2);
tl.set('#swTagT', { textContent: 'PRENOTATO · 17,2 s' }, T_STOP2);
tl.set('#swTag span', { borderColor: '#8fb3ff', color: '#8fb3ff' }, T_STOP2);
show('#swTag', T_STOP2 + 0.15, { opacity: 0, y: 8 }, 0.35);

// --- finale ---
tl.to('#phone', { y: 70, opacity: 0, scale: 0.97, duration: 0.55, ease: 'power2.in' }, T_END);
hideEl(['#swWrap'], T_END, 0.4);
show('#end1', T_END + 0.6, { opacity: 0, y: 24 }, 0.6);
hideEl('#end1', T_END + 2.4, 0.3);
show('#end2', T_END + 2.7, { opacity: 0, y: 24 }, 0.6);
tl.fromTo('#end2 .word', { scale: 0.94 }, { scale: 1, duration: 0.6, transformOrigin: '50% 50%' }, T_END + 2.7);
tl.to('#stage > *:not(.hud)', { opacity: 0, duration: 0.4, ease: EI }, DUR - 0.45);

LX.subs($('#subs'), [
  { t0: 1.6, t1: T_LEAVE, html: 'Sta <i>decidendo</i>.' },
  { t0: T_LEAVE + 0.4, t1: T_REW - 0.2, html: 'Se n’è andato. <i>Non lo saprai mai</i>.' },
  { t0: T_REW + 0.1, t1: 9.9, html: 'Stessa sera. Stesso cliente. <i>Con un video</i>.' },
  { t0: 10.1, t1: 14.4, html: 'Guarda 15 secondi. <i>Non 3</i>.' },
  { t0: 14.8, t1: T_END - 0.1, html: 'Ha guardato. <i>Ha prenotato</i>.' },
  { t0: T_END + 2.9, t1: DUR - 0.5, html: 'Commenta <b>CONTROLLO</b>: controllo gratuito della tua scheda.' },
], tl);

const sw = $('#sw'), tc = $('#tc'), progA = $('#progA');
LX.boot(tl, DUR, (t) => {
  const v = swValue(t);
  sw.textContent = LX.fmtClock(v);
  tc.textContent = 'TC ' + LX.fmtTC(t);
  progA.style.width = (t >= T_START2 ? Math.min(100, (v / 15) * 100) : 0) + '%';
});
