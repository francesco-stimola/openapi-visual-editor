# syntax=docker/dockerfile:1

# Immagine dell'applicazione: nginx che serve la dist statica prodotta da Vite.
# Non c'è nessun backend da containerizzare — la specifica OpenAPI resta nel browser di chi
# usa l'app, esattamente come nella versione pubblicata su GitHub Pages.
#
#   docker build -t openapi-visual-editor .
#   docker run --rm -p 8080:80 openapi-visual-editor    # http://localhost:8080
#
# È l'unico punto del progetto che compila fuori da .github/workflows/build.yml, ed è
# deliberato: un Dockerfile che si limitasse a copiare una dist già pronta sarebbe
# costruibile solo dalla CI, e chi riceve l'immagine non potrebbe rigenerarla da sé.
# I passi restano gli stessi di build.yml (npm ci sul package-lock, stesso Node).

ARG NODE_VERSION=24-alpine
ARG NGINX_VERSION=alpine

# --platform=$BUILDPLATFORM: la compilazione gira SEMPRE sull'architettura di chi costruisce,
# qualunque sia quella di destinazione. La dist è identica ovunque (è JavaScript), quindi
# emularla sotto QEMU costerebbe minuti per ottenere lo stesso risultato — ed è ciò che rende
# quasi gratuito pubblicare l'immagine per cinque architetture invece che per una.
FROM --platform=$BUILDPLATFORM node:${NODE_VERSION} AS build

WORKDIR /app

# package.json e package-lock.json prima del resto: finché non cambiano, il layer di npm ci
# resta in cache e le modifiche al codice non ricompilano le dipendenze.
COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# Qui l'app vive sulla radice del server, non sotto "/<repository>/" come su GitHub Pages.
# "./" (riferimenti relativi) la rende servibile anche dietro un reverse proxy che la monti
# su un sottopercorso; vedi resolveBase in vite.config.js.
ARG VITE_BASE_PATH=./
ENV VITE_BASE_PATH=${VITE_BASE_PATH}
RUN npm run build

FROM nginx:${NGINX_VERSION} AS runtime

# Etichette OCI statiche, così l'immagine resta tracciabile anche se costruita a mano:
# nella build di Actions docker/metadata-action le riscrive con gli stessi valori.
# org.opencontainers.image.source è anche ciò che collega il package GHCR al repository.
LABEL org.opencontainers.image.title="OpenAPI Visual Editor" \
      org.opencontainers.image.description="Editor visuale per specifiche Swagger 2.0 e OpenAPI 3.x, interamente lato browser" \
      org.opencontainers.image.source="https://github.com/francesco-stimola/openapi-visual-editor" \
      org.opencontainers.image.licenses="AGPL-3.0-or-later"

COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

# Questo stage non esegue alcun comando (solo COPY): è ciò che permette di produrre le
# varianti 386, arm64, armv7 e armv6 senza emulazione. Aggiungere qui un RUN renderebbe
# necessario QEMU e trasformerebbe una build di due minuti in una di venti.
EXPOSE 80

# wget arriva da busybox, già presente in alpine: nessun pacchetto da installare.
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s \
  CMD wget -q -O /dev/null http://127.0.0.1/ || exit 1
