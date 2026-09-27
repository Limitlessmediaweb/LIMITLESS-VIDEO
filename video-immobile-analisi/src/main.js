/* Villa Chiara — "analisi" animata di un immobile.
 * Costruisce il DOM da window.CONTENT e crea un'unica timeline GSAP (paused)
 * che il recorder controlla. Tutte le animazioni passano da GSAP: niente CSS
 * animation, così la timeline è l'unica fonte del tempo (timeScale per la registrazione).
 */
(function () {
  const C = window.CONTENT;
  const M = window.MAPDATA;
  const $ = (s, r = document) => r.querySelector(s);
  const el = (tag, cls, html) => {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html != null) e.innerHTML = html;
    return e;
  };
  const SVGNS = 'http://www.w3.org/2000/svg';
  const svg = (tag, attrs) => {
    const e = document.createElementNS(SVGNS, tag);
    for (const k in attrs) e.setAttribute(k, attrs[k]);
    return e;
  };
  const place = (e, x, y, w, h) => {
    e.style.left = x + 'px';
    e.style.top = y + 'px';
    if (w != null) e.style.width = w + 'px';
    if (h != null) e.style.height = h + 'px';
  };

  // ---------- tema ----------
  const root = document.documentElement.style;
  for (const k in C.theme) root.setProperty('--' + k, C.theme[k]);

  // ---------- fit dello stage alla finestra ----------
  const stage = $('#stage');
  const fit = () => (stage.style.transform = `scale(${Math.min(innerWidth / 1080, innerHeight / 1920)})`);
  fit();
  addEventListener('resize', fit);

  // ---------- foto ----------
  const [PX, PY, PW, PH] = C.photo.box;
  const onPhoto = ([fx, fy]) => [PX + fx * PW, PY + fy * PH];
  place($('#photo-wrap'), PX, PY, PW, PH);
  const photo = $('#photo');
  const photoReady = new Promise((res) => {
    photo.onload = res;
    photo.onerror = () => { console.error('foto non trovata: ' + C.photo.src); res(); };
  });
  photo.src = C.photo.src;

  // frame sulla casa
  const [hx1, hy1] = onPhoto(C.photo.house.slice(0, 2));
  const [hx2, hy2] = onPhoto(C.photo.house.slice(2));
  place($('#house'), hx1, hy1, hx2 - hx1, hy2 - hy1);
  $('#house-tag').textContent = C.subject.tag;
  $('#house-match').innerHTML = 'RILEVAMENTO <b>0.0</b>%';
  $('#house-cat').textContent = C.subject.category;
  place($('#scanline'), PX, 0, PW);

  // ---------- HUD ----------
  $('#hud-title').textContent = C.hud.title;
  const secWrap = $('#hud-section');
  const secEls = C.hud.sections.map((t) => secWrap.appendChild(el('span', null, t)));
  const timeEl = $('#hud-time span');

  // ---------- callout specifiche ----------
  const calloutsL = $('#callouts');
  const linesSvg = $('#lines-svg');
  const callouts = C.specs.map((s, i) => {
    const card = el('div', 'card ' + s.side);
    place(card, s.card[0], s.card[1]);
    const idx = String(i + 1).padStart(2, '0');
    const panel = el('div', 'panel');
    const meta = el('div', 'meta mono label', `<b>●</b> ${idx} · ${s.meta}`);
    const main = el('div', 'main', s.main.replace('{n}', '<span class="n">0</span>'));
    const sub = el('div', 'sub mono label', s.sub);
    const parts = [meta, main, sub];
    panel.append(meta, main, sub);
    if (s.viz === 'energy') {
      const scale = el('div', 'energy', 'ABCDEFG'.split('').map((l) => `<i class="${l === s.energy ? 'on' : ''}"></i>`).join(''));
      panel.appendChild(scale);
      parts.push(scale);
    }
    const rule = el('div', 'rule');
    if (s.side === 'above') card.append(panel, rule);
    else card.append(rule, panel);
    calloutsL.appendChild(card);

    const [ax, ay] = onPhoto(s.anchor);
    const anchor = el('div', 'anchor');
    place(anchor, ax, ay);
    calloutsL.appendChild(anchor);

    const path = svg('path', { fill: 'none', stroke: C.theme.fg, 'stroke-opacity': 0.7, 'stroke-width': 1.5 });
    linesSvg.appendChild(path);
    const num = main.querySelector('.n');
    return { s, card, panel, parts, rule, anchor, path, num, ax, ay };
  });

  // ---------- posizione: globo + isocrone ----------
  const L = C.location;
  const CX = PX + PW / 2, CY = PY + PH / 2;
  const msvg = $('#map-svg');
  const defs = svg('defs', {});
  const clip = svg('clipPath', { id: 'mapclip' });
  clip.appendChild(svg('rect', { x: PX, y: PY, width: PW, height: PH }));
  defs.appendChild(clip);
  msvg.appendChild(defs);
  const mapBg = svg('rect', { x: PX, y: PY, width: PW, height: PH, fill: C.theme.bg });
  const clipG = svg('g', { 'clip-path': 'url(#mapclip)' });
  const globeG = svg('g', {});
  const sphere = svg('path', { d: M.sphere, class: 'sphere' });
  const grat = svg('path', { d: M.graticule, class: 'grat' });
  const gratFine = svg('path', { d: M.graticuleFine, class: 'grat-fine' });
  const land = svg('path', { d: M.land, class: 'land' });
  const focus = svg('path', { d: M.focus, class: 'focus' });
  globeG.append(sphere, gratFine, grat, land, focus);
  clipG.appendChild(globeG);
  msvg.append(mapBg, clipG);

  const S0 = 300 / M.R; // globo intero, raggio 300px
  const globeState = { s: S0 };
  const applyGlobe = () => globeG.setAttribute('transform', `translate(${CX} ${CY}) scale(${globeState.s})`);
  applyGlobe();

  // isocrone: raggio ∝ √minuti (schema, non in scala), il più lontano a 300px
  const radius = (min) => 300 * Math.sqrt(min / L.maxMinutes);
  const isoG = svg('g', {});
  msvg.appendChild(isoG);
  const rings = L.places.map((p) => isoG.appendChild(svg('circle', { cx: CX, cy: CY, r: radius(p.minutes), class: 'ring' })));
  const mapUI = $('#map-ui');
  const mkPin = (x, y, cls, lblHtml, side) => {
    const pin = el('div', 'pin ' + cls);
    place(pin, x, y);
    const ring = el('i', 'ring');
    const dot = el('i', 'dot');
    const lbl = el('span', 'lbl mono ' + (side || ''), lblHtml);
    pin.append(ring, dot, lbl);
    mapUI.appendChild(pin);
    return { pin, ring, dot, lbl };
  };
  const places = L.places.map((p) => {
    const r = radius(p.minutes);
    const a = (p.bearing * Math.PI) / 180;
    const x = CX + r * Math.sin(a), y = CY - r * Math.cos(a);
    const link = svg('path', { d: `M${CX} ${CY} L${x} ${y}`, class: 'link' });
    isoG.appendChild(link);
    const pin = mkPin(x, y, '', `<span class="nm">${p.name}</span><span class="mn">${p.minutes} MIN</span>`, p.label);
    return { p, link, ...pin };
  });
  const home = mkPin(CX, CY, 'home', L.pinLabel);

  const mapFrame = el('div', 'map-frame', '<i></i><i></i><i></i><i></i>');
  place(mapFrame, PX, PY, PW, PH);
  const mapTitle = el('div', 'map-txt title mono label', L.title);
  place(mapTitle, PX + 30, PY + 30);
  const mapNote = el('div', 'map-txt mono label', L.note);
  place(mapNote, PX + 30, PY + PH - 52);
  const [clon, clat] = L.center;
  const mapCoord = el('div', 'map-txt mono label',
    `${Math.abs(clat).toFixed(2)}°${clat >= 0 ? 'N' : 'S'} ${Math.abs(clon).toFixed(2)}°${clon >= 0 ? 'E' : 'W'}`);
  mapCoord.style.top = PY + 30 + 'px';
  mapCoord.style.right = 1080 - (PX + PW) + 100 + 'px';
  mapUI.append(mapFrame, mapTitle, mapNote, mapCoord);
  const mapTexts = [mapFrame, mapTitle, mapNote, mapCoord];

  // ---------- prezzo ----------
  const P = C.price;
  const fmtPrice = (v) => Math.round(v).toLocaleString('it-IT').replace(/,/g, '.');
  const priceEl = $('#price');
  priceEl.innerHTML = `<div class="panel">
      <i class="corner tl"></i><i class="corner tr"></i><i class="corner bl"></i><i class="corner br"></i>
      <div class="meta mono label"><b>●</b> ${P.meta}</div>
      <div class="val"><span class="cur">${P.currency}</span><span class="n">${fmtPrice(P.value)}</span></div>
      <div class="rule"></div>
      <div class="note mono">${P.note}</div>
    </div>`;
  const priceNum = priceEl.querySelector('.n');

  // ---------- CTA ----------
  const cta = $('#cta');
  cta.textContent = C.cta;
  cta.style.top = PY + PH + 46 + 'px';

  // ---------- helpers ----------
  const drawable = (p) => {
    const len = p.getTotalLength();
    p.style.strokeDasharray = len + ' ' + len;
    p.style.strokeDashoffset = len;
  };
  const fmt = (t) => {
    const m = Math.floor(t / 60), s = t - m * 60;
    return 'T+' + String(m).padStart(2, '0') + ':' + s.toFixed(2).padStart(5, '0');
  };

  function build() {
    // prezzo centrato sulla foto (serve l'altezza reale del pannello)
    priceEl.style.top = CY - priceEl.offsetHeight / 2 + 'px';
    // leader: dall'anchor in verticale fino alla riga della card, poi in orizzontale se l'anchor è fuori dalla card
    callouts.forEach((c) => {
      const ruleY = c.card.offsetTop + c.rule.offsetTop + 0.75;
      const x1 = c.s.card[0], x2 = x1 + c.card.offsetWidth;
      const y0 = c.s.side === 'above' ? c.ay - 9 : c.ay + 9;
      let d = `M${c.ax} ${y0} L${c.ax} ${ruleY}`;
      if (c.ax < x1) d += ` L${x1} ${ruleY}`;
      if (c.ax > x2) d += ` L${x2} ${ruleY}`;
      c.path.setAttribute('d', d);
      drawable(c.path);
      const ox = Math.max(0, Math.min(c.card.offsetWidth, c.ax - x1));
      c.rule.style.transformOrigin = `${ox}px 50%`;
    });
    places.forEach((p) => drawable(p.link));

    const OUT = 'power3.out';
    const tl = gsap.timeline({ paused: true, defaults: { ease: 'power2.inOut' } });
    const DUR = C.duration;
    const shade = $('#photo-shade');

    // ===== stati iniziali =====
    gsap.set('#photo-wrap', { opacity: 0 });
    gsap.set(['#house .corner', '#house .tick', '#reticle'], { opacity: 0 });
    gsap.set(['#house-tag', '#house-match', '#house-cat'], { opacity: 0, y: 8 });
    gsap.set('#hud > *', { opacity: 0 });
    gsap.set(secEls, { opacity: 0, y: 10 });
    gsap.set(callouts.flatMap((c) => c.parts), { opacity: 0, y: 10 });
    gsap.set(callouts.map((c) => c.panel), { opacity: 0 });
    gsap.set(callouts.map((c) => c.rule), { scaleX: 0 });
    gsap.set(callouts.map((c) => c.anchor), { opacity: 0, scale: 0.4 });
    gsap.set(msvg, { opacity: 0 });
    gsap.set([grat, gratFine, land, focus, isoG], { opacity: 0 });
    gsap.set(rings, { scale: 0.6, opacity: 0, transformOrigin: `${CX}px ${CY}px` });
    gsap.set(mapTexts, { opacity: 0 });
    gsap.set([home, ...places].map((p) => p.dot), { scale: 0, opacity: 0 });
    gsap.set([home, ...places].map((p) => p.ring), { opacity: 0 });
    gsap.set([home, ...places].map((p) => p.lbl), { opacity: 0 });
    gsap.set(priceEl, { opacity: 0 });
    gsap.set(priceEl.querySelectorAll('.meta, .val, .note'), { opacity: 0, y: 12 });
    gsap.set(priceEl.querySelector('.rule'), { scaleX: 0 });
    gsap.set(priceEl.querySelectorAll('.corner'), { opacity: 0, scale: 1.3 });
    gsap.set(cta, { opacity: 0, y: 10 });
    gsap.set('#bg', { '--grid': 0 });

    // ===== camera: zoom lentissimo 100→104% per tutto il video =====
    tl.fromTo('#camera', { scale: 1 }, { scale: 1.04, duration: DUR, ease: 'none' }, 0);
    tl.to('#hud-progress i', { scaleX: 1, duration: DUR, ease: 'none' }, 0);

    // ===== 1. Apertura 0–2s: la foto emerge dal nero =====
    tl.to('#photo-wrap', { opacity: 1, duration: 1.6, ease: 'sine.out' }, 0.1);

    // ===== 2. Scan 2–4s =====
    tl.to('#hud > *', { opacity: 1, duration: 1.0, stagger: 0.05, ease: 'sine.inOut' }, 1.9);
    tl.to(secEls[0], { opacity: 1, y: 0, duration: 0.6, ease: OUT }, 2.1);
    tl.to('#bg', { '--grid': 1, duration: 1.6, ease: 'sine.inOut' }, 2.0);
    tl.to(shade, { opacity: 0.22, duration: 1.4, ease: 'sine.inOut' }, 2.0);
    const scan = { y: PY - 20 };
    const updScan = () => ($('#scanline').style.transform = `translateY(${scan.y}px)`);
    updScan();
    tl.fromTo('#scanline', { opacity: 0 }, { opacity: 1, duration: 0.25, ease: 'none' }, 2.0);
    tl.to(scan, { y: PY + PH, duration: 1.6, ease: 'sine.inOut', onUpdate: updScan }, 2.0);
    tl.to('#scanline', { opacity: 0, duration: 0.3, ease: 'none' }, 3.35);
    tl.to('#house .corner', { opacity: 0.95, duration: 0.7, stagger: 0.06, ease: 'sine.out' }, 2.9);
    tl.fromTo('#house .corner', { scale: 1.3 }, { scale: 1, duration: 0.9, stagger: 0.06, ease: OUT }, 2.9);
    tl.to('#house .tick', { opacity: 0.6, duration: 0.6, stagger: 0.05 }, 3.1);
    tl.to('#reticle', { opacity: 0.6, duration: 0.6, ease: 'sine.out' }, 3.0);
    tl.to('#reticle', { opacity: 0.22, duration: 0.8, ease: 'sine.inOut' }, 3.6);
    tl.to(['#house-tag', '#house-match', '#house-cat'], { opacity: 1, y: 0, duration: 0.6, stagger: 0.08, ease: OUT }, 3.15);
    const mv = { v: 0 };
    tl.to(mv, { v: C.subject.match, duration: 0.8, ease: 'power2.out', onUpdate: () => ($('#house-match b').textContent = mv.v.toFixed(1)) }, 3.15);

    // ===== 3. Specifiche 4–9s =====
    tl.to(['#house-tag', '#house-match', '#house-cat', '#reticle'], { opacity: 0, duration: 0.5, ease: 'sine.inOut' }, 4.0);
    tl.to(['#house .corner', '#house .tick'], { opacity: 0.35, duration: 0.6, ease: 'sine.inOut' }, 4.0);
    tl.to(shade, { opacity: 0.42, duration: 0.8, ease: 'sine.inOut' }, 4.0);
    tl.to(secEls[0], { opacity: 0, y: -10, duration: 0.5 }, 4.0);
    tl.to(secEls[1], { opacity: 1, y: 0, duration: 0.6, ease: OUT }, 4.25);
    const T0 = 4.2, GAP = 1.0;
    callouts.forEach((c, i) => {
      const t = T0 + i * GAP;
      tl.to(c.anchor, { opacity: 1, scale: 1, duration: 0.45, ease: OUT }, t);
      tl.to(c.path, { strokeDashoffset: 0, duration: 0.55 }, t + 0.15);
      tl.to(c.rule, { scaleX: 1, duration: 0.6, ease: 'power3.inOut' }, t + 0.55);
      tl.to(c.panel, { opacity: 1, duration: 0.5, ease: 'sine.out' }, t + 0.6);
      tl.to(c.parts, { opacity: 1, y: 0, duration: 0.6, stagger: 0.07, ease: OUT }, t + 0.68);
      if (c.num) {
        const n = { v: 0 };
        const target = c.s.count;
        tl.to(n, { v: target, duration: 0.8, ease: 'power2.out', onUpdate: () => (c.num.textContent = Math.round(n.v)) }, t + 0.75);
      }
      // il callout precedente scende di tono quando arriva il successivo
      if (i > 0) {
        const p = callouts[i - 1];
        tl.to([p.card, p.path, p.anchor], { opacity: 0.5, duration: 0.6, ease: 'sine.inOut' }, t + 0.2);
      }
    });
    const allCall = callouts.flatMap((c) => [c.card, c.path, c.anchor]);
    tl.to(allCall, { opacity: 1, duration: 0.5, ease: 'sine.inOut' }, 8.1); // tutti pieni per un momento
    tl.to([...allCall, '#house .corner', '#house .tick'], { opacity: 0, duration: 0.6, ease: 'sine.inOut' }, 8.75);

    // ===== 4. Posizione 9–13s =====
    tl.to(secEls[1], { opacity: 0, y: -10, duration: 0.5 }, 8.9);
    tl.to(secEls[2], { opacity: 1, y: 0, duration: 0.6, ease: OUT }, 9.15);
    tl.to(msvg, { opacity: 1, duration: 0.6, ease: 'sine.out' }, 9.0);
    tl.to([grat, land], { opacity: 1, duration: 0.6, ease: 'sine.out' }, 9.1);
    tl.to(mapTexts, { opacity: 1, duration: 0.6, stagger: 0.06, ease: 'sine.out' }, 9.2);
    tl.to(globeState, { s: 1, duration: 1.4, ease: 'power3.inOut', onUpdate: applyGlobe }, 9.3);
    tl.to(focus, { opacity: 1, duration: 0.6, ease: 'sine.out' }, 10.0);
    tl.to(gratFine, { opacity: 1, duration: 0.6 }, 10.2);
    tl.to(grat, { opacity: 0.45, duration: 0.6 }, 10.2);
    tl.to(home.dot, { scale: 1, opacity: 1, duration: 0.4, ease: OUT }, 10.45);
    tl.set(home.ring, { scale: 1, opacity: 0.9 }, 10.45);
    tl.to(home.ring, { scale: 3.6, opacity: 0, duration: 1.1, ease: 'sine.out', repeat: 1 }, 10.45);
    tl.to(home.lbl, { opacity: 1, duration: 0.4, ease: 'sine.out' }, 10.55);
    tl.to(isoG, { opacity: 1, duration: 0.3, ease: 'none' }, 10.6);
    tl.to(rings, { scale: 1, opacity: 1, duration: 0.9, stagger: 0.12, ease: OUT }, 10.6);
    places.forEach((p, i) => {
      const t = 10.8 + i * 0.36;
      tl.to(p.link, { strokeDashoffset: 0, duration: 0.45, ease: 'power2.out' }, t);
      tl.to(p.dot, { scale: 1, opacity: 1, duration: 0.35, ease: OUT }, t + 0.35);
      tl.set(p.ring, { scale: 1, opacity: 0.9 }, t + 0.35);
      tl.to(p.ring, { scale: 3.4, opacity: 0, duration: 0.9, ease: 'sine.out' }, t + 0.35);
      tl.to(p.lbl, { opacity: 1, duration: 0.45, ease: 'sine.out' }, t + 0.45);
    });
    tl.to([msvg, mapUI], { opacity: 0, duration: 0.6, ease: 'sine.inOut' }, 12.75);

    // ===== 5. Prezzo 13–15s =====
    tl.to(shade, { opacity: 0.62, duration: 0.01 }, 9.6); // sotto la mappa (coperta), pronta per il prezzo
    tl.to(secEls[2], { opacity: 0, y: -10, duration: 0.5 }, 12.8);
    tl.to(secEls[3], { opacity: 1, y: 0, duration: 0.6, ease: OUT }, 13.05);
    tl.set(priceEl, { opacity: 1 }, 13.0);
    tl.to(priceEl.querySelectorAll('.corner'), { opacity: 1, scale: 1, duration: 0.8, stagger: 0.05, ease: OUT }, 13.0);
    tl.to(priceEl.querySelectorAll('.meta, .val'), { opacity: 1, y: 0, duration: 0.7, stagger: 0.1, ease: OUT }, 13.1);
    const pv = { v: 0 };
    tl.to(pv, { v: P.value, duration: 1.0, ease: 'power2.out', onUpdate: () => (priceNum.textContent = fmtPrice(Math.round(pv.v / 1000) * 1000)) }, 13.2);
    tl.to(priceEl.querySelector('.rule'), { scaleX: 1, duration: 0.8, ease: 'power3.inOut' }, 13.7);
    tl.to(priceEl.querySelector('.note'), { opacity: 1, y: 0, duration: 0.6, ease: OUT }, 14.0);

    // ===== 6. Chiusura 15–18s =====
    tl.to(priceEl, { opacity: 0, duration: 0.7, ease: 'sine.inOut' }, 15.0);
    tl.to('#hud > *', { opacity: 0, duration: 0.8, ease: 'sine.inOut' }, 15.0);
    tl.to('#bg', { '--grid': 0, duration: 1.0, ease: 'sine.inOut' }, 15.0);
    tl.to(shade, { opacity: 0, duration: 1.4, ease: 'sine.inOut' }, 15.1);
    tl.to(cta, { opacity: 1, y: 0, duration: 0.9, ease: 'sine.out' }, 16.0);
    tl.set({}, {}, DUR);

    tl.eventCallback('onUpdate', () => (timeEl.textContent = fmt(tl.time())));
    return tl;
  }

  // ---------- avvio ----------
  const record = /record/.test(location.search);
  window.__ready = Promise.all([document.fonts.ready, photoReady]).then(() => {
    const tl = build();
    window.__tl = tl;
    window.__play = (timeScale = 1) => {
      tl.timeScale(timeScale);
      tl.play(0);
      return performance.timeOrigin + performance.now();
    };
    window.__seek = (t) => { tl.pause(); tl.seek(t, false); };
    // anteprima: parte subito (o ?t=12 per saltare a un punto)
    const m = location.search.match(/[?&]t=([\d.]+)/);
    if (m) tl.seek(+m[1]).pause();
    else if (!record) tl.play(0);
  });
})();
