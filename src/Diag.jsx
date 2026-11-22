import { Component, lazy, Suspense, useEffect, useRef, useState } from 'react'
import { CLOUD, getSession, loadData } from './store.js'
import { DataProvider } from './DataContext.jsx'

const Admin = lazy(() => import('./admin/Admin.jsx'))

class Catch extends Component {
  state = { error: null }
  static getDerivedStateFromError(error) { return { error } }
  componentDidCatch(error) { this.props.onError?.(error) }
  render() { return this.state.error ? <p style={{ color: '#b91c1c' }}>El panel falló al dibujarse: {String(this.state.error.message || this.state.error)}</p> : this.props.children }
}

// Página de diagnóstico (#/diagnostico): muestra en texto plano qué está pasando en tu navegador.
export default function Diag() {
  const [rows, setRows] = useState([])
  const [probe, setProbe] = useState(false)
  const box = useRef(null)
  const add = (k, v) => setRows((r) => [...r, [k, String(v)]])

  useEffect(() => {
    add('Versión del sitio', __BUILD__)
    add('Navegador', navigator.userAgent)
    add('Dirección', window.location.href)
    add('Pantalla', `${window.innerWidth}x${window.innerHeight}`)
    try {
      const keys = Object.keys(localStorage)
      add('Datos guardados en el navegador', keys.map((k) => `${k} (${(localStorage.getItem(k) || '').length} caracteres)`).join(', ') || 'ninguno')
    } catch (e) { add('Datos guardados en el navegador', 'NO SE PUEDEN LEER: ' + e.message) }
    add('Conectado a Supabase', CLOUD ? 'sí' : 'NO (modo demo)')
    const s = getSession()
    add('Sesión de admin', s ? `sí (${s.email}), vence en ${Math.round((s.expires_at * 1000 - Date.now()) / 60000)} min` : 'no hay sesión: entra primero al panel y vuelve aquí')
    loadData()
      .then((d) => add('Lectura de la tienda', `ok: ${d.products.length} productos, ${d.categories.length} categorías, ${d.combos.length} combos, ${(d.settings.coupons || []).length} cupones`))
      .catch((e) => add('Lectura de la tienda', 'ERROR: ' + e.message))
    import('./admin/Admin.jsx')
      .then(() => add('Descarga del panel', 'ok'))
      .catch((e) => add('Descarga del panel', 'ERROR: ' + e.message))
  }, [])

  // Dibuja el panel dentro de esta página y mide qué quedó en pantalla.
  useEffect(() => {
    if (!probe) return undefined
    const t = setTimeout(() => {
      const el = box.current
      if (!el) return
      const top = el.querySelector('.ad-top')
      const main = el.querySelector('.ad-main')
      add('Panel dibujado: texto', `${el.innerText.length} caracteres`)
      add('Panel dibujado: elementos', el.querySelectorAll('*').length)
      if (top) {
        const cs = getComputedStyle(top)
        const r = top.getBoundingClientRect()
        add('Barra superior del panel', `alto ${Math.round(r.height)}px, display ${cs.display}, visibility ${cs.visibility}, opacity ${cs.opacity}, fondo ${cs.backgroundColor}, color ${cs.color}`)
      } else add('Barra superior del panel', 'NO EXISTE (se está mostrando el login u otra cosa)')
      if (main) { const r = main.getBoundingClientRect(); add('Contenido del panel', `alto ${Math.round(r.height)}px, texto: ${main.innerText.slice(0, 80).replace(/\s+/g, ' ')}`) }
    }, 2500)
    return () => clearTimeout(t)
  }, [probe])

  return (
    <div style={{ maxWidth: 760, margin: '30px auto', padding: '0 16px', font: '14px/1.5 system-ui', color: '#111' }}>
      <h1 style={{ fontSize: 24, marginBottom: 12 }}>Diagnóstico de LeonFit</h1>
      <p style={{ color: '#555', marginBottom: 14 }}>Toma una captura de esta página (completa) y envíasela a quien te ayuda con el sitio.</p>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <tbody>
          {rows.map(([k, v], i) => (
            <tr key={i} style={{ borderBottom: '1px solid #ddd' }}>
              <td style={{ padding: '8px 10px 8px 0', fontWeight: 700, verticalAlign: 'top', width: 210 }}>{k}</td>
              <td style={{ padding: '8px 0', wordBreak: 'break-word' }}>{v}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p style={{ marginTop: 18 }}>
        <button onClick={() => setProbe(true)} disabled={probe} style={{ padding: '10px 16px', fontWeight: 700 }}>Probar el panel aquí</button>
        {' '}<a href="#/admin" style={{ color: '#7a5a14' }}>Ir al panel</a> · <a href="#/" style={{ color: '#7a5a14' }}>Ir a la tienda</a>
      </p>
      {probe && (
        <div ref={box} style={{ marginTop: 16, border: '2px dashed #999', maxHeight: 260, overflow: 'auto' }}>
          <Catch onError={(e) => add('Error al dibujar el panel', e.message || e)}>
            <DataProvider><Suspense fallback={<p>Cargando…</p>}><Admin /></Suspense></DataProvider>
          </Catch>
        </div>
      )}
    </div>
  )
}
