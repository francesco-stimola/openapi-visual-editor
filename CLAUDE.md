# Istruzioni per Claude Code

## Commit e pull request

- **Nessun indirizzo e-mail reale deve mai comparire nella cronologia git**, né come autore né
  come coautore. I commit si firmano esclusivamente con l'indirizzo noreply di GitHub:

  ```
  git config user.email "290096681+francesco-stimola@users.noreply.github.com"
  ```

  È già impostato come configurazione locale di questo repository. In una nuova copia del
  repository va reimpostato: verificare `git config user.email` prima del primo commit, perché
  la configurazione globale della macchina contiene un'e-mail aziendale che non deve finire
  in un repository pubblico. Una volta pubblicato, correggere significa riscrivere la
  cronologia e forzare il push.
- **Non inserire mai trailer `Co-Authored-By:`** nei messaggi di commit, né per Claude né per
  altri coautori.
- Non aggiungere firme automatiche del tipo "Generated with Claude Code" nei commit.
- Committare o fare push solo su richiesta esplicita.

## Progetto

Applicazione React + Vite (JavaScript, nessun TypeScript) che incorpora il componente
`OpenAPIEditor` di `@apitomy/openapi-editor` per modificare specifiche Swagger 2.0 e OpenAPI 3.x.

- Tutta l'elaborazione dei file avviene nel browser: non introdurre chiamate di rete che
  inviino il contenuto delle specifiche a servizi esterni.
- Comandi: `npm run dev`, `npm run build`, `npm run preview`.
- Il base path della build è calcolato in [vite.config.js](vite.config.js) da `VITE_BASE_PATH` /
  `VITE_REPO_NAME` / `GITHUB_REPOSITORY`: non scriverlo in modo fisso.
- Il foglio di stile dell'editor si importa con l'alias `@apitomy/openapi-editor/styles.css`
  definito in `vite.config.js` (il package espone solo l'entry point `.`).
- L'editor viene caricato in lazy da [src/EditorPane.jsx](src/EditorPane.jsx) insieme ai CSS
  di PatternFly: mantenere questa separazione per non appesantire l'avvio.

## Licenza

- Il codice dell'applicazione è **AGPL-3.0-or-later**: `LICENSE` contiene il testo AGPL
  verbatim, da non modificare.
- Il link "Codice sorgente" nel footer di `App.jsx` è l'offerta di sorgente richiesta
  dall'art. 13 dell'AGPL: non rimuoverlo.
- Le dipendenze restano Apache-2.0 / MIT / ISC: mantenere l'attribuzione ad Apitomy OpenAPI
  Editor nel README e nel footer.

## Workflow GitHub Actions e pubblicazione

Il README non documenta la pubblicazione di proposito (presenta il progetto, non lo amministra):
la procedura vive qui.

- `build.yml` è l'unico posto in cui si compila il sito: `ci.yml` (push su main e PR),
  `manual-build.yml` (on-demand da un branch qualsiasi, artifact 30 giorni) e `deploy.yml`
  (tag `v*.*.*`, o esecuzione manuale) lo richiamano. Non duplicare i passi di build nei chiamanti.
  L'input `base-path` sovrascrive il base path: vuoto = `/<repository>/` (GitHub Pages), `./` =
  riferimenti relativi, la variante usata dal pacchetto allegato alla release e dall'immagine.
  `artifact-name` serve solo a distinguere i due artifact quando un run compila due volte.
- `docker.yml` è l'unico posto in cui si costruisce l'immagine, con lo stesso schema:
  `manual-build.yml` lo chiama con `push: false` (prova) e `deploy.yml` con `push: true`.
  Il `Dockerfile` compila l'app al suo interno, ed è l'unica eccezione consapevole alla regola
  "si compila solo in `build.yml`": un'immagine dev'essere ricostruibile da chi la riceve, non
  solo dalla CI. Se cambiano i passi di build, vanno allineati entrambi.
  L'immagine esce per `linux/amd64`, `linux/386`, `linux/arm64`, `linux/arm/v7` e `linux/arm/v6`:
  è tutto ciò che `nginx:alpine` pubblica, tolte `ppc64le`, `s390x` e `riscv64`. Costano quanto
  una sola architettura **finché lo stage finale del `Dockerfile` contiene solo `COPY`**: non
  dovendo eseguire nulla, non serve QEMU. Un `RUN` aggiunto lì obbligherebbe a emulare ciascuna
  architettura e a introdurre `docker/setup-qemu-action`.
- Un tag pubblica **tre** cose: il sito su Pages, l'immagine su `ghcr.io/<utente>/<repository>`
  (tag `x.y.z`, `x.y`, `latest`) e la release, a cui sono allegati
  `openapi-visual-editor-<versione>-dist.zip` e `SHA256SUMS`. La release è l'ultimo job proprio
  perché è la pagina che annuncia gli altri due: `needs: [deploy, package, docker]`.
- "Manual build" è la prova generale del rilascio: costruisce sito, pacchetto e immagine senza
  pubblicare niente. Usarla prima di staccare un tag; l'unico passo che resta non provato è il
  push su GHCR, che richiede un tag.
- La pubblicazione su Pages avviene **solo su tag**: non aggiungere trigger di deploy sul push
  di `main`.

  ```bash
  git push -u origin main                                  # CI verifica, non pubblica
  git tag -a v1.0.0 -m "v1.0.0" && git push origin v1.0.0  # pubblica su Pages
  ```

- **Il campo `version` di `package.json` deve coincidere con il tag**, senza la `v`: è la
  versione mostrata nel footer dell'applicazione ([vite.config.js](vite.config.js) la legge da
  lì e la inietta come `__APP_VERSION__`), e il footer ne fa il link alle note di rilascio.
  Il job `changelog` di `deploy.yml` confronta i due valori e **fallisce se divergono**, quindi
  il bump va fatto insieme alla voce di changelog, prima di staccare il tag.

- **Ogni tag richiede la sua voce in [CHANGELOG.md](CHANGELOG.md)**, aggiunta *prima* di
  staccarlo: il job `changelog` di `deploy.yml` estrae la sezione `## [x.y.z]` corrispondente e
  fallisce se non la trova, quindi un tag non descritto non pubblica né sito né release. La
  sezione estratta diventa il corpo della release su GitHub, perciò va scritta per chi usa
  l'applicazione ("cosa cambia per me?"), non come elenco di commit.

- Due prerequisiti una tantum, entrambi manuali e non automatizzabili dal workflow. Senza il
  primo il deploy fallisce in "Setup Pages", senza il secondo in "deploy":

  1. **Settings → Pages → Source: GitHub Actions.** `actions/configure-pages` con
     `enablement: true` non basta: fallisce con "Resource not accessible by integration",
     perché il `GITHUB_TOKEN` non può creare il sito Pages.
  2. **Settings → Environments → `github-pages` → Deployment branches and tags → Add rule →
     Tag → `v*.*.*`.** Abilitando Pages, GitHub crea l'ambiente `github-pages` con un'unica
     regola sul branch `main`, quindi rifiuta i run partiti da un tag con
     *"Tag v1.0.0 is not allowed to deploy to github-pages due to environment protection rules"*.
     Dato che qui si pubblica solo su tag, la regola per i tag è indispensabile.

  Il sito finisce su `https://<utente>.github.io/<repository>/`.

  Su GHCR invece non serve alcun prerequisito: il package eredita la visibilità del repository,
  quindi è nato pubblico e si scarica senza credenziali (verificato al rilascio di v1.3.0). Se in
  una copia privata risultasse privato, `docker pull` chiederebbe l'autenticazione e consumerebbe
  la quota storage: si cambia da Settings → Packages → `openapi-visual-editor` → Package settings
  → Change visibility. Da pubblico, storage e banda sono gratuiti e illimitati — come i minuti di
  Actions sui runner standard e gli asset delle release (limite: 2 GiB per file).
- Le action sono aggiornate alle major che girano su Node 24 (i runner hanno deprecato Node 20):
  `checkout@v7`, `setup-node@v7`, `upload-artifact@v7`, `download-artifact@v8`,
  `upload-pages-artifact@v5`, `configure-pages@v6`, `deploy-pages@v5`, `action-gh-release@v3`,
  e per l'immagine `setup-buildx-action@v4`, `login-action@v4`, `metadata-action@v6`,
  `build-push-action@v7`. Verificare `runs.using` prima di un downgrade.
- Base path, risolto in [vite.config.js](vite.config.js) in quest'ordine: `VITE_BASE_PATH`
  (esplicito) → `VITE_REPO_NAME` (`/<nome>/`) → `GITHUB_REPOSITORY` (impostata da Actions) → `/`.
  In locale non serve configurare nulla (vedi [.env.example](.env.example) per una build locale
  identica a quella pubblicata); con dominio custom o repository `<utente>.github.io`, in
  `build.yml` sostituire `VITE_REPO_NAME` con `VITE_BASE_PATH: /`.

## Logo

`assets/logo.html` è il sorgente delle due varianti PNG usate nel README (`?theme=dark` per la
scura). Si riesportano con DevTools → "Capture node screenshot" sul nodo `.logo`, che mantiene
lo sfondo trasparente. Se cambia il nome del progetto, rigenerare entrambe le varianti.
