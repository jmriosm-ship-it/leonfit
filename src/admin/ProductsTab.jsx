import { useState } from 'react'
import ProductArt from '../components/ProductArt.jsx'
import { money, pct } from '../data.js'
import { uploadImage } from '../store.js'

const EMPTY = { name: '', brand: 'LeonFit Lab', cat: '', price: '', old: '', flavor: '', size: '', servings: '', color: '#c9a15a', label: '', badge: '', desc: '', image: '', hidden: false, soldOut: false, flash: false, rating: 5, reviews: 0 }

function Form({ init, categories, onSave, onCancel, notify }) {
  const [f, setF] = useState(init)
  const [up, setUp] = useState(false)
  const [err, setErr] = useState('')
  const set = (k) => (e) => setF({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value })

  const pick = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUp(true)
    try { const url = await uploadImage(file); setF((x) => ({ ...x, image: url })) } catch (x) { notify(x.message, true) }
    setUp(false)
    e.target.value = ''
  }

  const submit = (e) => {
    e.preventDefault()
    const price = Number(f.price)
    const old = f.old === '' || f.old === null ? null : Number(f.old)
    if (!f.name.trim()) return setErr('Escribe el nombre del producto.')
    if (!f.cat) return setErr('Elige una categoría (créala primero en la pestaña Categorías).')
    if (!(price > 0)) return setErr('El precio debe ser mayor que 0.')
    if (old !== null && old <= price) return setErr('El precio anterior debe ser mayor que el precio actual (o déjalo vacío).')
    setErr('')
    onSave({ ...f, name: f.name.trim(), price, old, servings: f.servings === '' || f.servings === null ? null : Number(f.servings), label: (f.label || f.name).slice(0, 8).toUpperCase(), badge: (f.badge || '').trim() || null })
  }

  const off = f.old && Number(f.old) > Number(f.price) ? Math.round((1 - f.price / f.old) * 100) : 0

  return (
    <form className="ad-card ad-form" onSubmit={submit}>
      <h2>{init.id ? 'Editar producto' : 'Nuevo producto'}</h2>
      <div className="ad-split">
        <div className="ad-fields">
          <label>Nombre *<input value={f.name} onChange={set('name')} placeholder="Whey Gold Standard" /></label>
          <div className="ad-row">
            <label>Marca<input value={f.brand} onChange={set('brand')} /></label>
            <label>Categoría *
              <select value={f.cat} onChange={set('cat')}>
                <option value="">— elegir —</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </label>
          </div>
          <div className="ad-row">
            <label>Precio (COP) *<input type="number" min="0" value={f.price} onChange={set('price')} placeholder="189000" /></label>
            <label>Precio anterior (tachado)<input type="number" min="0" value={f.old ?? ''} onChange={set('old')} placeholder="Vacío = sin oferta" /></label>
          </div>
          {off > 0 && <p className="ad-hint ok">Se mostrará con <b>-{off}%</b> de descuento.</p>}
          <div className="ad-row">
            <label>Sabor / contenido<input value={f.flavor} onChange={set('flavor')} placeholder="Chocolate, 90 cápsulas…" /></label>
            <label>Presentación<input value={f.size} onChange={set('size')} placeholder="2 lb, 300 g…" /></label>
          </div>
          <div className="ad-row">
            <label>Servicios<input type="number" min="0" value={f.servings ?? ''} onChange={set('servings')} /></label>
            <label>Etiqueta (insignia)<input value={f.badge ?? ''} onChange={set('badge')} placeholder="Más vendido, Nuevo…" /></label>
          </div>
          <label>Descripción corta<textarea rows="3" value={f.desc} onChange={set('desc')} placeholder="Qué es y para qué sirve" /></label>
        </div>

        <div className="ad-side">
          <b>Foto del producto</b>
          <div className="ad-pic">
            <ProductArt color={f.color} label={(f.label || f.name || 'LEON').slice(0, 8).toUpperCase()} size={f.size} name={f.name} image={f.image} />
          </div>
          <label className="ad-btn file">
            {up ? 'Subiendo…' : f.image ? 'Cambiar foto' : '📷 Subir foto'}
            <input type="file" accept="image/*" hidden onChange={pick} disabled={up} />
          </label>
          {f.image && <button type="button" className="ad-link" onClick={() => setF({ ...f, image: '' })}>Quitar foto (usar dibujo)</button>}
          {!f.image && (
            <div className="ad-row">
              <label>Texto del pote<input value={f.label} onChange={set('label')} maxLength="8" placeholder="WHEY" /></label>
              <label>Color<input type="color" value={f.color} onChange={set('color')} /></label>
            </div>
          )}
          <div className="ad-checks">
            <label><input type="checkbox" checked={!f.hidden} onChange={(e) => setF({ ...f, hidden: !e.target.checked })} /> Visible en la tienda</label>
            <label><input type="checkbox" checked={!!f.soldOut} onChange={set('soldOut')} /> Agotado</label>
            <label><input type="checkbox" checked={!!f.flash} onChange={set('flash')} /> En oferta relámpago</label>
          </div>
        </div>
      </div>
      {err && <p className="ad-err">{err}</p>}
      <div className="ad-actions">
        <button type="button" className="ad-btn" onClick={onCancel}>Cancelar</button>
        <button className="ad-btn gold" disabled={up}>Guardar producto</button>
      </div>
    </form>
  )
}

export default function ProductsTab({ store, commit, notify }) {
  const { products, categories } = store
  const [edit, setEdit] = useState(null)
  const [cat, setCat] = useState('todas')
  const [q, setQ] = useState('')

  const list = products.filter((p) => (cat === 'todas' || p.cat === cat) && (p.name + p.brand).toLowerCase().includes(q.toLowerCase()))
  const catName = (id) => categories.find((c) => c.id === id)?.name || '—'

  const save = async (p) => {
    const ok = await commit((d) => {
      if (p.id) return { ...d, products: d.products.map((x) => (x.id === p.id ? p : x)) }
      const id = Math.max(0, ...d.products.map((x) => x.id)) + 1
      return { ...d, products: [...d.products, { ...p, id }] }
    }, p.id ? 'Producto actualizado ✔' : 'Producto creado ✔')
    if (ok) setEdit(null)
  }
  const patch = (id, change, msg) => commit((d) => ({ ...d, products: d.products.map((x) => (x.id === id ? { ...x, ...change } : x)) }), msg)
  const remove = (p) => {
    if (!window.confirm(`¿Eliminar "${p.name}"? Se quitará también de los combos. No se puede deshacer.`)) return
    commit((d) => ({
      ...d,
      products: d.products.filter((x) => x.id !== p.id),
      combos: d.combos.map((c) => ({ ...c, items: c.items.filter((i) => i !== p.id) })).filter((c) => c.items.length > 0),
    }), 'Producto eliminado')
  }

  if (edit) return <Form init={edit} categories={categories} onSave={save} onCancel={() => setEdit(null)} notify={notify} />

  return (
    <>
      <div className="ad-bar">
        <div><h2>Productos <small>({products.length})</small></h2></div>
        <button className="ad-btn gold" onClick={() => setEdit({ ...EMPTY, cat: cat !== 'todas' ? cat : categories[0]?.id || '' })} disabled={!categories.length}>+ Nuevo producto</button>
      </div>
      {!categories.length && <p className="ad-hint">Primero crea una categoría en la pestaña <b>Categorías</b>.</p>}
      <div className="ad-filters">
        <input placeholder="Buscar producto…" value={q} onChange={(e) => setQ(e.target.value)} />
        <div className="ad-chips">
          {[{ id: 'todas', name: 'Todas' }, ...categories].map((c) => (
            <button key={c.id} className={cat === c.id ? 'on' : ''} onClick={() => setCat(c.id)}>
              {c.name} <i>{c.id === 'todas' ? products.length : products.filter((p) => p.cat === c.id).length}</i>
            </button>
          ))}
        </div>
      </div>

      <div className="ad-card ad-tablewrap">
        <table className="ad-table">
          <thead><tr><th></th><th>Producto</th><th>Categoría</th><th>Precio</th><th>Estado</th><th></th></tr></thead>
          <tbody>
            {list.map((p) => (
              <tr key={p.id} className={p.hidden ? 'dim' : ''}>
                <td className="th"><ProductArt color={p.color} label={p.label} size={p.size} name={p.name} image={p.image} glow={false} /></td>
                <td><b>{p.name}</b><small>{p.brand} · {p.flavor} · {p.size}</small></td>
                <td>{catName(p.cat)}</td>
                <td><b>{money(p.price)}</b>{p.old && <><s>{money(p.old)}</s><em className="pill">-{pct(p)}%</em></>}</td>
                <td>
                  {p.hidden && <span className="pill gray">Oculto</span>}
                  {p.soldOut && <span className="pill red">Agotado</span>}
                  {p.flash && <span className="pill gold">Relámpago</span>}
                  {p.badge && <span className="pill">{p.badge}</span>}
                </td>
                <td className="acts">
                  <button className="ad-btn sm" onClick={() => setEdit(p)}>Editar</button>
                  <button className="ad-btn sm" onClick={() => patch(p.id, { hidden: !p.hidden }, p.hidden ? 'Ahora es visible' : 'Producto oculto')}>{p.hidden ? 'Mostrar' : 'Ocultar'}</button>
                  <button className="ad-btn sm" onClick={() => patch(p.id, { soldOut: !p.soldOut }, p.soldOut ? 'Disponible de nuevo' : 'Marcado agotado')}>{p.soldOut ? 'Hay stock' : 'Agotar'}</button>
                  <button className="ad-btn sm danger" onClick={() => remove(p)}>Eliminar</button>
                </td>
              </tr>
            ))}
            {!list.length && <tr><td colSpan="6" className="empty">No hay productos aquí todavía.</td></tr>}
          </tbody>
        </table>
      </div>
    </>
  )
}
