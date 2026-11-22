import { useState } from 'react'
import { money } from '../data.js'

const EMPTY = { code: '', type: 'pct', value: 10, min: '', expires: '', active: true }
const today = () => new Date().toISOString().slice(0, 10)

// Cupón guardado → valores con el formato nuevo (los viejos solo tenían code y pct).
const norm = (c) => ({ code: String(c.code).toUpperCase(), type: c.type === 'cop' ? 'cop' : 'pct', value: Number(c.value ?? c.pct) || 0, min: Number(c.min) || 0, expires: c.expires || '', active: c.active !== false })

export default function CouponsTab({ store, commit, notify }) {
  const list = (store.settings.coupons || []).map(norm)
  const [f, setF] = useState(EMPTY)
  const [editCode, setEditCode] = useState(null)
  const [err, setErr] = useState('')

  const saveAll = (coupons, msg) => commit((d) => ({ ...d, settings: { ...d.settings, coupons } }), msg)
  const set = (k) => (e) => setF({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value })

  const submit = async (e) => {
    e.preventDefault()
    const code = f.code.trim().toUpperCase().replace(/\s+/g, '')
    const value = Number(f.value)
    if (!/^[A-Z0-9_-]{3,20}$/.test(code)) return setErr('El código debe tener de 3 a 20 letras o números, sin espacios ni tildes.')
    if (list.some((c) => c.code === code && c.code !== editCode)) return setErr('Ya existe un cupón con ese código.')
    if (!(value > 0)) return setErr('Escribe cuánto descuenta el cupón.')
    if (f.type === 'pct' && value > 90) return setErr('El porcentaje no puede pasar de 90%.')
    setErr('')
    const next = { code, type: f.type, value, min: f.min === '' ? 0 : Number(f.min) || 0, expires: f.expires || '', active: f.active }
    const coupons = editCode ? list.map((c) => (c.code === editCode ? next : c)) : [...list, next]
    if (await saveAll(coupons, editCode ? 'Cupón actualizado ✔' : 'Cupón creado ✔')) { setF(EMPTY); setEditCode(null) }
  }

  const edit = (c) => { setEditCode(c.code); setF({ ...c, min: c.min || '' }); setErr(''); window.scrollTo({ top: 0, behavior: 'smooth' }) }
  const cancel = () => { setEditCode(null); setF(EMPTY); setErr('') }
  const toggle = (c) => saveAll(list.map((x) => (x.code === c.code ? { ...x, active: !x.active } : x)), c.active ? 'Cupón desactivado' : 'Cupón activado')
  const remove = (c) => { if (window.confirm(`¿Eliminar el cupón ${c.code}?`)) saveAll(list.filter((x) => x.code !== c.code), 'Cupón eliminado') }
  const status = (c) => (c.expires && c.expires < today() ? ['Vencido', 'red'] : c.active ? ['Activo', 'gold'] : ['Inactivo', 'gray'])

  return (
    <>
      <div className="ad-bar"><div><h2>Cupones de descuento <small>({list.length})</small></h2><p className="ad-sub">Tus clientes escriben el código en el carrito y el descuento se aplica solo. Aquí defines cuánto descuenta cada uno.</p></div></div>

      <form className="ad-card ad-form" onSubmit={submit}>
        <h2>{editCode ? `Editar cupón ${editCode}` : 'Nuevo cupón'}</h2>
        <div className="ad-row c3">
          <label>Código *<input value={f.code} onChange={set('code')} placeholder="BIENVENIDO10" maxLength="20" /></label>
          <label>Tipo de descuento
            <select value={f.type} onChange={set('type')}>
              <option value="pct">Porcentaje (%)</option>
              <option value="cop">Valor fijo ($)</option>
            </select>
          </label>
          <label>{f.type === 'pct' ? 'Cuánto descuenta (%) *' : 'Cuánto descuenta (COP) *'}<input type="number" min="1" value={f.value} onChange={set('value')} /></label>
        </div>
        <div className="ad-row c3">
          <label>Compra mínima (COP) <small>opcional</small><input type="number" min="0" value={f.min} onChange={set('min')} placeholder="Vacío = sin mínimo" /></label>
          <label>Válido hasta <small>opcional</small><input type="date" value={f.expires} onChange={set('expires')} /></label>
          <div className="ad-checks"><label><input type="checkbox" checked={f.active} onChange={set('active')} /> Cupón activo</label></div>
        </div>
        {err && <p className="ad-err">{err}</p>}
        <div className="ad-actions">
          {editCode && <button type="button" className="ad-btn" onClick={cancel}>Cancelar</button>}
          <button className="ad-btn gold">{editCode ? 'Guardar cupón' : '+ Crear cupón'}</button>
        </div>
      </form>

      <div className="ad-card ad-tablewrap">
        <table className="ad-table">
          <thead><tr><th>Código</th><th>Descuento</th><th>Compra mínima</th><th>Vence</th><th>Estado</th><th></th></tr></thead>
          <tbody>
            {list.map((c) => {
              const [label, tone] = status(c)
              return (
                <tr key={c.code} className={label === 'Activo' ? '' : 'dim'}>
                  <td><b>{c.code}</b></td>
                  <td>{c.type === 'pct' ? `${c.value}%` : money(c.value)}</td>
                  <td>{c.min ? money(c.min) : '—'}</td>
                  <td>{c.expires || '—'}</td>
                  <td><span className={`pill ${tone}`}>{label}</span></td>
                  <td className="acts">
                    <button className="ad-btn sm" onClick={() => edit(c)}>Editar</button>
                    <button className="ad-btn sm" onClick={() => toggle(c)}>{c.active ? 'Desactivar' : 'Activar'}</button>
                    <button className="ad-btn sm danger" onClick={() => remove(c)}>Eliminar</button>
                  </td>
                </tr>
              )
            })}
            {!list.length && <tr><td colSpan="6" className="empty">Aún no hay cupones. Crea el primero arriba.</td></tr>}
          </tbody>
        </table>
      </div>
    </>
  )
}
