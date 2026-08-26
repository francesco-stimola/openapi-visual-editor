<div align="center">

  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="assets/logo-dark.png">
    <source media="(prefers-color-scheme: light)" srcset="assets/logo-light.png">
    <img alt="OpenAPI Visual Editor" src="assets/logo-light.png" width="62%">
  </picture>

### Editor visuale per Swagger 2.0 e OpenAPI 3.x

**Il file resta nel tuo browser. Nessun upload, nessun backend, nessun account.**

YAML e JSON · modifica visuale · download nel formato originale · nessun backend

[![Demo online](https://img.shields.io/badge/demo-online-2ea44f?logo=githubpages&logoColor=white)](https://francesco-stimola.github.io/openapi-visual-editor/)
[![CI](https://github.com/francesco-stimola/openapi-visual-editor/actions/workflows/ci.yml/badge.svg)](https://github.com/francesco-stimola/openapi-visual-editor/actions/workflows/ci.yml)
[![Deploy](https://github.com/francesco-stimola/openapi-visual-editor/actions/workflows/deploy.yml/badge.svg)](https://github.com/francesco-stimola/openapi-visual-editor/actions/workflows/deploy.yml)
[![Release](https://img.shields.io/github/v/release/francesco-stimola/openapi-visual-editor?sort=semver&label=release)](https://github.com/francesco-stimola/openapi-visual-editor/releases/latest)
[![Immagine Docker](https://img.shields.io/badge/ghcr.io-openapi--visual--editor-2496ed?logo=docker&logoColor=white)](https://github.com/francesco-stimola/openapi-visual-editor/pkgs/container/openapi-visual-editor)
[![License: AGPL v3](https://img.shields.io/badge/license-AGPL--3.0--or--later-blue.svg)](LICENSE)
[![Node](https://img.shields.io/badge/node-%E2%89%A5%2020.19-green.svg)](https://nodejs.org)
[![Dati](https://img.shields.io/badge/dati-solo%20nel%20browser-brightgreen.svg)](#come-funziona)

### ▶ [Provalo subito su francesco-stimola.github.io/openapi-visual-editor](https://francesco-stimola.github.io/openapi-visual-editor/)

[Avvio rapido](#avvio-rapido) · [Ospitarla da te](#ospitarla-da-te) · [Cosa fa](#cosa-fa) · [Come funziona](#come-funziona) · [Changelog](CHANGELOG.md) · [Licenza](#licenza)

</div>

---

## Il problema

Per correggere due righe di una specifica OpenAPI si finisce per incollarla in un editor online:
una copia del contratto delle tue API — endpoint interni, header di autenticazione, nomi di
sistemi — finisce sul server di qualcun altro. Qui il file viene letto con le API `File` del
browser e riscaricato come `Blob` locale: **non esiste una richiesta di rete che lo trasporti
altrove**, perché non esiste proprio un backend.

## Avvio rapido

```bash
npm install
npm run dev        # http://localhost:5173
```

```bash
npm run build      # produce dist/
npm run preview    # serve dist/ su http://localhost:4173
```

Requisiti per lavorarci: Node.js ≥ 20.19 (o ≥ 22.12) e npm ≥ 10. Nessun database e nessun
servizio cloud — e nemmeno Docker, se non per l'immagine pronta qui sotto.

## Ospitarla da te

L'applicazione è fatta di soli file statici: non c'è un backend da far girare, quindi la serve
qualunque server web. Utile se preferisci non dipendere da GitHub Pages, o se deve stare su una
rete interna.

**Con Docker** — un nginx già configurato, pubblicato per `linux/amd64`, `linux/386`,
`linux/arm64`, `linux/arm/v7` e `linux/arm/v6` (Docker sceglie da sé la variante giusta):

```bash
docker run --rm -p 8080:80 ghcr.io/francesco-stimola/openapi-visual-editor:latest
# poi apri http://localhost:8080
```

**Dal pacchetto allegato alla release** — scarica `openapi-visual-editor-<versione>-dist.zip`
dall'[ultima release](https://github.com/francesco-stimola/openapi-visual-editor/releases/latest)
(`SHA256SUMS`, accanto, ne verifica l'integrità), scompattalo e servi la cartella:

```bash
npx serve openapi-visual-editor-<versione>
```

I riferimenti interni sono relativi, quindi funziona anche sotto un sottopercorso
(`https://intranet.esempio.it/strumenti/openapi/`) e non solo sulla radice di un dominio.
Aprire `index.html` con un doppio clic (`file://`) invece no: i browser rifiutano i moduli
JavaScript caricati così, serve un server HTTP.

**Ricompilandola** — `VITE_BASE_PATH=./ npm run build` produce esattamente la stessa `dist/`
del pacchetto; vedi [.env.example](.env.example) per le altre varianti di base path.

In tutti e tre i casi vale l'art. 13 dell'AGPL: se pubblichi una versione modificata, devi
offrirne il sorgente a chi la usa.

## Cosa fa

- Apre file **`.yaml`**, **`.yml`** e **`.json`** dal filesystem, da selettore o **drag & drop**.
- Modifica visuale con il componente `OpenAPIEditor` di
  [Apitomy OpenAPI Editor](https://github.com/Apitomy/apitomy-openapi-editor): info API, path e
  operazioni, schemi, server, tag, sicurezza, parametri, estensioni `x-*`, undo/redo, validazione
  e vista sorgente.
- Crea una **specifica vuota** (OpenAPI 3.0.3, 3.1.0 o Swagger 2.0).
- Scarica la specifica modificata **mantenendo formato e nome originali**, con possibilità di
  convertire YAML ↔ JSON prima del salvataggio.
- Segnala errori di parsing e file non validi **senza perdere il documento già aperto**.
- Interfaccia responsive, verificata fino a 480 px.

## Come funziona

`File.text()` → parsing YAML/JSON → oggetto passato all'editor → `getContent()` → serializzazione
→ `Blob` → download. Tutto in memoria, nella scheda del browser: niente cookie, analytics o
storage remoto.

Unica eccezione di rete: la vista **Source** dell'editor carica Monaco da un CDN pubblico
(`cdn.jsdelivr.net`) al primo utilizzo. Vengono scaricati solo gli asset dell'editor di codice —
**la specifica non lascia comunque il browser**.

## Licenza

Codice di questa applicazione: **AGPL-3.0-or-later** — vedi [LICENSE](LICENSE).
Chi ne pubblica una versione modificata deve offrirne il sorgente ai propri utenti (art. 13).

Componenti di terze parti, con le rispettive licenze:

| Componente                                                                          | Licenza    |
| ----------------------------------------------------------------------------------- | ---------- |
| [Apitomy OpenAPI Editor](https://github.com/Apitomy/apitomy-openapi-editor) (`@apitomy/openapi-editor`, `@apitomy/data-models`) | Apache-2.0 |
| React, PatternFly, zustand, Vite                                                     | MIT        |
| `yaml`                                                                               | ISC        |

> **Demo indipendente e non ufficiale**, a scopo dimostrativo: non è affiliata, sponsorizzata né
> approvata da Apitomy o dagli autori di Apitomy OpenAPI Editor.
