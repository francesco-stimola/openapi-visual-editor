import { Suspense, lazy, useCallback, useEffect, useRef, useState } from 'react'
// Variante compatta dello stesso logo del README (assets/logo.html ne è il sorgente):
// alle dimensioni dell'header il payoff sarebbe illeggibile.
import logoUrl from '../assets/logo-compact.png'
import {
  ACCEPTED_EXTENSIONS,
  FORMATS,
  NEW_SPEC_VERSIONS,
  createEmptySpec,
  describeSpec,
  downloadSpec,
  outputFileName,
  readSpecFromFile,
} from './lib/openapiFile.js'

// L'editor (e con lui PatternFly e i modelli OpenAPI) viene scaricato solo al bisogno.
const EditorPane = lazy(() => import('./EditorPane.jsx'))

// L'AGPL-3.0 (art. 13) richiede di offrire il codice sorgente a chi usa l'applicazione via
// rete: il link nel footer è quell'offerta. Aggiornarlo se il repository viene rinominato.
const SOURCE_URL = 'https://github.com/francesco-stimola/openapi-visual-editor'

export default function App() {
  const [spec, setSpec] = useState(null)
  const [fileName, setFileName] = useState('')
  const [format, setFormat] = useState(FORMATS.YAML)
  const [newVersion, setNewVersion] = useState(NEW_SPEC_VERSIONS[0].value)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [isDragging, setIsDragging] = useState(false)

  // Stato "modifiche non scaricate": isEditorDirty dice se l'utente ha modificato qualcosa,
  // version/savedVersion se quella modifica è già stata esportata su file.
  const [isEditorDirty, setIsEditorDirty] = useState(false)
  const [version, setVersion] = useState(0)
  const [savedVersion, setSavedVersion] = useState(0)

  // L'editor legge initialContent solo al mount: cambiando la key viene rimontato.
  const [documentKey, setDocumentKey] = useState(0)

  const getContentRef = useRef(null)
  const fileInputRef = useRef(null)

  const loadSpec = useCallback((nextSpec, nextFileName, nextFormat, message) => {
    getContentRef.current = null
    setSpec(nextSpec)
    setFileName(nextFileName)
    setFormat(nextFormat)
    setIsEditorDirty(false)
    setVersion(0)
    setSavedVersion(0)
    setDocumentKey((key) => key + 1)
    setError('')
    setNotice(message || '')
  }, [])

  const handleFile = useCallback(
    async (file) => {
      if (!file) return
      try {
        const { spec: parsedSpec, format: detectedFormat } = await readSpecFromFile(file)
        loadSpec(parsedSpec, file.name, detectedFormat, `File "${file.name}" caricato correttamente.`)
      } catch (cause) {
        // In caso di errore il documento eventualmente aperto resta intatto.
        setNotice('')
        setError(cause instanceof Error ? cause.message : String(cause))
      }
    },
    [loadSpec],
  )

  const handleFileInputChange = useCallback(
    (event) => {
      const file = event.target.files?.[0]
      handleFile(file)
      // Permette di riselezionare lo stesso file dopo un errore.
      event.target.value = ''
    },
    [handleFile],
  )

  const handleDrop = useCallback(
    (event) => {
      event.preventDefault()
      setIsDragging(false)
      handleFile(event.dataTransfer.files?.[0])
    },
    [handleFile],
  )

  const handleNewSpec = useCallback(() => {
    const label = NEW_SPEC_VERSIONS.find((item) => item.value === newVersion)?.label ?? newVersion
    loadSpec(createEmptySpec(newVersion), '', FORMATS.YAML, `Nuova specifica ${label} creata.`)
  }, [loadSpec, newVersion])

  const handleEditorChange = useCallback((event) => {
    // isDirty distingue le modifiche vere: all'apertura di un documento l'editor emette
    // comunque due eventi (versione 0 e 1) con isDirty a false, e senza questo flag il
    // documento risulterebbe "da esportare" senza che nessuno l'abbia toccato.
    setIsEditorDirty(event.isDirty)
    setVersion(event.version)
    getContentRef.current = event.getContent
  }, [])

  const handleDownload = useCallback(() => {
    const current = getContentRef.current?.() ?? spec
    if (!current) return
    try {
      downloadSpec(current, format, outputFileName(fileName, format))
      setSavedVersion(version)
      setError('')
      setNotice(`Specifica scaricata come "${outputFileName(fileName, format)}".`)
    } catch (cause) {
      setNotice('')
      setError(
        `Impossibile generare il file: ${cause instanceof Error ? cause.message : String(cause)}`,
      )
    }
  }, [fileName, format, spec, version])

  const hasUnsavedChanges = Boolean(spec) && isEditorDirty && version !== savedVersion

  // Chiusura o ricarica con modifiche non ancora scaricate: qui l'unica copia del lavoro è in
  // memoria, quindi si perderebbe. Il listener resta attivo solo mentre serve; il testo del
  // messaggio lo decide il browser, non è personalizzabile.
  useEffect(() => {
    if (!hasUnsavedChanges) return undefined
    const confirmExit = (event) => {
      event.preventDefault()
      // Alcuni browser richiedono ancora la vecchia convenzione returnValue.
      event.returnValue = ''
    }
    window.addEventListener('beforeunload', confirmExit)
    return () => window.removeEventListener('beforeunload', confirmExit)
  }, [hasUnsavedChanges])

  return (
    <div
      className="app"
      onDragOver={(event) => {
        event.preventDefault()
        setIsDragging(true)
      }}
      onDragLeave={(event) => {
        if (event.currentTarget === event.target) setIsDragging(false)
      }}
      onDrop={handleDrop}
    >
      <header className="app__header">
        <div className="app__brand">
          <h1>
            <img src={logoUrl} alt="OpenAPI Visual Editor" />
          </h1>
          <p className="app__claim">Swagger 2.0 e OpenAPI 3.x, elaborati solo nel tuo browser.</p>
        </div>

        <div className="app__actions">
          <input
            ref={fileInputRef}
            type="file"
            className="app__file-input"
            accept={ACCEPTED_EXTENSIONS.join(',')}
            onChange={handleFileInputChange}
          />
          <button type="button" className="btn btn--primary" onClick={() => fileInputRef.current?.click()}>
            Apri file…
          </button>

          <label className="field">
            <span className="field__label">Nuova</span>
            <select
              className="field__control"
              value={newVersion}
              onChange={(event) => setNewVersion(event.target.value)}
            >
              {NEW_SPEC_VERSIONS.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>
          <button type="button" className="btn" onClick={handleNewSpec}>
            Crea specifica vuota
          </button>

          <label className="field">
            <span className="field__label">Formato</span>
            <select
              className="field__control"
              value={format}
              onChange={(event) => setFormat(event.target.value)}
              disabled={!spec}
            >
              <option value={FORMATS.YAML}>YAML</option>
              <option value={FORMATS.JSON}>JSON</option>
            </select>
          </label>
          <button type="button" className="btn btn--primary" onClick={handleDownload} disabled={!spec}>
            Scarica
          </button>
        </div>
      </header>

      {(error || notice) && (
        <div className={`banner ${error ? 'banner--error' : 'banner--info'}`} role={error ? 'alert' : 'status'}>
          <span>{error || notice}</span>
          <button
            type="button"
            className="banner__close"
            aria-label="Chiudi messaggio"
            onClick={() => (error ? setError('') : setNotice(''))}
          >
            ×
          </button>
        </div>
      )}

      {spec && (
        <div className="status-bar">
          <span className="status-bar__chip">{describeSpec(spec)}</span>
          <span className="status-bar__file">{fileName || 'documento senza nome'}</span>
          <span className={`status-bar__state ${hasUnsavedChanges ? 'is-dirty' : ''}`}>
            {hasUnsavedChanges ? 'Modifiche non scaricate' : 'Nessuna modifica da scaricare'}
          </span>
        </div>
      )}

      <main className={`app__main ${isDragging ? 'is-dragging' : ''}`}>
        {spec ? (
          <div className="editor-host">
            <Suspense fallback={<p className="editor-host__loading">Caricamento dell'editor…</p>}>
              <EditorPane key={documentKey} initialContent={spec} onChange={handleEditorChange} />
            </Suspense>
          </div>
        ) : (
          <section className="empty-state">
            <h2>Nessuna specifica aperta</h2>
            <p>
              Seleziona un file <strong>.yaml</strong>, <strong>.yml</strong> o <strong>.json</strong>, trascinalo qui
              oppure crea una nuova specifica vuota.
            </p>
            <div className="empty-state__actions">
              <button type="button" className="btn btn--primary" onClick={() => fileInputRef.current?.click()}>
                Apri file…
              </button>
              <button type="button" className="btn" onClick={handleNewSpec}>
                Crea specifica vuota
              </button>
            </div>
            <p className="empty-state__hint">
              Il file viene letto e modificato interamente nel browser: nessun contenuto viene inviato a server esterni.
            </p>
          </section>
        )}
      </main>

      <footer className="app__footer">
        <span>
          Demo indipendente e non ufficiale, basata su{' '}
          <a href="https://github.com/Apitomy/apitomy-openapi-editor" target="_blank" rel="noreferrer noopener">
            Apitomy OpenAPI Editor
          </a>{' '}
          (Apache License 2.0).
        </span>
        <span>
          <a href={SOURCE_URL} target="_blank" rel="noreferrer noopener">
            Codice sorgente
          </a>{' '}
          — AGPL-3.0-or-later, senza alcuna garanzia.
        </span>
      </footer>
    </div>
  )
}
