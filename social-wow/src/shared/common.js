// Helper condivisi: formattazione tempi, sottotitoli, boot deterministico (seek) e anteprima.
window.LX = (() => {
  const pad = (n, w = 2) => String(Math.floor(n)).padStart(w, '0');
  const fmtClock = (s) => { s = Math.max(0, s); const m = Math.floor(s / 60), sec = Math.floor(s % 60), cc = Math.floor((s * 100) % 100); return `${pad(m)}:${pad(sec)}.${pad(cc)}`; };
  const fmtTC = (t, fps = 30) => { const f = Math.round(t * fps); return `${pad(f / (fps * 3600))}:${pad((f / (fps * 60)) % 60)}:${pad((f / fps) % 60)}:${pad(f % fps)}`; };
  const fmtInt = (n) => Math.round(n).toLocaleString('it-IT');

  // Sottotitoli: lista {t0, t1, html}. Entrata 0.35 s, uscita 0.25 s.
  function subs(container, list, tl) {
    list.forEach((s) => {
      const el = document.createElement('div'); el.className = 'line'; el.innerHTML = s.html; container.appendChild(el);
      tl.fromTo(el, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.35, ease: 'power2.out' }, s.t0);
      tl.to(el, { opacity: 0, y: -10, duration: 0.25, ease: 'power2.in' }, s.t1 - 0.25);
    });
  }

  // boot: espone __DUR, __seek, __ready. dyn(t) aggiorna i testi calcolati (cronometri, contatori).
  function boot(tl, DUR, dyn) {
    tl.pause(0);
    window.__DUR = DUR;
    window.__tl = tl;
    window.__seek = (t) => { t = Math.max(0, Math.min(t, DUR - 1e-4)); tl.seek(t, false); dyn && dyn(t); };
    window.__ready = document.fonts.ready.then(() => { window.__seek(0); return true; });
    const q = new URLSearchParams(location.search);
    if (q.has('t')) { window.__ready.then(() => window.__seek(+q.get('t'))); return; }
    if (q.has('record')) return;
    // anteprima nel browser: loop
    window.__ready.then(() => { const start = performance.now(); gsap.ticker.add(() => window.__seek(((performance.now() - start) / 1000) % DUR)); });
  }
  return { fmtClock, fmtTC, fmtInt, subs, boot };
})();
