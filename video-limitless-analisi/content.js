/*
 * CONTENUTI DEL VIDEO — l'unico file da modificare per riusare il template
 * su un altro soggetto (prodotto, sito cliente, ...).
 *
 * Coordinate: tutte in pixel del video finale 1080x1920 (origine in alto a sinistra).
 * Safe zone TikTok (testo vietato): y < 150, y > 1540, x > 940.
 * Lo zoom camera 100→104% sposta i punti verso l'esterno: il check automatico
 * in tools/record.js verifica i testi a zoom massimo.
 *
 * Dopo aver cambiato `coverage` rilancia:  npm run globe
 */
const CONTENT = {
  // Colori e font: palette scura, un solo accento usato con parsimonia.
  theme: {
    bg: '#07080a',
    fg: '#f2f3f5',
    dim: 'rgba(242,243,245,0.46)',
    line: 'rgba(242,243,245,0.18)',
    accent: '#8fb3ff',
  },

  subject: {
    wordmark: 'LIMITLESS',
    tag: 'OBJ_01 — BRAND',
    category: 'PRESENZA ONLINE · ATTIVITÀ LOCALI',
    match: 99.8, // % mostrata nel reticolo dopo la scansione
  },

  hud: {
    title: 'LIMITLESS / ANALISI',
    sections: ['01 — IDENTIFICAZIONE', '02 — SERVIZI', '03 — METRICHE', '04 — COPERTURA', '05 — CONTATTO'],
  },

  // Callout: `anchor` = punto sul soggetto; `card` = angolo alto-sinistra della card;
  // `side` = 'above' (card sopra il soggetto, linea che sale) o 'below'.
  // La card deve contenere orizzontalmente la x dell'anchor.
  services: [
    { title: 'SITI WEB', prefix: 'DA', value: 700, unit: '€', suffix: '', anchor: [262, 896], card: [110, 486], side: 'above' },
    { title: 'VIDEO ADS', prefix: 'DA', value: 119, unit: '€', suffix: '', anchor: [706, 896], card: [556, 640], side: 'above' },
    { title: 'SPOT CINEMATOGRAFICO', prefix: 'DA', value: 179, unit: '€', suffix: '', anchor: [398, 1024], card: [110, 1130], side: 'below' },
    { title: 'AUTOMAZIONI', prefix: 'DA', value: 99, unit: '€', suffix: '/MESE', anchor: [818, 1024], card: [556, 1262], side: 'below' },
  ],

  // Metriche: viz = 'range' (scala con segmento evidenziato), 'check', 'live'
  metrics: [
    { label: 'CONSEGNA', value: '2–5 GIORNI', viz: 'range', range: [2, 5], scale: 14, note: 'GG 1 → 14' },
    { label: 'REVISIONI', value: 'INCLUSE', viz: 'check', note: 'NEL PREZZO' },
    { label: 'SUPPORTO', value: 'DIRETTO', viz: 'live', note: 'CANALE 1:1' },
  ],

  coverage: {
    title: 'COPERTURA — ITALIA',
    note: 'OPERATIVITÀ 100% DIGITALE',
    counterLabel: 'REGIONI',
    counter: [20, 20],
    center: [12.45, 41.85], // lon, lat su cui si centra lo zoom
    // label: 'r' (destra) o 'l' (sinistra) del pin
    pins: [
      { name: 'TORINO', lon: 7.69, lat: 45.07, label: 'l' },
      { name: 'MILANO', lon: 9.19, lat: 45.46, label: 'r' },
      { name: 'VENEZIA', lon: 12.33, lat: 45.44, label: 'r' },
      { name: 'BOLOGNA', lon: 11.34, lat: 44.49, label: 'r' },
      { name: 'FIRENZE', lon: 11.25, lat: 43.77, label: 'l' },
      { name: 'ROMA', lon: 12.50, lat: 41.90, label: 'l' },
      { name: 'NAPOLI', lon: 14.27, lat: 40.85, label: 'l' },
      { name: 'BARI', lon: 16.87, lat: 41.12, label: 'r' },
      { name: 'CAGLIARI', lon: 9.11, lat: 39.22, label: 'l' },
      { name: 'PALERMO', lon: 13.36, lat: 38.12, label: 'l' },
    ],
  },

  cta: 'scrivici in DM · limitlessmedia.it',
};

if (typeof module !== 'undefined') module.exports = CONTENT;
else window.CONTENT = CONTENT;
