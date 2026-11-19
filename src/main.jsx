import { lazy, Suspense, useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './theme.css'
import App from './App.jsx'
import { DataProvider } from './DataContext.jsx'

// El panel se descarga solo cuando entras a #/admin.
const Admin = lazy(() => import('./admin/Admin.jsx'))

const isAdmin = () => window.location.hash.startsWith('#/admin')

function Root() {
  const [admin, setAdmin] = useState(isAdmin)
  useEffect(() => {
    const on = () => setAdmin(isAdmin())
    window.addEventListener('hashchange', on)
    return () => window.removeEventListener('hashchange', on)
  }, [])
  return (
    <DataProvider>
      {admin ? <Suspense fallback={<p style={{ padding: 40 }}>Cargando panel…</p>}><Admin /></Suspense> : <App />}
    </DataProvider>
  )
}

createRoot(document.getElementById('root')).render(<Root />)
