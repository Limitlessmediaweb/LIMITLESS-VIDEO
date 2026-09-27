/*
 * CONTENUTI DEL VIDEO — l'unico file da modificare per un immobile reale.
 *
 * Coordinate: pixel del video finale 1080x1920 (origine in alto a sinistra),
 * tranne i punti SULLA FOTO, che sono frazioni 0..1 della foto (x, y), così
 * cambiando foto basta ritoccare quei numeri guardando l'immagine.
 * Safe zone TikTok (testo vietato): y < 150, y > 1540, x > 940.
 * Il check automatico in tools/record.js verifica i testi durante tutta la timeline.
 *
 * Dopo aver cambiato `location.center` rilancia:  npm run map
 */
const CONTENT = {
  // Palette scura, accento oro usato con parsimonia.
  theme: {
    bg: '#07080a',
    fg: '#f2f3f5',
    dim: 'rgba(242,243,245,0.52)',
    line: 'rgba(242,243,245,0.20)',
    accent: '#d4b27a', // oro
    accentRGB: '212,178,122',
  },

  photo: {
    src: '../assets/villa.jpg', // relativo a src/index.html
    // riquadro della foto nel video (px). 900x1125 = 4:5
    box: [90, 250, 900, 1125],
    // riquadro della casa nella foto (frazioni: x1, y1, x2, y2) → frame del reticolo
    house: [0.12, 0.26, 0.88, 0.78],
  },

  subject: {
    name: 'VILLA CHIARA',
    tag: 'OBJ_01 — VILLA',
    category: 'VILLA INDIPENDENTE · ITALIA',
    match: 100, // % "rilevamento" mostrata dopo la scansione
  },

  hud: {
    title: 'VILLA CHIARA / ANALISI',
    sections: ['01 — RILEVAMENTO', '02 — SPECIFICHE', '03 — POSIZIONE', '04 — VALUTAZIONE', '05 — CONTATTO'],
  },

  // Callout specifiche.
  //  anchor = punto sulla foto (frazioni x, y)
  //  card   = angolo alto-sinistra della card (px video)
  //  side   = 'above' (la riga della card è in basso, la linea sale dall'anchor)
  //           'below' (riga in alto, la linea scende)
  //  count  = numero che conta da 0 (sostituisce {n} in `main`); ometti se non serve
  //  viz    = 'energy' mostra la scala A→G con la classe evidenziata
  specs: [
    { meta: 'SUPERFICIE', count: 180, main: '{n} MQ', sub: 'SU 2 LIVELLI', anchor: [0.36, 0.30], card: [110, 312], side: 'above' },
    { meta: 'AMBIENTI', count: 4, main: '{n} CAMERE', sub: '3 BAGNI', anchor: [0.74, 0.50], card: [560, 312], side: 'above' },
    { meta: 'EFFICIENZA', main: 'CLASSE A', sub: 'CLASSE ENERGETICA', viz: 'energy', energy: 'A', anchor: [0.50, 0.66], card: [110, 1128], side: 'below' },
    { meta: 'ESTERNO', count: 500, main: '{n} MQ', sub: 'GIARDINO', anchor: [0.80, 0.86], card: [560, 1128], side: 'below' },
  ],

  // Posizione: globo wireframe → zoom sull'Italia → isocrone attorno all'immobile.
  location: {
    title: 'POSIZIONE — ITALIA',
    note: 'TEMPI IN AUTO · SCHEMA NON IN SCALA',
    center: [11.10, 42.75], // lon, lat dell'immobile (anche centro dello zoom)
    pinLabel: 'VILLA CHIARA',
    // bearing: direzione in gradi (0 = nord, 90 = est); label: 'r' | 'l'
    places: [
      { name: 'CENTRO', minutes: 5, bearing: 52, label: 'r' },
      { name: 'MARE', minutes: 12, bearing: 248, label: 'l' },
      { name: 'AEROPORTO', minutes: 25, bearing: 148, label: 'r' },
    ],
    maxMinutes: 25, // il cerchio più grande (raggio 300px)
  },

  price: {
    meta: 'PREZZO RICHIESTO',
    value: 450000,
    currency: '€',
    note: 'TRATTABILE',
  },

  cta: 'presentato con LIMITLESS · limitlessmedia.it',

  duration: 18,
};

if (typeof module !== 'undefined') module.exports = CONTENT;
else window.CONTENT = CONTENT;
