import { Component, lazy, Suspense, useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './theme.css'
import App from './App.jsx'
import { DataProvider } from './DataContext.jsx'

// El panel se descarga solo cuando entras a #/admin.
const Admin = lazy(() => import('./admin/Admin.jsx'))

const isAdmin = () => window.location.hash.startsWith('#/admin')

// Si la pestaña quedó abierta con una versión vieja y el archivo del panel ya no existe
// (después de publicar una actualización), recarga una sola vez para traer la versión nueva.
const reloadOnce = () => {
  try {
    if (sessionStorage.getItem('leonfit-reloaded')) return false
    sessionStorage.setItem('leonfit-reloaded', '1')
  } catch { /* sin storage */ }
  window.location.reload()
  return true
}
window.addEventListener('vite:preloadError', (e) => { e.preventDefault(); reloadOnce() })
window.addEventListener('load', () => setTimeout(() => { try { sessionStorage.removeItem('leonfit-reloaded') } catch { /* sin storage */ } }, 4000))

// En vez de dejar la pantalla en blanco, muestra qué falló y cómo arreglarlo.
class Guard extends Component {
  state = { error: null }
  static getDerivedStateFromError(error) { return { error } }
  componentDidCatch(error) {
    if (/dynamically imported|Failed to fetch|Loading chunk|MIME|module script/i.test(String(error?.message))) reloadOnce()
  }
  reset = () => {
    try { localStorage.removeItem('leonfit-data'); localStorage.removeItem('leonfit-cart') } catch { /* sin storage */ }
    window.location.reload()
  }
  render() {
    if (!this.state.error) return this.props.children
    return (
      <div style={{ maxWidth: 520, margin: '12vh auto', padding: 24, font: '16px system-ui', textAlign: 'center' }}>
        <h2>Algo falló al cargar esta página</h2>
        <p style={{ color: '#5d6470', margin: '12px 0' }}>{String(this.state.error?.message || this.state.error)}</p>
        <button onClick={() => window.location.reload()} style={{ padding: '12px 20px', marginRight: 8 }}>Recargar</button>
        <button onClick={this.reset} style={{ padding: '12px 20px' }}>Borrar datos locales y recargar</button>
      </div>
    )
  }
}

function Root() {
  const [admin, setAdmin] = useState(isAdmin)
  useEffect(() => {
    const on = () => setAdmin(isAdmin())
    window.addEventListener('hashchange', on)
    return () => window.removeEventListener('hashchange', on)
  }, [])
  return (
    <Guard>
      <DataProvider>
        {admin ? <Suspense fallback={<p style={{ padding: 40 }}>Cargando panel…</p>}><Admin /></Suspense> : <App />}
      </DataProvider>
    </Guard>
  )
}

createRoot(document.getElementById('root')).render(<Root />)
