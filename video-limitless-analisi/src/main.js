/* LIMITLESS — "analisi" animata.
 * Costruisce il DOM da window.CONTENT e crea un'unica timeline GSAP (paused)
 * che il recorder controlla. Tutte le animazioni passano da GSAP: niente CSS
 * animation, così la timeline è l'unica fonte del tempo (timeScale per la registrazione).
 */
(function () {
  const C = window.CONTENT;
  const G = window.GLOBE;
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

  // ---------- tema ----------
  const root = document.documentElement.style;
  for (const k in C.theme) root.setProperty('--' + k, C.theme[k]);

  // ---------- fit dello stage alla finestra ----------
  const stage = $('#stage');
  const fit = () => {
    const s = Math.min(innerWidth / 1080, innerHeight / 1920);
    stage.style.transform = `scale(${s})`;
  };
  fit();
  addEventListener('resize', fit);

  // ---------- soggetto ----------
  $('#wordmark').textContent = C.subject.wordmark;
  $('#wordmark-scan').textContent = C.subject.wordmark;
  $('#subject-tag').innerHTML = C.subject.tag;
  $('#subject-match').innerHTML = 'MATCH <b>0.0</b>%';
  $('#subject-cat').textContent = C.subject.category;

  // ---------- HUD ----------
  $('#hud-title').textContent = C.hud.title;
  const secWrap = $('#hud-section');
  const secEls = C.hud.sections.map((t) => {
    const s = el('span', null, t);
    secWrap.appendChild(s);
    return s;
  });
  const timeEl = $('#hud-time span');

  // ---------- callout ----------
  const calloutsL = $('#callouts');
  const linesSvg = $('#lines-svg');
  const callouts = C.services.map((s, i) => {
    const card = el('div', 'card ' + s.side);
    card.style.left = s.card[0] + 'px';
    card.style.top = s.card[1] + 'px';
    const idx = String(i + 1).padStart(2, '0');
    const meta = el('div', 'meta mono label', `<b>●</b> ${idx} · SERVIZIO`);
    const title = el('div', 'title', s.title);
    const price = el('div', 'price',
      `<span class="pre">${s.prefix}</span><span class="num">0</span><span class="unit">${s.unit}</span>` +
      (s.suffix ? `<span class="suf">${s.suffix}</span>` : ''));
    const rule = el('div', 'rule');
    if (s.side === 'above') card.append(meta, title, price, rule);
    else card.append(rule, meta, title, price);
    calloutsL.appendChild(card);

    const anchor = el('div', 'anchor');
    anchor.style.left = s.anchor[0] + 'px';
    anchor.style.top = s.anchor[1] + 'px';
    calloutsL.appendChild(anchor);

    const path = svg('path', { fill: 'none', stroke: C.theme.fg, 'stroke-opacity': 0.55, 'stroke-width': 1.5 });
    linesSvg.appendChild(path);
    return { s, card, meta, title, price, rule, anchor, path, num: price.querySelector('.num') };
  });

  // ---------- metriche ----------
  const metricsL = $('#metrics');
  const metrics = C.metrics.map((m, i) => {
    const row = el('div', 'metric');
    row.style.top = 540 + i * 262 + 'px';
    const rule = el('div', 'rule', '<i></i>');
    const head = el('div', 'head',
      `<span class="mono label">${m.label}</span><span class="mono label">${m.note || ''}</span>`);
    const mask = el('div', 'value-mask');
    const value = el('div', 'value', m.value);
    mask.appendChild(value);
    const viz = el('div', 'viz');
    const parts = {};
    if (m.viz === 'range') {
      viz.classList.add('viz-range');
      const W = 805;
      const step = W / (m.scale - 1);
      parts.ticks = [];
      for (let d = 1; d <= m.scale; d++) {
        const t = el('i', 'tick-i');
        t.style.left = (d - 1) * step + 'px';
        if (d >= m.range[0] && d <= m.range[1]) t.style.background = C.theme.fg;
        viz.appendChild(t);
        parts.ticks.push(t);
      }
      const band = el('i', 'band');
      band.style.left = (m.range[0] - 1) * step + 'px';
      band.style.width = (m.range[1] - m.range[0]) * step + 1.5 + 'px';
      viz.appendChild(band);
      parts.band = band;
    } else if (m.viz === 'check') {
      viz.classList.add('viz-bar');
      viz.innerHTML = '<div class="track"><i class="fill"></i></div>';
      const s = svg('svg', { viewBox: '0 0 38 38' });
      const circ = svg('circle', { cx: 19, cy: 19, r: 17, fill: 'none', stroke: C.theme.accent, 'stroke-width': 1.5 });
      const tick = svg('path', { d: 'M11 19.5 L16.5 25 L27 13.5', fill: 'none', stroke: C.theme.fg, 'stroke-width': 2, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' });
      s.append(circ, tick);
      viz.appendChild(s);
      parts.fill = viz.querySelector('.fill');
      parts.circ = circ;
      parts.tick = tick;
    } else if (m.viz === 'live') {
      viz.classList.add('viz-live');
      parts.ring = el('i', 'ring');
      parts.dot = el('i', 'dot');
      viz.append(parts.ring, parts.dot);
      // segnale: linea piatta con due "impulsi" discreti
      const s = svg('svg', { viewBox: '0 0 761 34' });
      let d = 'M0 17';
      const beats = [180, 470];
      for (const b of beats) d += ` L${b - 14} 17 L${b - 6} 8 L${b + 2} 27 L${b + 10} 13 L${b + 16} 17`;
      d += ' L761 17';
      const wave = svg('path', { d, fill: 'none', stroke: C.theme.accent, 'stroke-width': 1.6, 'stroke-linejoin': 'round' });
      s.appendChild(wave);
      viz.appendChild(s);
      parts.wave = wave;
    }
    row.append(rule, head, mask, viz);
    metricsL.appendChild(row);
    return { m, row, ruleI: rule.querySelector('i'), head, value, viz, parts };
  });

  // ---------- copertura ----------
  const gsvg = $('#globe-svg');
  const clip = svg('clipPath', { id: 'covclip' });
  clip.appendChild(svg('rect', { x: 90, y: 450, width: 825, height: 990 }));
  const defs = svg('defs', {});
  defs.appendChild(clip);
  gsvg.appendChild(defs);
  const clipG = svg('g', { 'clip-path': 'url(#covclip)' });
  const globeG = svg('g', {});
  const sphere = svg('path', { d: G.sphere, class: 'sphere' });
  const grat = svg('path', { d: G.graticule, class: 'grat' });
  const gratFine = svg('path', { d: G.graticuleFine, class: 'grat-fine' });
  const land = svg('path', { d: G.land, class: 'land' });
  const focus = svg('path', { d: G.focus, class: 'focus' });
  globeG.append(sphere, gratFine, grat, land, focus);
  clipG.appendChild(globeG);
  gsvg.appendChild(clipG);

  const CX = 540, CY = 960;
  const S0 = 330 / G.R; // globo intero, raggio 330px
  const globeState = { s: S0 };
  const applyGlobe = () => globeG.setAttribute('transform', `translate(${CX} ${CY}) scale(${globeState.s})`);
  applyGlobe();

  const covUI = $('#coverage-ui');
  const covFrame = el('div', 'cov-frame', '<i></i><i></i><i></i><i></i>');
  const cv = C.coverage;
  const covTitle = el('div', 'cov-txt title mono label', cv.title);
  covTitle.style.cssText = 'left:120px;top:480px';
  const covCount = el('div', 'cov-txt mono label', `${cv.counterLabel} <b>00</b>/${cv.counter[1]}`);
  covCount.style.cssText = 'right:195px;top:480px';
  const covNote = el('div', 'cov-txt mono label', cv.note);
  covNote.style.cssText = 'left:120px;top:1392px';
  const [clon, clat] = cv.center;
  const covCoord = el('div', 'cov-txt mono label',
    `${Math.abs(clat).toFixed(2)}°${clat >= 0 ? 'N' : 'S'} ${Math.abs(clon).toFixed(2)}°${clon >= 0 ? 'E' : 'W'}`);
  covCoord.style.cssText = 'right:195px;top:1392px';
  covUI.append(covFrame, covTitle, covCount, covNote, covCoord);
  const covCountB = covCount.querySelector('b');

  const pinsL = $('#pins');
  const pins = G.pins.map((p) => {
    const pin = el('div', 'pin');
    pin.style.left = CX + p.x + 'px';
    pin.style.top = CY + p.y + 'px';
    const ring = el('i', 'ring');
    const dot = el('i', 'dot');
    const lbl = el('span', 'lbl mono ' + p.label, p.name);
    pin.append(ring, dot, lbl);
    pinsL.appendChild(pin);
    return { pin, ring, dot, lbl };
  });

  $('#cta').textContent = C.cta;

  // ---------- helpers ----------
  const drawable = (p) => {
    const L = p.getTotalLength();
    p.style.strokeDasharray = L + ' ' + L;
    p.style.strokeDashoffset = L;
    return L;
  };
  const fmt = (t) => {
    const m = Math.floor(t / 60), s = t - m * 60;
    return 'T+' + String(m).padStart(2, '0') + ':' + s.toFixed(2).padStart(5, '0');
  };

  function build() {
    // leader: dall'anchor verticale fino alla riga della card
    callouts.forEach((c) => {
      const ruleY = c.card.offsetTop + c.rule.offsetTop + 0.75;
      const [ax, ay] = c.s.anchor;
      const y0 = c.s.side === 'above' ? ay - 8 : ay + 8;
      c.path.setAttribute('d', `M${ax} ${y0} L${ax} ${ruleY}`);
      drawable(c.path);
      c.rule.style.transformOrigin = `${ax - c.s.card[0]}px 50%`;
    });
    metrics.forEach((m) => {
      if (m.parts.tick) drawable(m.parts.tick);
      if (m.parts.circ) drawable(m.parts.circ);
      if (m.parts.wave) drawable(m.parts.wave);
    });

    const E = 'power2.inOut';
    const OUT = 'power3.out';
    const tl = gsap.timeline({ paused: true, defaults: { ease: E } });
    const DUR = 19;

    // ===== stati iniziali =====
    gsap.set('#wordmark', { opacity: 0.25 });
    gsap.set(['#frame .corner', '#frame .tick'], { opacity: 0 });
    gsap.set(['#subject-tag', '#subject-match', '#subject-cat'], { opacity: 0, y: 8 });
    gsap.set('#hud > *', { opacity: 0 });
    gsap.set(secEls, { opacity: 0, y: 10 });
    gsap.set(callouts.flatMap((c) => [c.meta, c.title, c.price]), { opacity: 0, y: (i, t) => 10 });
    gsap.set(callouts.map((c) => c.rule), { scaleX: 0 });
    gsap.set(callouts.map((c) => c.anchor), { opacity: 0, scale: 0.4 });
    gsap.set(metrics.map((m) => m.ruleI), { scaleX: 0 });
    gsap.set(metrics.map((m) => m.head), { opacity: 0 });
    gsap.set(metrics.map((m) => m.value), { yPercent: 105 });
    gsap.set(metrics.map((m) => m.viz), { opacity: 0 });
    gsap.set(gsvg, { opacity: 0 });
    gsap.set([grat, gratFine, land, focus], { opacity: 0 });
    gsap.set(covUI.children, { opacity: 0 });
    gsap.set(pins.map((p) => p.dot), { scale: 0, opacity: 0 });
    gsap.set(pins.map((p) => p.ring), { scale: 1, opacity: 0 });
    gsap.set(metrics.filter((m) => m.parts.ring).map((m) => m.parts.ring), { opacity: 0 });
    gsap.set(pins.map((p) => p.lbl), { opacity: 0, x: 0 });
    gsap.set('#cta', { opacity: 0, y: 10 });
    gsap.set('#bg', { '--grid': 0 });

    // ===== camera: zoom lentissimo 100→104% per tutto il video =====
    tl.fromTo('#camera', { scale: 1 }, { scale: 1.04, duration: DUR, ease: 'none' }, 0);
    // HUD: timecode e barra di avanzamento
    tl.to('#hud-progress i', { scaleX: 1, duration: DUR, ease: 'none' }, 0);

    // ===== 1. Apertura 0–2s =====
    tl.to('#wordmark', { opacity: 1, duration: 1.2, ease: 'sine.out' }, 0);

    // ===== 2. Scan 2–4s =====
    tl.to('#hud > *', { opacity: 1, duration: 1.0, stagger: 0.05, ease: 'sine.inOut' }, 1.9);
    tl.to(secEls[0], { opacity: 1, y: 0, duration: 0.6, ease: OUT }, 2.1);
    tl.to('#bg', { '--grid': 1, duration: 1.6, ease: 'sine.inOut' }, 2.0);
    const scan = { y: 780 };
    const wm = $('#wordmark-scan');
    const wmTop = 896 + (128 - 84) / 2; // bbox della riga del wordmark in coordinate stage
    const updScan = () => {
      $('#scanline').style.transform = `translateY(${scan.y}px)`;
      // la porzione del wordmark già "letta" resta leggermente tinta, banda viva vicino alla linea
      const local = scan.y - wmTop;
      const top = Math.max(0, Math.min(84, local - 26));
      const bot = Math.max(0, Math.min(84, 84 - local));
      wm.style.clipPath = `inset(${top}px 0 ${bot}px 0)`;
    };
    updScan();
    tl.set('#scanline', { opacity: 1 }, 2.0);
    tl.fromTo('#scanline', { opacity: 0 }, { opacity: 1, duration: 0.25, ease: 'none' }, 2.0);
    tl.to(scan, { y: 1140, duration: 1.5, ease: 'sine.inOut', onUpdate: updScan }, 2.0);
    tl.to('#scanline', { opacity: 0, duration: 0.3, ease: 'none' }, 3.25);
    tl.to('#frame .corner', { opacity: 0.9, duration: 0.7, stagger: 0.06, ease: 'sine.out' }, 2.9);
    tl.fromTo('#frame .corner', { scale: 1.35 }, { scale: 1, duration: 0.9, stagger: 0.06, ease: OUT }, 2.9);
    tl.to('#frame .tick', { opacity: 0.5, duration: 0.6, stagger: 0.05 }, 3.1);
    tl.to('#reticle', { opacity: 0.55, duration: 0.6, ease: 'sine.out' }, 3.0);
    tl.to('#reticle', { opacity: 0.18, duration: 0.8, ease: 'sine.inOut' }, 3.7);
    tl.to(['#subject-tag', '#subject-match', '#subject-cat'], { opacity: 1, y: 0, duration: 0.6, stagger: 0.08, ease: OUT }, 3.15);
    const matchB = () => $('#subject-match b');
    const mv = { v: 0 };
    tl.to(mv, { v: C.subject.match, duration: 0.8, ease: 'power2.out', onUpdate: () => (matchB().textContent = mv.v.toFixed(1)) }, 3.15);

    // ===== 3. Servizi 4–10s =====
    tl.to(['#subject-tag', '#subject-match', '#subject-cat'], { opacity: 0, duration: 0.5, ease: 'sine.inOut' }, 4.0);
    tl.to(secEls[0], { opacity: 0, y: -10, duration: 0.5 }, 4.0);
    tl.to(secEls[1], { opacity: 1, y: 0, duration: 0.6, ease: OUT }, 4.25);
    const T0 = 4.2, GAP = 1.2;
    callouts.forEach((c, i) => {
      const t = T0 + i * GAP;
      tl.to(c.anchor, { opacity: 1, scale: 1, duration: 0.45, ease: OUT }, t);
      tl.to(c.path, { strokeDashoffset: 0, duration: 0.55, ease: 'power2.inOut' }, t + 0.15);
      tl.to(c.rule, { scaleX: 1, duration: 0.6, ease: 'power3.inOut' }, t + 0.6);
      tl.to([c.meta, c.title, c.price], { opacity: 1, y: 0, duration: 0.6, stagger: 0.08, ease: OUT }, t + 0.72);
      const n = { v: 0 };
      tl.to(n, { v: c.s.value, duration: 0.8, ease: 'power2.out', onUpdate: () => (c.num.textContent = Math.round(n.v)) }, t + 0.8);
      // il callout precedente scende di tono quando arriva il successivo
      if (i > 0) {
        const p = callouts[i - 1];
        tl.to([p.card, p.path, p.anchor], { opacity: 0.5, duration: 0.6, ease: 'sine.inOut' }, t + 0.2);
      }
    });
    const allCall = callouts.flatMap((c) => [c.card, c.path, c.anchor]);
    tl.to(allCall, { opacity: 1, duration: 0.6, ease: 'sine.inOut' }, 8.7);
    tl.to(allCall, { opacity: 0, duration: 0.6, ease: 'sine.inOut' }, 9.7);

    // ===== 4. Metriche 10–13s =====
    tl.to(secEls[1], { opacity: 0, y: -10, duration: 0.5 }, 9.8);
    tl.to(secEls[2], { opacity: 1, y: 0, duration: 0.6, ease: OUT }, 10.1);
    tl.to('#subject', { y: 330 - 960, scale: 0.6, duration: 1.1, ease: 'power3.inOut' }, 9.9);
    tl.to('#reticle', { opacity: 0, duration: 0.5 }, 9.9);
    metrics.forEach((m, i) => {
      const t = 10.35 + i * 0.38;
      tl.to(m.ruleI, { scaleX: 1, duration: 0.8, ease: 'power3.inOut' }, t);
      tl.to(m.head, { opacity: 1, duration: 0.5, ease: 'sine.out' }, t + 0.2);
      tl.to(m.value, { yPercent: 0, duration: 0.8, ease: OUT }, t + 0.25);
      tl.to(m.viz, { opacity: 1, duration: 0.4, ease: 'sine.out' }, t + 0.45);
      const P = m.parts;
      if (P.band) {
        tl.fromTo(P.band, { scaleX: 0 }, { scaleX: 1, duration: 0.8, ease: 'power3.inOut' }, t + 0.5);
      }
      if (P.fill) {
        tl.fromTo(P.fill, { scaleX: 0 }, { scaleX: 1, duration: 0.9, ease: 'power3.inOut' }, t + 0.5);
        tl.to(P.circ, { strokeDashoffset: 0, duration: 0.6 }, t + 1.0);
        tl.to(P.tick, { strokeDashoffset: 0, duration: 0.4, ease: 'power2.out' }, t + 1.3);
      }
      if (P.wave) {
        tl.to(P.wave, { strokeDashoffset: 0, duration: 1.4, ease: 'power1.inOut' }, t + 0.5);
        tl.set(P.ring, { scale: 1, opacity: 0.9 }, t + 0.5);
        tl.to(P.ring, { scale: 3.2, opacity: 0, duration: 1.2, ease: 'sine.out', repeat: 1 }, t + 0.5);
      }
    });
    const allMetrics = metrics.map((m) => m.row);
    tl.to(allMetrics, { opacity: 0, duration: 0.55, stagger: 0.06, ease: 'sine.inOut' }, 12.75);

    // ===== 5. Copertura 13–16.5s =====
    tl.to(secEls[2], { opacity: 0, y: -10, duration: 0.5 }, 12.9);
    tl.to(secEls[3], { opacity: 1, y: 0, duration: 0.6, ease: OUT }, 13.2);
    tl.to(gsvg, { opacity: 1, duration: 0.6, ease: 'sine.out' }, 13.1);
    tl.to([grat, land], { opacity: 1, duration: 0.7, ease: 'sine.out' }, 13.2);
    tl.to(covUI.children, { opacity: 1, duration: 0.6, stagger: 0.06, ease: 'sine.out' }, 13.3);
    tl.to(globeState, { s: 1, duration: 1.5, ease: 'power3.inOut', onUpdate: applyGlobe }, 13.5);
    tl.to(focus, { opacity: 1, duration: 0.6, ease: 'sine.out' }, 14.2);
    tl.to(gratFine, { opacity: 1, duration: 0.6 }, 14.4);
    tl.to(grat, { opacity: 0.5, duration: 0.6 }, 14.4);
    const cnt = { v: 0 };
    tl.to(cnt, { v: cv.counter[0], duration: 1.3, ease: 'power1.inOut', onUpdate: () => (covCountB.textContent = String(Math.round(cnt.v)).padStart(2, '0')) }, 14.7);
    pins.forEach((p, i) => {
      const t = 14.75 + i * 0.12;
      tl.to(p.dot, { scale: 1, opacity: 1, duration: 0.35, ease: OUT }, t);
      tl.set(p.ring, { scale: 1, opacity: 0.9 }, t);
      tl.to(p.ring, { scale: 3.4, opacity: 0, duration: 0.9, ease: 'sine.out' }, t);
      tl.to(p.lbl, { opacity: 0.85, duration: 0.4, ease: 'sine.out' }, t + 0.1);
    });

    // ===== 6. Chiusura 16.5–19s =====
    const cover = [gsvg, pinsL, covUI, '#hud > *', '#frame .corner', '#frame .tick'];
    tl.to(cover, { opacity: 0, duration: 0.8, ease: 'sine.inOut' }, 16.5);
    tl.to('#bg', { '--grid': 0, duration: 1.0, ease: 'sine.inOut' }, 16.5);
    tl.to('#subject', { y: 0, scale: 1, duration: 1.3, ease: 'power3.inOut' }, 16.6);
    tl.to('#cta', { opacity: 1, y: 0, duration: 0.9, ease: 'sine.out' }, 17.6);
    tl.set({}, {}, DUR);

    tl.eventCallback('onUpdate', () => (timeEl.textContent = fmt(tl.time())));
    return tl;
  }

  // ---------- avvio ----------
  const record = /record/.test(location.search);
  window.__ready = document.fonts.ready.then(() => {
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
