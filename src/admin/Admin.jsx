import { useState } from 'react'
import './admin.css'
import { useData } from '../DataContext.jsx'
import { CLOUD, DEMO_PASSWORD, getSession, signIn, signOut } from '../store.js'
import ProductsTab from './ProductsTab.jsx'
import CategoriesTab from './CategoriesTab.jsx'
import CombosTab from './CombosTab.jsx'
import SettingsTab from './SettingsTab.jsx'
import BackupTab from './BackupTab.jsx'

const TABS = [
  ['productos', '📦 Productos'],
  ['categorias', '🗂 Categorías'],
  ['combos', '🎁 Combos de oferta'],
  ['pagina', '🛠 Control de la página'],
  ['copia', '💾 Copia de seguridad'],
]

function Login({ onIn }) {
  const [email, setEmail] = useState('')
  const [pass, setPass] = useState('')
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)
  const submit = async (e) => {
    e.preventDefault()
    setBusy(true); setErr('')
    try { onIn(await signIn(email.trim(), pass)) } catch (x) { setErr(x.message) }
    setBusy(false)
  }
  return (
    <div className="ad-login">
      <form onSubmit={submit}>
        <img src={`${import.meta.env.BASE_URL}logo.jpg`} alt="LeonFit" />
        <h1>Panel de administración</h1>
        <p>Entra con tu correo y contraseña de administrador.</p>
        <input type="email" placeholder="Correo" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} required={CLOUD} />
        <input type="password" placeholder="Contraseña" autoComplete="current-password" value={pass} onChange={(e) => setPass(e.target.value)} required />
        {err && <p className="ad-err">{err}</p>}
        <button className="ad-btn gold" disabled={busy}>{busy ? 'Entrando…' : 'Entrar'}</button>
        {!CLOUD && <small className="ad-demo">Modo demo: contraseña <b>{DEMO_PASSWORD}</b>. Los cambios se guardan solo en este navegador hasta que conectes Supabase.</small>}
        <a href="#/">← Volver a la tienda</a>
      </form>
    </div>
  )
}

export default function Admin() {
  const [session, setSession] = useState(getSession)
  const [tab, setTab] = useState('productos')
  const [note, setNote] = useState(null)
  const store = useData()

  const notify = (text, bad = false) => {
    setNote({ text, bad })
    clearTimeout(notify.t)
    notify.t = setTimeout(() => setNote(null), 3200)
  }
  // Guarda y avisa. Devuelve true si salió bien.
  const commit = async (next, okMsg = 'Guardado ✔') => {
    try { await store.save(next); notify(okMsg); return true } catch (e) { notify(e.message, true); return false }
  }

  if (!session) return <Login onIn={setSession} />

  const props = { store, commit, notify }
  return (
    <div className="ad">
      <header className="ad-top">
        <div className="ad-brand">
          <img src={`${import.meta.env.BASE_URL}logo.jpg`} alt="" />
          <b>LEON<span>FIT</span></b><em>Admin</em>
        </div>
        <span className={CLOUD ? 'ad-mode on' : 'ad-mode'}>{CLOUD ? '● Conectado a la nube' : '● Modo demo (solo este navegador)'}</span>
        <div className="ad-top-r">
          <a className="ad-btn" href="#/" target="_blank" rel="noreferrer">Ver tienda ↗</a>
          <button className="ad-btn" onClick={() => { signOut(); setSession(null) }}>Cerrar sesión</button>
        </div>
      </header>

      <nav className="ad-tabs">
        {TABS.map(([id, name]) => <button key={id} className={tab === id ? 'on' : ''} onClick={() => setTab(id)}>{name}</button>)}
      </nav>

      <main className="ad-main">
        {tab === 'productos' && <ProductsTab {...props} />}
        {tab === 'categorias' && <CategoriesTab {...props} />}
        {tab === 'combos' && <CombosTab {...props} />}
        {tab === 'pagina' && <SettingsTab {...props} />}
        {tab === 'copia' && <BackupTab {...props} />}
      </main>

      {note && <div className={note.bad ? 'ad-toast bad' : 'ad-toast'}>{note.text}</div>}
    </div>
  )
}
