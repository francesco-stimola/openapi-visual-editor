import { fileURLToPath } from 'node:url'
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

/**
 * Il base path serve a far funzionare l'app quando viene pubblicata su
 * GitHub Pages sotto https://<utente>.github.io/<repository>/.
 *
 * Ordine di precedenza:
 *   1. VITE_BASE_PATH   -> base path esplicito (es. "/mio-path/")
 *   2. VITE_REPO_NAME   -> nome del repository (es. "openapi-visual-editor")
 *   3. GITHUB_REPOSITORY-> valorizzata automaticamente da GitHub Actions ("owner/repo")
 *   4. "/"              -> sviluppo locale / dominio custom
 */
function resolveBase(env) {
  const explicitBase = (env.VITE_BASE_PATH || '').trim()
  if (explicitBase) {
    return explicitBase.endsWith('/') ? explicitBase : `${explicitBase}/`
  }

  const repoFromEnv = (env.VITE_REPO_NAME || '').trim()
  const repoFromActions = (env.GITHUB_REPOSITORY || '').split('/')[1] || ''
  const repoName = repoFromEnv || repoFromActions.trim()

  return repoName ? `/${repoName.replace(/^\/|\/$/g, '')}/` : '/'
}

export default defineConfig(({ mode }) => {
  // Il prefisso vuoto permette di leggere anche variabili non VITE_* (es. GITHUB_REPOSITORY),
  // che vengono usate solo qui e non finiscono nel bundle client.
  const env = loadEnv(mode, process.cwd(), '')

  return {
    base: resolveBase(env),
    plugins: [react()],
    resolve: {
      alias: {
        // @apitomy/openapi-editor espone solo l'entry point ".": l'alias permette
        // di importare il suo foglio di stile senza violare la mappa "exports".
        '@apitomy/openapi-editor/styles.css': fileURLToPath(
          new URL('./node_modules/@apitomy/openapi-editor/dist/openapi-editor.css', import.meta.url),
        ),
      },
    },
    build: {
      outDir: 'dist',
      // @apitomy/data-models è una singola libreria da ~4,5 MB non ulteriormente divisibile
      // dall'esterno; viene comunque caricata in lazy solo all'apertura di una specifica.
      chunkSizeWarningLimit: 5000,
      rollupOptions: {
        output: {
          // Separa le dipendenze pesanti dal codice dell'applicazione,
          // così le modifiche all'app non invalidano l'intera cache del browser.
          manualChunks(id) {
            const path = id.replace(/\\/g, '/')
            if (!path.includes('/node_modules/')) return undefined
            if (path.includes('/@apitomy/data-models/')) return 'openapi-models'
            if (path.includes('/@apitomy/openapi-editor/')) return 'openapi-editor'
            if (path.includes('/@patternfly/')) return 'patternfly'
            if (/\/node_modules\/(react|react-dom|scheduler)\//.test(path)) return 'react'
            return 'vendor'
          },
        },
      },
    },
    server: {
      open: true,
    },
  }
})
