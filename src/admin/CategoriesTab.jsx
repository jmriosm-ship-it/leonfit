import { useState } from 'react'

const slug = (t) => t.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

export default function CategoriesTab({ store, commit, notify }) {
  const { categories, products } = store
  const [form, setForm] = useState({ name: '', tag: '' })
  const [editId, setEditId] = useState(null)

  const count = (id) => products.filter((p) => p.cat === id).length

  const add = async (e) => {
    e.preventDefault()
    const name = form.name.trim()
    if (!name) return
    let id = slug(name) || 'cat'
    if (['todos', 'ofertas', 'buscar'].includes(id)) id += '-1'
    if (categories.some((c) => c.id === id)) return notify('Ya existe una categoría con ese nombre', true)
    if (await commit((d) => ({ ...d, categories: [...d.categories, { id, name, tag: form.tag.trim() || 'Nuevo' }] }), 'Categoría creada ✔')) setForm({ name: '', tag: '' })
  }

  const update = (id, change) => commit((d) => ({ ...d, categories: d.categories.map((c) => (c.id === id ? { ...c, ...change } : c)) }), 'Categoría actualizada ✔')

  const move = (i, dir) => {
    const j = i + dir
    if (j < 0 || j >= categories.length) return
    commit((d) => {
      const c = [...d.categories]
      ;[c[i], c[j]] = [c[j], c[i]]
      return { ...d, categories: c }
    }, 'Orden actualizado')
  }

  const remove = (c) => {
    if (count(c.id)) return notify(`"${c.name}" tiene ${count(c.id)} productos. Muévelos o elimínalos primero.`, true)
    if (window.confirm(`¿Eliminar la categoría "${c.name}"?`)) commit((d) => ({ ...d, categories: d.categories.filter((x) => x.id !== c.id) }), 'Categoría eliminada')
  }

  return (
    <>
      <div className="lfa-bar"><div><h2>Categorías <small>({categories.length})</small></h2><p className="lfa-sub">Aparecen en el menú y en “Elige tu categoría”. El orden de aquí es el de la tienda.</p></div></div>

      <form className="lfa-card lfa-inline" onSubmit={add}>
        <label>Nueva categoría<input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Ej. Ropa deportiva" /></label>
        <label>Etiqueta corta<input value={form.tag} onChange={(e) => setForm({ ...form, tag: e.target.value })} placeholder="Ej. Estilo" /></label>
        <button className="lfa-btn gold">+ Crear categoría</button>
      </form>

      <div className="lfa-card lfa-tablewrap">
        <table className="lfa-table">
          <thead><tr><th>#</th><th>Nombre</th><th>Etiqueta</th><th>Productos</th><th></th></tr></thead>
          <tbody>
            {categories.map((c, i) => (
              <tr key={c.id}>
                <td>{i + 1}</td>
                <td>{editId === c.id ? <input defaultValue={c.name} id={`n-${c.id}`} /> : <b>{c.name}</b>}</td>
                <td>{editId === c.id ? <input defaultValue={c.tag} id={`t-${c.id}`} /> : c.tag}</td>
                <td>{count(c.id)}</td>
                <td className="acts">
                  {editId === c.id ? (
                    <>
                      <button className="lfa-btn sm gold" onClick={async () => {
                        const name = document.getElementById(`n-${c.id}`).value.trim()
                        if (!name) return
                        if (await update(c.id, { name, tag: document.getElementById(`t-${c.id}`).value.trim() })) setEditId(null)
                      }}>Guardar</button>
                      <button className="lfa-btn sm" onClick={() => setEditId(null)}>Cancelar</button>
                    </>
                  ) : (
                    <>
                      <button className="lfa-btn sm" onClick={() => move(i, -1)} disabled={i === 0} aria-label="Subir">↑</button>
                      <button className="lfa-btn sm" onClick={() => move(i, 1)} disabled={i === categories.length - 1} aria-label="Bajar">↓</button>
                      <button className="lfa-btn sm" onClick={() => setEditId(c.id)}>Editar</button>
                      <button className="lfa-btn sm danger" onClick={() => remove(c)}>Eliminar</button>
                    </>
                  )}
                </td>
              </tr>
            ))}
            {!categories.length && <tr><td colSpan="5" className="empty">Aún no hay categorías.</td></tr>}
          </tbody>
        </table>
      </div>
    </>
  )
}
