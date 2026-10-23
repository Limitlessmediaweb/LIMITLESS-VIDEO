# LIMITLESS · social-wow — 3 contenuti "wow" per TikTok e Instagram

Tre video verticali 1080×1920 (9:16), 30 fps, H.264 yuv420p con traccia audio muta e `+faststart`,
fatti interamente in codice (HTML + GSAP + canvas, render fotogramma per fotogramma con Playwright,
export con ffmpeg). Zero crediti, zero foto, zero brani protetti. Tutti i marchi sono inventati e
dichiarati come concept dentro il video.

| # | File | Obiettivo | Durata | Copertina |
|---|---|---|---|---|
| 1 | `out/01-struttura-spot.mp4` | **Da salvare** (valore) | 20 s | `out/01-struttura-spot-cover.jpg` |
| 2 | `out/02-scan-bottiglia.mp4` | **Da condividere** (wow visivo) | 18 s | `out/02-scan-bottiglia-cover.jpg` |
| 3 | `out/03-cliente-2241.mp4` | **Porta DM** (lead) | 24 s | `out/03-cliente-2241-cover.jpg` |

I `*-sheet.jpg` in `out/` sono i contact sheet di verifica (un fotogramma al secondo, safe zone
TikTok in rosso): servono solo per controllare, non vanno pubblicati.

> **Nota sulle foto.** Dal cloud Unsplash e Pexels non erano raggiungibili (il proxy risponde 403),
> quindi i tre video sono stati progettati senza fotografie: tutto è interfaccia, tipografia e
> grafica procedurale, che è anche lo stile LIMITLESS "prodotto letto come un'interfaccia".
> In fondo c'è la sezione "Dove inserire una foto" se vuoi aggiungerne una in locale.

---

## 1. Analisi: i 5 meccanismi che oggi fanno funzionare i reel di agenzie e creator

Il reel del proiettile e della lattina funziona perché **rende visibile il tempo**: un contatore di
frame crea un'attesa concreta, lo spettatore guarda per 7 secondi un oggetto che non esiste, e il
colpo di scena ("hai appena guardato…") ribalta la cornice e la aggancia al servizio. Da lì i
meccanismi che oggi contano, in ordine di peso:

1. **Hook nei primi 1-2 secondi con un numero o un'attesa.** Un cronometro, un conto alla rovescia,
   una domanda con una scadenza. Il cervello vuole vedere come finisce. I nostri 3 video partono
   tutti con un numero grande (00:00.00, "PUNTI 0", "22:41").
2. **Reveal / ribaltamento al 60-70 %.** Qualcosa che sembrava una cosa è un'altra ("era un
   render", "era un concept", "è successo senza che tu lo sapessi"). Il reveal si piazza quando il
   retention sta per calare e rilancia.
3. **Prima/dopo nello stesso frame.** Il confronto istantaneo (stessa scena, due esiti) è il formato
   più capito senza audio. Nel video 3 è "stessa sera, stesso cliente, con e senza video".
4. **Dietro le quinte "da ingegnere".** Non il montaggio a caso ma il *metodo* mostrato come un
   processo: misure, scansione, timeline con il righello. Dà autorevolezza e fa salvare.
5. **Loop e POV.** Il finale che si riaggancia all'inizio fa ripartire la riproduzione (view
   doppia); il POV ("sta guardando la tua attività") mette lo spettatore dentro la scena. Il video 3
   usa il POV del cliente, non quello dell'agenzia.

Cosa **non** prendere dal reel ispiratore: il proiettile, la lattina, il voice-over "hai appena
guardato X secondi" ripetuto pari pari. Preso solo il meccanismo: tempo reso visibile + sorpresa +
aggancio al servizio.

## 2. Le 6 idee (direzione nuova: "il tempo e i numeri del cliente resi visibili")

Punteggi 1-5: **V** views (hook, rewatch) · **I** interazioni · **L** lead · **S** sforzo (5 = facile).

| # | Idea | Hook (0-2 s) | Scaletta | Perché dovrebbe funzionare | V | I | L | S |
|---|---|---|---|---|---|---|---|---|
| A ✅ | **Uno spot che vende, in tempo reale** | Cronometro 00:00.00 + "Uno spot che vende dura 15 secondi" | 15 s "veri" con un righello che avanza: HOOK 0-2, PROVA 2-6, OFFERTA 6-10, CTA 10-15, ognuno con la regola in una riga. Finale: "Hai appena visto la struttura di uno spot. Salvalo." | Lo spettatore *sente* quanto dura un hook; è una checklist travestita da esperienza. Salva chi deve fare uno spot | 4 | 4 | 3 | 4 |
| B ✅ | **Prima di filmarla, la leggiamo** (scansione bottiglia) | Linea di scansione che scende e un contatore "PUNTI 0 → 3.600" | Nuvola di punti che diventa bottiglia → misure con quote → materia e luce → etichetta → "Il tuo prodotto, letto così. Mandalo a chi lo produce." | Bello da guardare anche muto, sembra tecnologia da studio grande, chi fa vino/olio/cosmetica lo manda al collega | 5 | 4 | 3 | 3 |
| C ✅ | **22:41, un cliente sta guardando la tua attività** | "22:41" enorme + cronometro che parte | Scheda attività senza video: chip "foto 2019", "orari —", "video 0"; a 3,4 s scorre via → PERSO. Riavvolgi: stessa scheda con un video di 15 s → guarda, prenota. Finale: "Quanti ne perdi stasera? Commenta CONTROLLO" | Paura concreta e riconoscibile per ogni titolare, con la soluzione mostrata e un regalo (controllo gratuito) che porta in DM | 4 | 5 | 5 | 3 |
| D | **Hai appena letto 40 parole** | Le parole appaiono una alla volta con il contatore | Dopo 8 s: "Hai letto 40 parole. Il tuo cliente non ne legge 40 sul tuo sito. Guarda un video." | Meta-trucco forte ma troppo vicino al reel ispiratore; rischia di sembrare copiato | 4 | 3 | 2 | 5 |
| E | **Una riga di codice** (prima/dopo) | Foto piatta di un locale, un terminale digita `limitless.render(foto)` | La foto diventa cinematografica: grade, titoli, HUD | Mostra il "come" ma vende l'idea che sia automatico: abbassa il valore percepito del lavoro. Serve anche una foto reale | 3 | 3 | 2 | 4 |
| F | **La tua attività vista dall'algoritmo** | Scansione di una scheda con tag che si accendono | Punteggio in tempo reale, voce "ecco cosa vede chi ti cerca" | Buona ma si sovrappone a C: è stata **fusa dentro C** (le chip di scansione sulla scheda) | 3 | 4 | 4 | 4 |

**Scelta**: A (da salvare), B (da condividere), C (DM). Sono diversi tra loro per meccanismo
(tempo reale / scansione 3D / simulazione con ribaltamento), per soggetto (spot, prodotto, scheda)
e per CTA (salva / condividi / commenta). D ed E restano nel parcheggio idee; F è dentro C.

---

## 3. I tre video

### Video 1 · "Uno spot che vende, in tempo reale" (20 s) — da salvare
**Concept**: Cascina Vallerosa, agriturismo inventato.

| Tempo | Cosa succede |
|---|---|
| 0-1,2 s | Titolo grande "Uno spot che *vende* dura 15 secondi." Sottotitolo "Cronometro alla mano." |
| 1,2 s | Il titolo si abbassa, parte il cronometro (mono 132 px), compare il pannello "SPOT" con il contatore di frame e il righello 0-15 s |
| 1,2-3,2 | **HOOK**: "Domenica." in serif corsivo, poi "Pranzo in cascina." Callout: "01 · HOOK · 0-2 s — Una frase, non il logo." |
| 3,2-7,2 | **PROVA**: 3 inquadrature da storyboard (cucina, tavola, cortile) che si disegnano a linea. "Il posto, non le promesse." |
| 7,2-11,2 | **OFFERTA**: "MENÙ DELLA DOMENICA · 32 €" con il prezzo che conta. "Un numero chiaro." |
| 11,2-16,2 | **CTA**: bottone "Prenota su WhatsApp", tap, "RICHIESTA INVIATA ✓", wordmark. "Una sola azione." |
| 16,2-20 | Il cronometro si ferma a 00:15.00 e diventa blu. "Hai appena visto la struttura di uno spot." → "4 blocchi. 15 secondi. *Salvalo* per il prossimo." |

- **Caption**: "Uno spot che vende dura 15 secondi, e si divide in 4 blocchi. Li abbiamo messi sotto cronometro: hook, prova, offerta, azione. Vale per un agriturismo, una cantina, un centro estetico. Salvalo prima di girare il prossimo. 🎬"
- **CTA**: "Salvalo" (nel video) + in caption "Commenta SPOT e ti mando lo schema dei 4 blocchi".
- **Hashtag**: #videomarketing #attivitàlocali #spotpubblicitario #marketingitalia #agriturismo
- **Orario**: martedì o giovedì 12:30-13:30 (contenuto "da studiare" in pausa pranzo). Secondo slot: domenica 18:00-19:00.
- **Etichetta AI**: **no**. È motion graphics fatta in codice, nessun contenuto generato da AI (testo, voce o immagini).
- **Serie**: "Sotto cronometro" — ogni puntata un formato con il righello: il reel da 30 s, la story da 7 s, il walk tour da 45 s, il video per il sito da 60 s. Stesso pannello, stesso righello, blocchi diversi.
- **Musica**: beat elettronico pulito e minimale, 100-110 BPM, senza drop; i blocchi cambiano a 1,2 / 3,2 / 7,2 / 11,2 / 16,2 s. Dalla libreria "Suoni commerciali" dell'app. Alternativa libera: Kevin MacLeod, "Cipher" (CC BY 4.0, incompetech.com, citare l'autore in caption).

### Video 2 · "Prima di filmarla, la leggiamo" (18 s) — da condividere
**Concept**: Cantina Roccabruna, bottiglia di rosso inventata.

| Tempo | Cosa succede |
|---|---|
| 0-0,9 s | Titolo "Prima di filmarla, la *leggiamo*." Readout "PUNTI 0 · ROT 000° · H 300 mm" |
| 0,4-4,2 | Una linea di scansione scende: la bottiglia appare come nuvola di 3.600 punti (il contatore conta i punti davvero visibili), con rotazione lenta |
| 4,4-8,4 | Anelli che si disegnano; quote con linee: ALTEZZA 300 mm, DIAMETRO Ø 76 mm, COLLO Ø 28 mm, ETICHETTA 90 × 110 mm |
| 8,6-10,4 | La rotazione si ferma frontale, i punti svaniscono e la bottiglia si materializza (vetro verde, vino, riflesso da sinistra, luce di bordo) |
| 9,4-11,7 | Callout: VETRO verde antico · LUCE una fonte, da sinistra · ANGOLO 12°, tre quarti |
| 12-15,3 | Compare l'etichetta "Cantina Roccabruna · Rosso · Oltrepò". "ETICHETTA · OK". Sottotitolo "Poi, e solo poi, si filma." |
| 15,3-18 | La bottiglia si abbassa di tono. "Il tuo prodotto, letto *così*." → "Mandalo a chi lo *produce*." |

- **Caption**: "Prima di accendere la camera, leggiamo il prodotto: misure, proporzioni, dove cade la luce. Solo dopo si filma. Questa è una bottiglia che non esiste (concept): la tua esiste. Mandalo a chi la produce. 🍷"
- **CTA**: "Mandalo a chi lo produce" (condivisione) + in caption "Commenta PRODOTTO per sapere come lo leggeremmo".
- **Hashtag**: #cantina #vinoitaliano #videoprodotto #motiongraphics #madeinitaly
- **Orario**: domenica 11:00-12:30 (è il contenuto bello da guardare e inoltrare nel weekend). Secondo slot: mercoledì 19:00-21:30.
- **Etichetta AI**: **no**. Nuvola di punti e rendering sono calcolati in codice (canvas), non generati da un modello.
- **Serie**: "Letto così" — stessa scansione su altri prodotti concept: un vasetto di miele, un casco, una crema, una chiave di casa (immobiliare). Cambiano profilo, materiale e callout; il codice resta (`R(h)` è il profilo di rivoluzione).
- **Musica**: ambient elettronico lento con un impulso regolare, 75-85 BPM, niente riser. Momenti da far coincidere con un accento: 4,2 s (fine scansione), 8,6 s (materializzazione), 12 s (etichetta). Alternativa libera: Kevin MacLeod, "Floating Cities" (CC BY 4.0).

### Video 3 · "22:41, un cliente sta guardando la tua attività" (24 s) — porta DM
**Concept**: Agriturismo Le Betulle e Trattoria del Ponte, attività inventate. L'interfaccia della scheda è generica, senza loghi o nomi di piattaforme.

| Tempo | Cosa succede |
|---|---|
| 0-1,4 s | "22:41" enorme, poi "Un cliente sta guardando la tua attività." |
| 1,4 s | Parte il cronometro "TEMPO DI DECISIONE". Il telefono mostra la scheda di Le Betulle: 1 foto, orari non indicati, nessun video |
| 2-3,5 | Chip di scansione in ambra: ULTIMA FOTO · 2019, ORARI · —, VIDEO · 0. "Sta *decidendo*." |
| 4,8 s | Il cliente scorre via: compare la Trattoria del Ponte (con video). Il cronometro si ferma a **00:03.40** in ambra: "PERSO · 3,4 s". "Se n'è andato. *Non lo saprai mai*." |
| 8-10 | Lo schermo si abbassa, il cronometro si riavvolge a zero. "Stessa sera. Stesso cliente. *Con un video*." |
| 10-14,6 | La stessa scheda ha un video di 15 s, orari e 24 foto. Il cronometro gira (da 13,6 s accelera con il badge "×4" fino a 15 s, in modo dichiarato) |
| 15-16,8 | "Prenota" si accende, tap, "RICHIESTA INVIATA ✓". Cronometro blu: "PRENOTATO · 17,2 s". "Ha guardato. *Ha prenotato*." |
| 18,4-24 | "Quanti ne perdi, *stasera*?" → "Commenta **CONTROLLO**. Controlliamo gratis la tua scheda e il tuo profilo. Ti diciamo cosa manca." |

- **Caption**: "Sono le 22:41. Un cliente sta guardando la tua attività dal divano. Senza un video ha 3 secondi per decidere, e di solito scorre. Con un video di 15 secondi resta, e prenota. Commenta CONTROLLO: controlliamo gratis la tua scheda e il tuo profilo e ti diciamo cosa manca. 📍"
- **CTA**: "Commenta CONTROLLO" → in DM si manda un controllo gratuito della scheda e del profilo (3 punti: foto, orari, video) con la proposta dello spot da listino.
- **Hashtag**: #attivitàlocali #ristorazione #agriturismo #marketinglocale #prenotazioni
- **Orario**: **giovedì 21:00-21:30** (l'ora del video coincide con l'ora in cui lo guardano, e il giovedì sera si pianifica il weekend). Secondo slot: domenica 21:00-22:00.
- **Etichetta AI**: **no**. Simulazione disegnata in codice; i "3,4 s" e "17,2 s" sono il tempo della simulazione, non statistiche (il video lo dice: "SIMULAZIONE · CLIENTE 01").
- **Serie**: "Ore 22:41" — stessa scena, un settore per puntata: centro estetico (la cliente che cerca "ceretta vicino a me"), concessionario moto (il ragazzo che guarda l'usato), cantina (la coppia che cerca una degustazione), immobiliare (chi scorre gli annunci). Cambiano scheda, chip e orario nel titolo.
- **Musica**: minimale e teso, piano smorzato o sub-bass con un tick regolare, 90-100 BPM, senza riser; l'accento cade a 4,8 s (PERSO), a 8 s (riavvolgimento) e a 16,8 s (PRENOTATO). Alternativa libera: Kevin MacLeod, "Eternal Hope" (CC BY 4.0), a volume basso.

Regola per la musica in tutti e tre: nessun whoosh, nessun riser, nessun suono "in aspirazione".
Se Riccardo preferisce un suono per i callout, al massimo un click secco e basso (tipo tastiera),
mai swoosh.

---

## 4. Scelte di stile comuni
- **Palette LIMITLESS**: fondo `#07080a`, testo `#f2f3f5`, un solo accento freddo `#8fb3ff`; ambra `#ffb36b` solo per i problemi (video 3) e verde `#8ff0c4` solo per le conferme.
- **Font**: Inter 300/400/500 (testi), JetBrains Mono (dati, cronometri, etichette), Instrument Serif corsivo per **una parola chiave per frase**. Tutti inclusi in `src/shared/fonts`, nessun download durante il render.
- **Testi grandi, safe zone TikTok**: nessun testo sopra y = 150, sotto y = 1540 e a destra di x = 940. `tools/render.js` lo verifica ogni 0,1 s misurando i glifi veri e si ferma se un testo esce (tiene conto degli elementi tagliati da `overflow: hidden`, come lo schermo del telefono).
- **Sottotitoli** in Inter 46 px nella fascia 1385-1500, una riga per idea, con la parola chiave in serif blu.
- **Movimento**: solo `power2`/`power3`, niente bounce, entrate 0,3-0,7 s. Nessuna transizione da template.
- **Grana statica** leggera in fase di encoding (0,2) contro il banding sui neri; non crea flicker.
- "LIMITLESS" in alto a destra al 60 %, angoli dell'HUD, timecode in basso a sinistra, riga "concept" in basso a destra (visibile per tutta la durata: onestà sui brand inventati).

## 5. Come si rigenera
Servono Node 18+, Playwright con Chromium (`/opt/pw-browsers` qui) e ffmpeg con libx264.

```bash
cd social-wow
npm install                                  # solo il font Instrument Serif
node tools/render.js 01-struttura-spot --cover 17.4   # audit safe zone + copertina + 600 PNG in build/
bash tools/encode.sh 01-struttura-spot                 # → out/01-struttura-spot.mp4
bash tools/sheet.sh 01-struttura-spot                  # contact sheet di verifica
# idem per 02-scan-bottiglia (--cover 7.6) e 03-cliente-2241 (--cover 0.9)
node tools/frames.js 02-scan-bottiglia 2 6 10 14       # anteprima rapida di alcuni istanti
```
Per l'anteprima nel browser apri `src/<video>/index.html`: la timeline gira in loop; con `?t=8.5`
si ferma a quell'istante. Ogni pagina espone `window.__seek(t)`: il render è deterministico,
fotogramma per fotogramma, quindi non dipende dalla velocità della macchina.

Testi, tempi e nomi concept si cambiano in `src/<video>/main.js` (costanti in cima e lista dei
sottotitoli) e nell'`index.html`. Nel video 2 il profilo della bottiglia è la funzione `R(h)`.

## 6. Dove inserire una foto (facoltativo, in locale)
- **Video 1**: nel pannello, blocco PROVA, le tre inquadrature a linea possono diventare tre foto
  (`#bProva .shot` → `background-image`), con un `filter: grayscale(.3) contrast(1.05)` per restare
  nella palette. Cerca su Unsplash "farmhouse kitchen", "rustic table", "italian courtyard".
- **Video 3**: la foto grigia "1 FOTO" della scheda (`.photo .ph`) può essere una foto vera
  scura e sfocata; il video a 15 s (`.vid .frames`) può essere una sequenza di 4-8 foto.
- **Video 2**: nessuna foto: la bottiglia è il punto del video.
Cita sempre autore e link nella caption o nel README, anche se la licenza non lo richiede.

## 7. Licenze
- GSAP 3.15 (licenza standard GreenSock, uso gratuito), Inter e JetBrains Mono (OFL), Instrument
  Serif (OFL). Nessun asset di terzi oltre a questi.
- Musica: non inclusa. I file hanno una traccia AAC muta, così l'app accetta il video e si può
  aggiungere un brano dalla libreria commerciale senza problemi di licenza.
