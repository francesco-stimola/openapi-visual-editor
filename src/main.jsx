import { createRoot } from 'react-dom/client'
import './styles.css'
import App from './App.jsx'

// StrictMode non viene usato di proposito: il doppio mount in sviluppo
// reinizializza lo store interno dell'editor e ne azzera la cronologia undo/redo.
createRoot(document.getElementById('root')).render(<App />)
