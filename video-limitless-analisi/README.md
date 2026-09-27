# LIMITLESS — video "analisi"

Video verticale 1080×1920 (9:16) di 19 secondi, per TikTok e Reels. Mostra il brand LIMITLESS
come se venisse *letto* da un'interfaccia: prima scansione, poi callout dei servizi, metriche e
copertura su mappa, infine il contatto. Non c'è voce fuori campo: dati e callout compaiono in
sequenza sopra un soggetto fermo, con un'estetica da dashboard fintech.

| File | Cosa è |
|---|---|
| `out/limitless-analisi.mp4` | Video finale: H.264 High 4.1, yuv420p, BT.709, CRF 18, preset slow, 30 fps, AAC stereo muto, `+faststart` |
| `out/contact-sheet.jpg` | Verifica: un frame al secondo (preso a metà di ogni secondo), con le safe zone TikTok evidenziate in rosso |
| `content.js` | **L'unico file da modificare** per un altro soggetto: testi, prezzi, posizioni, colori, pin |
| `src/` | La pagina: `index.html`, `style.css`, `main.js` (timeline GSAP), `globe-data.js` (generato) |
| `tools/` | Generazione della mappa, registrazione CDP, encoding e verifica |

## Sequenza

| Tempo | Scena | Cosa succede |
|---|---|---|
| 0 – 2 s | Apertura | Fondo scuro piatto. Il wordmark LIMITLESS, centrato e statico, si accende piano |
| 2 – 4 s | Scan | Compaiono l'HUD e la griglia a punti. Una linea di scansione attraversa il logo dall'alto in basso e tinge le lettere mentre passa. Poi si forma il frame (angoli, tick, reticolo) con le etichette `OBJ_01 — BRAND`, `MATCH 99.8%` e la categoria |
| 4 – 10 s | Servizi | 4 callout, uno ogni 1,2 s. Per ciascuno: anchor sul frame, linea che si disegna, riga della card, testo, prezzo che conta fino al valore. Quando arriva il callout successivo il precedente si abbassa di tono; alla fine tornano tutti pieni per un momento |
| 10 – 13 s | Metriche | Il soggetto sale in alto e diventa l'intestazione. Tre righe da dashboard: CONSEGNA con scala 1–14 giorni e segmento 2–5 evidenziato, REVISIONI con barra piena e spunta, SUPPORTO con punto "live" e segnale |
| 13 – 16,5 s | Copertura | Globo wireframe intero, poi zoom sull'Italia. Si accendono in sequenza 10 pin con etichetta e il contatore REGIONI arriva a 20/20 |
| 16,5 – 19 s | Chiusura | Tutto si dissolve e il wordmark torna al centro. Sotto compare `scrivici in DM · limitlessmedia.it` in bianco al 60% |

Per tutto il video c'è anche uno zoom camera lentissimo, da 100% a 104%, lineare sulla scena.
L'HUD (angoli, timecode, sezione, barra di avanzamento) resta fisso e non viene zoomato, così il
movimento crea una leggera parallasse tra interfaccia e scena.

## Scelte di stile

- **Palette**: fondo `#07080a`, testo `#f2f3f5`, grigi a opacità ridotta e un solo accento freddo
  (`#8fb3ff`), usato con parsimonia per pin, scan, anchor e barre. Tutti i colori sono in
  `content.js → theme`.
- **Font**: Inter (300/400/500) per wordmark e valori, JetBrains Mono per etichette e dati. Sono
  inclusi in `src/fonts` e non vengono scaricati da internet durante la registrazione. Il sito
  limitlessmedia.it non era raggiungibile da questo ambiente: Inter è un sostituto grotesk sobrio.
  Se il sito usa un altro font, basta sostituire i file `.woff2` e le regole `@font-face` in
  `style.css`.
- **Movimento**: solo `power2/power3` e `sine`, mai `back`/`elastic`: niente bounce e niente
  overshoot. Le entrate durano 0,5–0,9 s, gli spostamenti del soggetto 1,1–1,3 s.
- **Niente gradienti ampi sul fondo**: su nero, in H.264 8 bit, diventano anelli visibili
  (banding). Il fondo è quindi piatto, con una griglia a punti discreta. In fase di encoding si
  aggiunge anche una grana *statica* molto leggera (`GRAIN=0.22`) che fa da dithering. Essendo
  fissa, non crea flicker e costa poco bitrate.
- **Safe zone TikTok** (sul frame 1080×1920): nessun testo in `y < 150`, `y > 1540`, `x > 940`.
  `tools/record.js` lo verifica automaticamente prima di registrare (vedi sotto).

## Come si rigenera

Servono Node 18+, Playwright con Chromium e ffmpeg con libx264.

```bash
cd video-limitless-analisi
npm install          # gsap, font, world-atlas, d3-geo (servono solo per rigenerare asset/mappa)
npm run globe        # solo se cambi content.coverage (centro o pin)
npm run video        # record → encode → verify
```

Per l'anteprima apri `src/index.html` nel browser: la timeline parte da sola. Con `?t=12` la
pagina si ferma a quell'istante.

### Registrazione (`tools/record.js`)

1. **Audit safe zone**: la timeline viene fatta avanzare a passi di 0,1 s. A ogni passo, per ogni
   nodo di testo visibile (opacità > 0,03) si misurano i veri limiti dei glifi con
   `Range.getBoundingClientRect`, con lo zoom camera già applicato. Se un testo cade in una zona
   vietata, lo script si ferma e dice quale testo, in quale istante e in quale posizione.
2. **Cattura con CDP `Page.startScreencast`**, non con `recordVideo`. Viewport 540×960 con
   `deviceScaleFactor: 2`, PNG a 1080×1920.
   - Serve anche il flag di lancio `--force-device-scale-factor=2`. Senza, lo screencast di
     Chromium headless restituisce frame a 540×960 anche con DPR 2, e il video finale verrebbe
     solo ingrandito.
   - La timeline GSAP gira a **timeScale 0,1** (190 s reali per 19 s di video). Così lo screencast
     produce circa 300 frame per ogni secondo di timeline, anche nei punti pesanti come lo zoom
     del globo SVG.
3. **Rimappatura del tempo**: il tempo di ogni frame sulla timeline è
   `(timestamp CDP − istante di play) × timeScale`. Le durate esatte finiscono in
   `build/frames.ffconcat`.

### Encoding (`tools/encode.sh`)

ffmpeg legge il concat con le durate reali di ogni frame e ricostruisce un video a **frame rate
costante** (`fps=30:round=near`). Poi applica la grana statica, converte in BT.709 (limited range)
e yuv420p, ed esporta:
`libx264 -profile:v high -level 4.1 -preset slow -crf 18 -x264-params aq-mode=3`,
AAC 48 kHz stereo muto (da `anullsrc`), `-movflags +faststart`.
Con `yuv420p` e profilo High il file si apre su Windows, WhatsApp e TikTok. Non usare yuv444p.
Variabili d'ambiente utili: `FPS=60`, `GRAIN=0` e `OUT=out/altro.mp4`.

### Verifica (`tools/verify.js`)

Estrae dal file mp4 un frame a metà di ogni secondo e ne misura la luminanza con `signalstats`.
Un frame il cui pixel più chiaro ha Y ≤ 120 viene segnalato come **VUOTO** (nel frame non c'è
testo né linea). Poi compone `out/contact-sheet.jpg` con le safe zone sovrapposte, per
controllare a occhio che nessun testo sia tagliato. Nell'ultima esecuzione: 19 frame, 0 vuoti,
audit safe zone OK.

## Riusare il template su un altro soggetto

Si cambia solo `content.js`:

- `subject.wordmark / tag / category / match`: il soggetto al centro. Per un prodotto o un sito
  cliente si mette il nome, per esempio `tag: 'OBJ_01 — SITO'`.
- `services[]`: da 1 a 4 callout. `anchor` è il punto sul frame del soggetto (il frame va da
  x 160 a 920 e da y 896 a 1024), `card` è l'angolo in alto a sinistra della card, `side` vale
  `above` o `below`. La card deve coprire in orizzontale la x dell'anchor, perché la linea scende
  o sale in verticale fino alla riga della card.
- `metrics[]`: `viz` può valere `range` (scala con segmento evidenziato), `check` (barra e spunta)
  o `live` (punto e segnale).
- `coverage`: `center` è il punto su cui si centra lo zoom, `pins` sono lon/lat con l'etichetta
  a destra (`r`) o a sinistra (`l`). Dopo ogni modifica va lanciato `npm run globe`. Per un
  paese diverso dall'Italia bisogna cambiare anche l'id ISO numerico in
  `tools/build-globe.js` (`'380'`), e se serve il valore `R` per la scala.
- `cta`, `hud.sections` e `theme`.

Poi si lancia `npm run video`. Se l'audit segnala un testo fuori safe zone, bisogna spostare la
card o accorciare il testo.

## Struttura

```
video-limitless-analisi/
├── content.js            # contenuti + tema (unico file da toccare)
├── src/
│   ├── index.html        # stage 1080×1920 → camera (zoom) + HUD fisso
│   ├── style.css
│   ├── main.js           # costruisce il DOM da CONTENT, timeline GSAP unica
│   ├── globe-data.js     # generato: path SVG del globo ortografico + pin proiettati
│   ├── vendor/gsap.min.js
│   └── fonts/            # Inter, JetBrains Mono (woff2)
├── tools/
│   ├── build-globe.js    # world-atlas 50m + d3-geo → globe-data.js
│   ├── record.js         # audit safe zone + CDP screencast + ffconcat
│   ├── encode.sh         # ffmpeg → mp4 H.264/AAC
│   └── verify.js         # frame vuoti + contact sheet
└── out/                  # mp4 finale + contact sheet
```

`build/` contiene i frame PNG grezzi (circa 3 GB). È in `.gitignore` e si rigenera.
