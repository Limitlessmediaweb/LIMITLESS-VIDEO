# Villa Chiara — video immobile "analisi"

Video verticale 1080×1920 (9:16) di 18 secondi per TikTok e Reels. Presenta un immobile in vendita
come se fosse *analizzato* da un'interfaccia. Non è il solito giro fotografico stanza per stanza:
c'è un'unica foto ferma della villa e sopra compaiono, uno dopo l'altro, scansione, callout con i
dati, posizione su mappa e prezzo. Lo stile è quello dei video Nòttea e LIMITLESS
(`../video-limitless-analisi`), da cui questo progetto riprende pipeline e strumenti.

La foto della villa (`assets/villa.jpg`, 1600×2000) è stata generata con Higgsfield (GPT Image 2.5,
4:5, qualità alta, luce calda al tramonto, stile fotografia immobiliare) ed è inventata come
l'immobile. I callout puntano a tetto, finestra del primo piano, portone e prato.

| File | Cosa è |
|---|---|
| `out/villa-chiara-analisi.mp4` | Video finale: H.264 High 4.1, yuv420p, BT.709, CRF 18, preset slow, 30 fps, AAC stereo muto, `+faststart` |
| `out/contact-sheet.jpg` | Verifica: un frame al secondo (a metà di ogni secondo), con le safe zone TikTok evidenziate in rosso |
| `content.js` | **L'unico file da modificare** per un immobile reale: foto, dati, posizioni, prezzo, colori |
| `assets/villa.jpg` | La foto dell'immobile (4:5 consigliato, almeno 1800 px di altezza) |
| `src/` | La pagina: `index.html`, `style.css`, `main.js` (timeline GSAP), `map-data.js` (generato) |
| `tools/` | Mappa, registrazione CDP, encoding, verifica, anteprime |

## Sequenza

| Tempo | Scena | Cosa succede |
|---|---|---|
| 0 – 2 s | Apertura | Fondo nero. La foto (900×1125, centrata, filo sottile attorno) sale dal nero, ferma |
| 2 – 4 s | Scan | Compaiono l'HUD e la griglia a punti. Una linea di scansione oro attraversa la foto dall'alto in basso e la foto si abbassa leggermente di tono. Poi si forma il frame attorno alla casa (angoli, tick, reticolo) con `OBJ_01 — VILLA`, `RILEVAMENTO 100%` e `VILLA INDIPENDENTE · ITALIA` |
| 4 – 9 s | Specifiche | 4 callout, uno al secondo: anchor oro sul punto della foto (tetto, finestre, ingresso, giardino), linea che si disegna, riga della card, pannello, testi e numero che conta fino al valore. La classe energetica ha una scala A→G con la A in oro. Quando arriva il callout successivo il precedente si abbassa di tono. Verso la fine tornano tutti pieni per un momento |
| 9 – 13 s | Posizione | Nel riquadro della foto: globo wireframe intero, poi zoom sull'Italia (evidenziata in oro). Si accende il pin dell'immobile, si espandono tre cerchi isocroni tratteggiati e i pin CENTRO 5 MIN, MARE 12 MIN e AEROPORTO 25 MIN compaiono in sequenza, ognuno collegato da una linea |
| 13 – 15 s | Prezzo | Un unico callout centrale, più grande degli altri: angoli oro, `PREZZO RICHIESTO`, `€ 450.000` che conta fino al valore, riga oro, `TRATTABILE` |
| 15 – 18 s | Chiusura | Si dissolvono prezzo, HUD e griglia. La foto torna piena e sotto compare `presentato con LIMITLESS · limitlessmedia.it` in bianco al 60% |

Per tutto il video c'è anche uno zoom camera lentissimo, da 100% a 104%, lineare sulla scena.
L'HUD (angoli, timecode, sezione, barra di avanzamento) resta fisso e non viene zoomato, così il
movimento crea una leggera parallasse tra interfaccia e scena.

## Scelte di stile

- **Palette**: nero `#07080a`, bianco `#f2f3f5` per i testi e **oro `#d4b27a`** come unico accento,
  usato con parsimonia (scan, anchor, pin, prezzo). Tutti i colori sono in `content.js → theme`.
- **Font**: Inter (300/400/500) per i valori, JetBrains Mono per etichette e dati. Sono gli stessi
  del video LIMITLESS, inclusi in `src/fonts`, e non vengono scaricati durante la registrazione.
- **Leggibilità sulla foto**: la foto non viene sfocata. Durante i dati viene coperta da un velo nero
  (22% nella scansione, 42% nelle specifiche, 62% nel prezzo) e ogni card ha un pannello nero al
  62%. Il testo resta leggibile anche su un cielo chiaro o un prato illuminato.
- **Movimento**: solo `power2/power3` e `sine`, mai `back`/`elastic`: niente bounce e niente
  overshoot. Le entrate durano 0,5–0,9 s e lo zoom della mappa 1,4 s.
- **Mappa**: stesso globo wireframe del video LIMITLESS (world-atlas 50m, d3-geo ortografico),
  centrato sull'immobile. A scala regionale 25 minuti d'auto sarebbero pochi pixel, quindi le
  distanze sono uno **schema** e lo si dichiara nel riquadro ("SCHEMA NON IN SCALA"): il raggio è
  proporzionale a √minuti (il più lontano a 300 px), e la direzione è data da `bearing`.
- **Fondo piatto**: su nero, in H.264 8 bit, i gradienti ampi diventano anelli visibili (banding).
  In encoding si aggiunge una grana *statica* leggera (`GRAIN=0.22`) che fa da dithering.
- **Safe zone TikTok** (sul frame 1080×1920): nessun testo in `y < 150`, `y > 1540`, `x > 940`.
  `tools/record.js` lo verifica prima di registrare.

## Come si rigenera

Servono Node 18+, Playwright con Chromium e ffmpeg con libx264.

```bash
cd video-immobile-analisi
npm install          # d3-geo, topojson, world-atlas (solo per rigenerare la mappa)
npm run map          # solo se cambi location.center
node tools/snap.js 3.8 6.5 11.8 14.5 17.5   # anteprime rapide in build/snap/ (facoltativo)
npm run video        # record → encode → verify
```

Per l'anteprima dal vivo apri `src/index.html` nel browser. Con `?t=12` la pagina si ferma a
quell'istante.

### Registrazione (`tools/record.js`)

1. **Audit safe zone**: la timeline avanza a passi di 0,1 s. A ogni passo si misurano i veri limiti
   dei glifi di ogni testo visibile (`Range.getBoundingClientRect`), con lo zoom camera già
   applicato. Se un testo esce dalla safe zone lo script si ferma e dice quale testo, quando e dove.
2. **Cattura con CDP `Page.startScreencast`**, non con `recordVideo`. Viewport 540×960 con
   `deviceScaleFactor: 2`, PNG a 1080×1920. Serve anche il flag `--force-device-scale-factor=2`:
   senza, lo screencast headless restituisce frame a 540×960. La timeline GSAP gira a
   **timeScale 0,1** (180 s reali per 18 s di video), così si ottengono circa 200–300 frame per secondo
   di timeline, a seconda del peso della foto.
3. **Rimappatura del tempo**: ogni frame viene riportato sulla timeline con
   `(timestamp CDP − istante di play) × timeScale`. Le durate esatte finiscono in
   `build/frames.ffconcat`.

### Encoding (`tools/encode.sh`)

ffmpeg legge il concat con le durate reali di ogni frame e ricostruisce un video a **frame rate
costante** (`fps=30:round=near`). Poi aggiunge la grana statica, converte in BT.709 limited e
yuv420p, ed esporta con
`libx264 -profile:v high -level 4.1 -preset slow -crf 18 -pix_fmt yuv420p`, AAC 48 kHz stereo
muto (`anullsrc`) e `-movflags +faststart`. Non usare mai yuv444p, perché non si apre su
Windows, WhatsApp e molti telefoni. Variabili utili: `FPS=60`, `GRAIN=0` e `OUT=out/altro.mp4`.

### Verifica (`tools/verify.js`)

Estrae un frame a metà di ogni secondo e ne misura la luminanza. Dopo il primo secondo, che è una
dissolvenza voluta dal nero, un frame il cui pixel più chiaro ha Y ≤ 120 viene segnalato come
**VUOTO**. Poi compone `out/contact-sheet.jpg` con le safe zone sovrapposte. Ultima esecuzione:
18 frame, 0 vuoti, audit safe zone OK.

## Usarlo su un immobile vero

Si cambia solo `content.js`, più la foto:

1. **Foto**: sostituisci `assets/villa.jpg` con la foto del cliente. Il formato 4:5 verticale riempie
   il riquadro senza tagli; con altri formati la foto viene ritagliata al centro (`object-fit: cover`).
   Per cambiare dimensioni o posizione del riquadro modifica `photo.box`.
2. **`photo.house`**: il rettangolo della casa nella foto, in frazioni `[x1, y1, x2, y2]` da 0 a 1.
   Serve per il frame della scansione.
3. **`specs[]`**: fino a 4 callout.
   - `anchor`: il punto indicato, in frazioni della foto (per esempio `[0.5, 0.3]` = centro, al 30%
     dall'alto).
   - `card`: l'angolo in alto a sinistra della card, in pixel del video. Le card sono larghe 370 px.
   - `side: 'above'` se la card sta sopra l'anchor, `'below'` se sta sotto.
   - `count`: il numero che conta fino al valore, al posto di `{n}` in `main`.
   - `viz: 'energy'` con `energy: 'B'` (per esempio) per la scala energetica.

   La linea sale o scende in verticale dall'anchor fino alla riga della card. Se l'anchor è fuori
   dalla card, la linea prosegue in orizzontale fino al bordo.
4. **`location`**: `center` va messo sulle coordinate reali (lon, lat), e poi va lanciato
   `npm run map`. `places` contiene nome, minuti e direzione (`bearing`, 0 = nord, 90 = est) di
   ogni meta; `maxMinutes` deve essere il tempo più lungo. Per un paese diverso dall'Italia cambia
   `COUNTRY` in `tools/build-map.js`.
5. **`price`**, **`subject`**, **`hud`**, **`cta`**, **`theme`**.

Poi lancia `node tools/snap.js 6 8.5 12.3 14.5` per controllare le posizioni, e infine
`npm run video`. Se l'audit segnala un testo fuori safe zone, sposta la card o accorcia il testo.

## Struttura

```
video-immobile-analisi/
├── content.js            # contenuti + tema (unico file da toccare)
├── assets/villa.jpg      # foto dell'immobile
├── src/
│   ├── index.html        # stage 1080×1920 → camera (zoom) + HUD fisso
│   ├── style.css
│   ├── main.js           # costruisce il DOM da CONTENT, timeline GSAP unica
│   ├── map-data.js       # generato: globo ortografico centrato sull'immobile
│   ├── vendor/gsap.min.js
│   └── fonts/            # Inter, JetBrains Mono (woff2)
├── tools/
│   ├── build-map.js      # world-atlas 50m + d3-geo → map-data.js
│   ├── record.js         # audit safe zone + CDP screencast + ffconcat
│   ├── encode.sh         # ffmpeg → mp4 H.264/AAC
│   ├── verify.js         # frame vuoti + contact sheet
│   └── snap.js           # screenshot a istanti scelti (anteprima veloce)
└── out/                  # mp4 finale + contact sheet
```

`build/` contiene i frame PNG grezzi (alcuni GB). È in `.gitignore` e si rigenera.
