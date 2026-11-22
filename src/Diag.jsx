import { useEffect, useState } from 'react'
import { CLOUD, getSession, loadData } from './store.js'

// Página de diagnóstico (#/diagnostico): muestra en texto plano qué está pasando en tu navegador.
export default function Diag() {
  const [rows, setRows] = useState([])
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
    add('Sesión de admin', s ? `sí (${s.email}), vence en ${Math.round((s.expires_at * 1000 - Date.now()) / 60000)} min` : 'no hay sesión')
    loadData()
      .then((d) => add('Lectura de la tienda', `ok: ${d.products.length} productos, ${d.categories.length} categorías, ${d.combos.length} combos, ${(d.settings.coupons || []).length} cupones`))
      .catch((e) => add('Lectura de la tienda', 'ERROR: ' + e.message))
    import('./admin/Admin.jsx')
      .then(() => add('Descarga del panel', 'ok'))
      .catch((e) => add('Descarga del panel', 'ERROR: ' + e.message))
  }, [])

  return (
    <div style={{ maxWidth: 760, margin: '30px auto', padding: '0 16px', font: '14px/1.5 system-ui', color: '#111' }}>
      <h1 style={{ fontSize: 24, marginBottom: 12 }}>Diagnóstico de LeonFit</h1>
      <p style={{ color: '#555', marginBottom: 14 }}>Toma una captura de esta página y envíasela a quien te ayuda con el sitio.</p>
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
      <p style={{ marginTop: 18 }}><a href="#/admin" style={{ color: '#7a5a14' }}>Ir al panel</a> · <a href="#/" style={{ color: '#7a5a14' }}>Ir a la tienda</a></p>
    </div>
  )
}
