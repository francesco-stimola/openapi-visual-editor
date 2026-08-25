# Changelog

Tutte le modifiche rilevanti di questo progetto sono documentate qui, nel formato
[Keep a Changelog](https://keepachangelog.com/it/1.1.0/) e con versioni
[SemVer](https://semver.org/lang/it/).

> **Questo file è ciò che mostra la pagina della release su GitHub.**
> [`deploy.yml`](.github/workflows/deploy.yml) estrae la sezione corrispondente al tag e la
> pubblica come corpo della release, e **rifiuta un tag che questo file non descrive**: un
> rilascio le cui modifiche nessuno ha scritto non avviene. Le voci rispondono a *"cosa cambia
> per chi usa l'applicazione?"*.

## [1.0.1] — 2026-08-25

### Modificato

- **L'applicazione usa lo stesso logo del repository.** L'intestazione, che mostrava un titolo
  testuale, ora presenta il logo nella variante compatta (marchio e nome, senza payoff: a quelle
  dimensioni sarebbe illeggibile), e la scheda del browser ha finalmente una **favicon** ricavata
  dal solo marchio. Entrambe le immagini nascono da `assets/logo.html`, unico sorgente del logo.

## [1.0.0] — 2026-08-25

Prima pubblicazione.

### Aggiunto

- **Apertura di specifiche dal filesystem** — file `.yaml`, `.yml` e `.json`, da selettore o
  trascinandoli sulla pagina. Il formato viene dedotto dall'estensione e, in mancanza, dal
  contenuto.
- **Modifica visuale** con il componente `OpenAPIEditor` di
  [Apitomy OpenAPI Editor](https://github.com/Apitomy/apitomy-openapi-editor): info API, path e
  operazioni, schemi, server, tag, sicurezza, parametri, estensioni `x-*`, undo/redo, validazione
  e vista sorgente. Supporta Swagger 2.0 e OpenAPI 3.x.
- **Creazione di una specifica vuota** in OpenAPI 3.0.3, 3.1.0 o Swagger 2.0.
- **Download della specifica modificata** mantenendo formato e nome del file di partenza, con
  possibilità di convertire tra YAML e JSON prima di salvare. Un indicatore segnala quando ci
  sono modifiche non ancora scaricate.
- **Gestione degli errori**: file malformati, documenti che non sono specifiche OpenAPI ed
  estensioni non supportate producono un messaggio che spiega la causa **senza far perdere il
  documento già aperto**.
- **Interfaccia responsive**, verificata senza scorrimento orizzontale fino a 480 px.

### Note

- **Nessun dato lascia il browser.** Il file viene letto con le API `File` e riscaricato come
  `Blob` locale: l'applicazione non ha backend e non invia la specifica da nessuna parte. Unica
  richiesta verso l'esterno, la vista *Source* dell'editor scarica Monaco da `cdn.jsdelivr.net`
  al primo utilizzo: vengono presi solo gli asset dell'editor di codice.
- L'avvio scarica circa 320 kB: l'editor e le sue dipendenze (PatternFly, modelli OpenAPI) sono
  caricati in lazy solo quando si apre o si crea una specifica.

[1.0.1]: https://github.com/francesco-stimola/openapi-visual-editor/releases/tag/v1.0.1
[1.0.0]: https://github.com/francesco-stimola/openapi-visual-editor/releases/tag/v1.0.0
