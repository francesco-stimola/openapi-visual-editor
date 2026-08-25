// Modulo caricato in lazy da App.jsx: raggruppa il componente dell'editor e i suoi
// fogli di stile, così l'avvio dell'applicazione non scarica PatternFly e i modelli
// OpenAPI finché non viene effettivamente aperta una specifica.
import '@patternfly/react-core/dist/styles/base.css'
import '@apitomy/openapi-editor/styles.css'
import { OpenAPIEditor } from '@apitomy/openapi-editor'

export default function EditorPane({ initialContent, onChange }) {
  return <OpenAPIEditor initialContent={initialContent} onChange={onChange} />
}
