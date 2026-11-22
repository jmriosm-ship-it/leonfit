import { useState } from 'react'
import ProductArt from '../components/ProductArt.jsx'
import { money } from '../data.js'

const EMPTY = { name: '', blurb: '', off: 15, items: [], active: true }

function Form({ init, products, onSave, onCancel }) {
  const [f, setF] = useState(init)
  const [q, setQ] = useState('')
  const [err, setErr] = useState('')
  const chosen = f.items.map((id) => products.find((p) => p.id === id)).filter(Boolean)
  const full = chosen.reduce((a, p) => a + p.price, 0)
  const price = full * (1 - (Number(f.off) || 0) / 100)
  const toggle = (id) => setF({ ...f, items: f.items.includes(id) ? f.items.filter((x) => x !== id) : [...f.items, id] })

  const submit = (e) => {
    e.preventDefault()
    if (!f.name.trim()) return setErr('Ponle un nombre al combo.')
    if (f.items.length < 2) return setErr('Elige al menos 2 productos.')
    const off = Number(f.off)
    if (!(off > 0 && off < 90)) return setErr('El descuento debe estar entre 1 y 89 %.')
    setErr('')
    onSave({ ...f, name: f.name.trim(), off, blurb: f.blurb.trim() || chosen.map((p) => p.name).join(' + ') })
  }

  return (
    <form className="lfa-card lfa-form" onSubmit={submit}>
      <h2>{init.id ? 'Editar combo' : 'Nuevo combo de oferta'}</h2>
      <div className="lfa-split">
        <div className="lfa-fields">
          <label>Nombre del combo *<input value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} placeholder="Combo Masa Muscular" /></label>
          <label>Descripción corta<input value={f.blurb} onChange={(e) => setF({ ...f, blurb: e.target.value })} placeholder="Whey + Creatina + BCAA (vacío = automática)" /></label>
          <label>Descuento extra del combo (%)<input type="number" min="1" max="89" value={f.off} onChange={(e) => setF({ ...f, off: e.target.value })} /></label>
          <div className="lfa-checks"><label><input type="checkbox" checked={f.active} onChange={(e) => setF({ ...f, active: e.target.checked })} /> Combo activo (visible en la tienda)</label></div>

          <b>Productos del combo ({f.items.length})</b>
          <input placeholder="Buscar producto…" value={q} onChange={(e) => setQ(e.target.value)} />
          <div className="lfa-pick">
            {products.filter((p) => p.name.toLowerCase().includes(q.toLowerCase())).map((p) => (
              <label key={p.id} className={f.items.includes(p.id) ? 'on' : ''}>
                <input type="checkbox" checked={f.items.includes(p.id)} onChange={() => toggle(p.id)} />
                <span className="mini"><ProductArt color={p.color} label={p.label} size={p.size} name={p.name} image={p.image} glow={false} /></span>
                <span><b>{p.name}</b><small>{money(p.price)}</small></span>
              </label>
            ))}
          </div>
        </div>

        <div className="lfa-side">
          <b>Así se verá</b>
          <div className="lfa-combo-prev">
            <span className="off">-{Number(f.off) || 0}%</span>
            <div className="arts">{chosen.map((p) => <ProductArt key={p.id} color={p.color} label={p.label} size={p.size} name={p.name} image={p.image} glow={false} />)}</div>
            <h3>{f.name || 'Nombre del combo'}</h3>
            <p>{f.blurb || chosen.map((p) => p.name).join(' + ') || 'Elige productos'}</p>
            <div><strong>{money(price)}</strong> <s>{money(full)}</s></div>
            <small className="save">Ahorras {money(full - price)}</small>
          </div>
        </div>
      </div>
      {err && <p className="lfa-err">{err}</p>}
      <div className="lfa-actions">
        <button type="button" className="lfa-btn" onClick={onCancel}>Cancelar</button>
        <button className="lfa-btn gold">Guardar combo</button>
      </div>
    </form>
  )
}

export default function CombosTab({ store, commit }) {
  const { combos, products } = store
  const [edit, setEdit] = useState(null)

  const save = async (c) => {
    const ok = await commit((d) => {
      if (c.id) return { ...d, combos: d.combos.map((x) => (x.id === c.id ? c : x)) }
      return { ...d, combos: [...d.combos, { ...c, id: 'c' + Date.now().toString(36) }] }
    }, c.id ? 'Combo actualizado ✔' : 'Combo creado ✔')
    if (ok) setEdit(null)
  }
  const remove = (c) => window.confirm(`¿Eliminar "${c.name}"?`) && commit((d) => ({ ...d, combos: d.combos.filter((x) => x.id !== c.id) }), 'Combo eliminado')
  const toggle = (c) => commit((d) => ({ ...d, combos: d.combos.map((x) => (x.id === c.id ? { ...x, active: x.active === false } : x)) }), c.active === false ? 'Combo activado' : 'Combo desactivado')

  if (edit) return <Form init={edit} products={products} onSave={save} onCancel={() => setEdit(null)} />

  return (
    <>
      <div className="lfa-bar">
        <div><h2>Combos de oferta <small>({combos.length})</small></h2><p className="lfa-sub">Agrupa productos con un descuento extra. El precio se calcula solo con los precios actuales.</p></div>
        <button className="lfa-btn gold" onClick={() => setEdit({ ...EMPTY })} disabled={products.length < 2}>+ Nuevo combo</button>
      </div>
      <div className="lfa-cards">
        {combos.map((c) => {
          const items = c.items.map((id) => products.find((p) => p.id === id)).filter(Boolean)
          const full = items.reduce((a, p) => a + p.price, 0)
          const price = full * (1 - c.off / 100)
          return (
            <article key={c.id} className={c.active === false ? 'lfa-card lfa-combo dim' : 'lfa-card lfa-combo'}>
              <span className="pill gold">-{c.off}%</span>{c.active === false && <span className="pill gray">Inactivo</span>}
              <div className="arts">{items.map((p) => <ProductArt key={p.id} color={p.color} label={p.label} size={p.size} name={p.name} image={p.image} glow={false} />)}</div>
              <h3>{c.name}</h3>
              <p>{c.blurb}</p>
              <div><strong>{money(price)}</strong> <s>{money(full)}</s></div>
              <div className="acts">
                <button className="lfa-btn sm" onClick={() => setEdit(c)}>Editar</button>
                <button className="lfa-btn sm" onClick={() => toggle(c)}>{c.active === false ? 'Activar' : 'Desactivar'}</button>
                <button className="lfa-btn sm danger" onClick={() => remove(c)}>Eliminar</button>
              </div>
            </article>
          )
        })}
        {!combos.length && <p className="lfa-card empty">Todavía no hay combos. Crea el primero.</p>}
      </div>
    </>
  )
}
