<div align="center">

  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="assets/logo-dark.png">
    <source media="(prefers-color-scheme: light)" srcset="assets/logo-light.png">
    <img alt="OpenAPI Visual Editor" src="assets/logo-light.png" width="62%">
  </picture>

### Editor visuale per Swagger 2.0 e OpenAPI 3.x

**Il file resta nel tuo browser. Nessun upload, nessun backend, nessun account.**

YAML e JSON · modifica visuale · download nel formato originale · nessun backend

[![CI](https://github.com/francesco-stimola/openapi-visual-editor/actions/workflows/ci.yml/badge.svg)](https://github.com/francesco-stimola/openapi-visual-editor/actions/workflows/ci.yml)
[![Deploy](https://github.com/francesco-stimola/openapi-visual-editor/actions/workflows/deploy.yml/badge.svg)](https://github.com/francesco-stimola/openapi-visual-editor/actions/workflows/deploy.yml)
[![License: AGPL v3](https://img.shields.io/badge/license-AGPL--3.0--or--later-blue.svg)](LICENSE)
[![Node](https://img.shields.io/badge/node-%E2%89%A5%2020.19-green.svg)](https://nodejs.org)
[![Dati](https://img.shields.io/badge/dati-solo%20nel%20browser-brightgreen.svg)](#come-funziona)

[Avvio rapido](#avvio-rapido) · [Cosa fa](#cosa-fa) · [Come funziona](#come-funziona) · [Licenza](#licenza)

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

Requisiti: Node.js ≥ 20.19 (o ≥ 22.12) e npm ≥ 10. Nessun Docker, database o servizio cloud.

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
