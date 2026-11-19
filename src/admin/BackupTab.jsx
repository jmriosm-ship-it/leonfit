import { useRef } from 'react'
import { DEFAULT_DATA } from '../data.js'
import { normalize } from '../store.js'

export default function BackupTab({ store, commit, notify }) {
  const file = useRef()

  const download = () => {
    const { settings, categories, products, combos } = store
    const blob = new Blob([JSON.stringify({ settings, categories, products, combos }, null, 2)], { type: 'application/json' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `leonfit-copia-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(a.href)
  }

  const restore = async (e) => {
    const f = e.target.files?.[0]
    e.target.value = ''
    if (!f) return
    try {
      const j = JSON.parse(await f.text())
      if (!Array.isArray(j.products) || !Array.isArray(j.categories)) throw new Error()
      if (!window.confirm(`Esta copia tiene ${j.products.length} productos y reemplazará TODO lo actual. ¿Continuar?`)) return
      commit(normalize(j), 'Copia restaurada ✔')
    } catch { notify('Ese archivo no es una copia válida de LeonFit', true) }
  }

  const reset = () => window.confirm('Esto borra tu catálogo y vuelve a los productos de ejemplo. ¿Seguro?') && commit(DEFAULT_DATA, 'Datos de ejemplo restaurados')

  return (
    <>
      <div className="ad-bar"><div><h2>Copia de seguridad</h2><p className="ad-sub">Descarga una copia antes de hacer cambios grandes. Guarda todo: productos, categorías, combos y ajustes.</p></div></div>
      <div className="ad-cards">
        <section className="ad-card ad-sec"><h3>Descargar copia</h3><p className="ad-sub">Un archivo .json con toda la tienda.</p><button className="ad-btn gold" onClick={download}>⬇ Descargar copia</button></section>
        <section className="ad-card ad-sec"><h3>Restaurar copia</h3><p className="ad-sub">Sube un archivo descargado antes. Reemplaza todo lo actual.</p><button className="ad-btn" onClick={() => file.current.click()}>⬆ Restaurar copia</button><input ref={file} type="file" accept="application/json,.json" hidden onChange={restore} /></section>
        <section className="ad-card ad-sec"><h3>Volver a los ejemplos</h3><p className="ad-sub">Deja la tienda con los productos de ejemplo iniciales.</p><button className="ad-btn danger" onClick={reset}>Restablecer ejemplos</button></section>
      </div>
    </>
  )
}
