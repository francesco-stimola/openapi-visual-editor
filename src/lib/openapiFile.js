import { parse as parseYaml, stringify as stringifyYaml } from 'yaml'

/** Estensioni accettate dal selettore di file. */
export const ACCEPTED_EXTENSIONS = ['.json', '.yaml', '.yml']

/** Formati supportati in lettura e scrittura. */
export const FORMATS = {
  YAML: 'yaml',
  JSON: 'json',
}

/** Versioni disponibili per una nuova specifica vuota. */
export const NEW_SPEC_VERSIONS = [
  { value: '3.0.3', label: 'OpenAPI 3.0.3' },
  { value: '3.1.0', label: 'OpenAPI 3.1.0' },
  { value: '2.0', label: 'Swagger 2.0' },
]

function extensionOf(fileName = '') {
  const match = /\.[^.]+$/.exec(fileName.toLowerCase())
  return match ? match[0] : ''
}

/**
 * Deduce il formato dal nome del file e, in mancanza di un'estensione nota,
 * dal primo carattere significativo del contenuto.
 */
export function detectFormat(fileName, content = '') {
  const extension = extensionOf(fileName)
  if (extension === '.json') return FORMATS.JSON
  if (extension === '.yaml' || extension === '.yml') return FORMATS.YAML
  return content.trimStart().startsWith('{') ? FORMATS.JSON : FORMATS.YAML
}

function assertLooksLikeSpec(document) {
  if (document === null || document === undefined) {
    throw new Error('Il file è vuoto o non contiene alcun documento.')
  }
  if (typeof document !== 'object' || Array.isArray(document)) {
    throw new Error('Il file non contiene un oggetto: una specifica OpenAPI deve essere una mappa di proprietà.')
  }
  const hasVersionField =
    Object.prototype.hasOwnProperty.call(document, 'openapi') ||
    Object.prototype.hasOwnProperty.call(document, 'swagger')

  if (!hasVersionField) {
    throw new Error(
      "Documento non riconosciuto: manca il campo \"openapi\" (OpenAPI 3.x) o \"swagger\" (Swagger 2.0).",
    )
  }
}

/**
 * Converte il testo del file in oggetto JavaScript.
 * Solleva un errore con un messaggio leggibile se il parsing fallisce
 * o se il documento non è una specifica OpenAPI/Swagger.
 */
export function parseSpec(content, format) {
  if (!content.trim()) {
    throw new Error('Il file selezionato è vuoto.')
  }

  let document
  try {
    document = format === FORMATS.JSON ? JSON.parse(content) : parseYaml(content)
  } catch (cause) {
    const label = format === FORMATS.JSON ? 'JSON' : 'YAML'
    const detail = cause instanceof Error ? cause.message : String(cause)
    throw new Error(`Errore di parsing ${label}: ${detail}`)
  }

  assertLooksLikeSpec(document)
  return document
}

/** Legge un File del browser e ne restituisce specifica e formato originale. */
export async function readSpecFromFile(file) {
  const extension = extensionOf(file.name)
  if (extension && !ACCEPTED_EXTENSIONS.includes(extension)) {
    throw new Error(`Estensione "${extension}" non supportata: sono ammessi file ${ACCEPTED_EXTENSIONS.join(', ')}.`)
  }

  let content
  try {
    // Lettura interamente locale: il contenuto non lascia mai il browser.
    content = await file.text()
  } catch {
    throw new Error('Impossibile leggere il file selezionato.')
  }

  const format = detectFormat(file.name, content)
  return { spec: parseSpec(content, format), format }
}

/** Serializza la specifica nel formato richiesto. */
export function serializeSpec(spec, format) {
  if (format === FORMATS.JSON) {
    return `${JSON.stringify(spec, null, 2)}\n`
  }
  // lineWidth: 0 evita che le descrizioni lunghe vengano mandate a capo.
  return stringifyYaml(spec, { lineWidth: 0 })
}

/** Nome del file da scaricare, mantenendo quando possibile quello di origine. */
export function outputFileName(sourceName, format) {
  const extension = format === FORMATS.JSON ? '.json' : '.yaml'
  const base = (sourceName || 'openapi').replace(/\.[^.]+$/, '').trim() || 'openapi'
  return `${base}${extension}`
}

/** Avvia il download del file generato in memoria (nessun upload verso server). */
export function downloadSpec(spec, format, fileName) {
  const mimeType = format === FORMATS.JSON ? 'application/json' : 'application/yaml'
  const blob = new Blob([serializeSpec(spec, format)], { type: `${mimeType};charset=utf-8` })
  const url = URL.createObjectURL(blob)

  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  document.body.appendChild(link)
  link.click()
  link.remove()

  // Il revoke immediato può interrompere il download su alcuni browser.
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

/** Crea una specifica vuota ma valida per la versione indicata. */
export function createEmptySpec(version) {
  const info = {
    title: 'Nuova API',
    version: '1.0.0',
    description: 'Specifica creata con OpenAPI Visual Editor.',
  }

  if (version === '2.0') {
    return {
      swagger: '2.0',
      info,
      host: 'api.example.com',
      basePath: '/',
      schemes: ['https'],
      paths: {},
      definitions: {},
    }
  }

  return {
    openapi: version,
    info,
    servers: [{ url: 'https://api.example.com' }],
    paths: {},
    components: { schemas: {} },
  }
}

/** Etichetta compatta con la versione della specifica corrente. */
export function describeSpec(spec) {
  if (!spec) return ''
  if (spec.openapi !== undefined) return `OpenAPI ${spec.openapi}`
  if (spec.swagger !== undefined) return `Swagger ${spec.swagger}`
  return 'Specifica'
}
