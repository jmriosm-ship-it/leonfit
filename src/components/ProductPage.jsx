import { useEffect, useState } from 'react'
import ProductArt from './ProductArt.jsx'
import { CAT_INFO, CATEGORIES, PRODUCTS, WHATSAPP, getReviews, money, pct, ratingBars } from '../data.js'

const stars = (n) => '★'.repeat(n) + '☆'.repeat(5 - n)

export default function ProductPage({ p, onAdd, onBack, onOpen, onCategory }) {
  const [qty, setQty] = useState(1)
  const [tab, setTab] = useState('desc')
  const [mine, setMine] = useState([])
  const [form, setForm] = useState({ name: '', rating: 5, text: '' })
  const key = `leonfit-reviews-${p.id}`
  const info = CAT_INFO[p.cat]
  const cat = CATEGORIES.find((c) => c.id === p.cat)
  const off = pct(p)
  const reviews = [...mine, ...getReviews(p)]
  const total = p.reviews + mine.length
  const related = PRODUCTS.filter((x) => x.cat === p.cat && x.id !== p.id).concat(PRODUCTS.filter((x) => x.cat !== p.cat && x.id !== p.id)).slice(0, 4)

  useEffect(() => {
    setQty(1)
    setTab('desc')
    try { setMine(JSON.parse(localStorage.getItem(key)) || []) } catch { setMine([]) }
    window.scrollTo({ top: 0 })
  }, [p.id])

  const submit = (e) => {
    e.preventDefault()
    if (!form.name.trim() || !form.text.trim()) return
    const r = { name: form.name.trim(), rating: Number(form.rating), text: form.text.trim(), when: 'justo ahora', verified: false }
    const next = [r, ...mine]
    setMine(next)
    try { localStorage.setItem(key, JSON.stringify(next)) } catch { /* sin storage */ }
    setForm({ name: '', rating: 5, text: '' })
  }

  const buyNow = () => {
    const msg = `Hola LeonFit 🦁, quiero comprar:\n\n• ${qty}x ${p.name} (${p.flavor}) — ${money(p.price * qty)}\n\n¿Está disponible?`
    window.open(`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(msg)}`, '_blank')
  }

  return (
    <div className="pp">
      <nav className="crumbs">
        <a onClick={onBack}>Inicio</a> / <a onClick={() => onCategory(p.cat)}>{cat?.name}</a> / <span>{p.name}</span>
      </nav>

      <section className="pp-main">
        <div className="pp-gallery">
          {off > 0 && <span className="off">-{off}%</span>}
          <ProductArt color={p.color} label={p.label} size={p.size} name={p.name} />
        </div>

        <div className="pp-info">
          <small className="pp-brand">{p.brand} · {cat?.name}</small>
          <h1>{p.name}</h1>
          <div className="pp-rate">
            <span className="stars">{stars(Math.round(p.rating))}</span> <b>{p.rating}</b>
            <a onClick={() => { setTab('rev'); document.getElementById('pp-tabs')?.scrollIntoView({ behavior: 'smooth' }) }}>{total} reseñas</a>
          </div>

          <div className="pp-price">
            <strong>{money(p.price)}</strong>
            {p.old && <s>{money(p.old)}</s>}
            {off > 0 && <em>Ahorras {money(p.old - p.price)}</em>}
          </div>
          <p className="pp-short">{p.desc}</p>

          <ul className="specs">
            <li><b>Sabor</b>{p.flavor}</li>
            <li><b>Presentación</b>{p.size}</li>
            <li><b>Servicios</b>{p.servings}</li>
            <li><b>Disponibilidad</b><span className="ok">● En stock</span></li>
          </ul>

          <div className="pp-buy">
            <div className="qty big">
              <button onClick={() => setQty(Math.max(1, qty - 1))} aria-label="Menos">−</button>
              <span>{qty}</span>
              <button onClick={() => setQty(qty + 1)} aria-label="Más">+</button>
            </div>
            <button className="btn-gold" onClick={() => onAdd(p, qty)}>Agregar al carrito · {money(p.price * qty)}</button>
          </div>
          <button className="btn-line wide" onClick={buyNow}>Comprar por WhatsApp</button>

          <ul className="pp-perks">
            <li>🚚 Envío gratis en compras desde $180.000</li>
            <li>✔ Producto 100% original</li>
            <li>💬 Asesoría gratis por WhatsApp</li>
          </ul>
        </div>
      </section>

      <section className="pp-tabs" id="pp-tabs">
        <div className="chips">
          {[['desc', 'Descripción'], ['nut', 'Información nutricional'], ['use', 'Modo de uso'], ['rev', `Reseñas (${total})`]].map(([id, n]) => (
            <button key={id} className={tab === id ? 'chip on' : 'chip'} onClick={() => setTab(id)}>{n}</button>
          ))}
        </div>

        {tab === 'desc' && (
          <div className="pp-panel">
            <h3>Sobre {p.name}</h3>
            <p>{p.desc} Presentación de {p.size} con {p.servings} servicios, sabor {p.flavor}.</p>
            <ul className="checks">{info.benefits.map((b) => <li key={b}>{b}</li>)}</ul>
          </div>
        )}

        {tab === 'nut' && (
          <div className="pp-panel">
            <h3>Información nutricional</h3>
            <table className="nut">
              <thead><tr><th>Por servicio</th><th>Cantidad</th></tr></thead>
              <tbody>{info.nutrition.map(([a, b]) => <tr key={a}><td>{a}</td><td>{b}</td></tr>)}</tbody>
            </table>
            <small className="note">Valores de ejemplo. Revisa siempre la etiqueta del producto.</small>
          </div>
        )}

        {tab === 'use' && (
          <div className="pp-panel">
            <h3>Modo de uso</h3>
            <p>{info.usage}</p>
            <small className="note">Los suplementos no reemplazan una dieta equilibrada. Consulta a tu médico si estás embarazada, lactando o tienes alguna condición.</small>
          </div>
        )}

        {tab === 'rev' && (
          <div className="pp-panel reviews">
            <div className="rev-sum">
              <div className="rev-score"><b>{p.rating}</b><span className="stars">{stars(Math.round(p.rating))}</span><small>{total} reseñas</small></div>
              <div className="rev-bars">
                {ratingBars(p.rating).map(([n, v]) => (
                  <div key={n}><span>{n}★</span><i><u style={{ width: v * 100 + '%' }} /></i><em>{Math.round(v * 100)}%</em></div>
                ))}
              </div>
            </div>

            <form className="rev-form" onSubmit={submit}>
              <h3>Escribe tu reseña</h3>
              <div className="rev-row">
                <input placeholder="Tu nombre" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                <select value={form.rating} onChange={(e) => setForm({ ...form, rating: e.target.value })} aria-label="Calificación">
                  {[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{stars(n)}</option>)}
                </select>
              </div>
              <textarea rows="3" placeholder="Cuéntanos qué tal te fue con el producto" value={form.text} onChange={(e) => setForm({ ...form, text: e.target.value })} />
              <button className="btn-add" type="submit">Publicar reseña</button>
            </form>

            <div className="rev-list">
              {reviews.map((r, i) => (
                <article key={i} className="rev">
                  <header>
                    <b>{r.name}</b>
                    {r.verified && <span className="ver">✔ Compra verificada</span>}
                    <small>{r.when}</small>
                  </header>
                  <span className="stars">{stars(r.rating)}</span>
                  <p>{r.text}</p>
                </article>
              ))}
            </div>
          </div>
        )}
      </section>

      <section className="pp-related">
        <div className="head"><span className="eyebrow">Te puede gustar</span><h2>Productos relacionados</h2></div>
        <div className="grid four">
          {related.map((r) => (
            <article className="card" key={r.id}>
              <div className="card-top">
                {pct(r) > 0 && <span className="off">-{pct(r)}%</span>}
                <button className="card-art" onClick={() => onOpen(r)} aria-label={`Ver ${r.name}`}><ProductArt color={r.color} label={r.label} size={r.size} name={r.name} /></button>
              </div>
              <div className="card-body">
                <small>{r.brand} · {r.size}</small>
                <h3>{r.name}</h3>
                <div className="price-row">
                  <div><strong>{money(r.price)}</strong>{r.old && <s>{money(r.old)}</s>}</div>
                  <button className="btn-add" onClick={() => onOpen(r)}>Ver</button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <div className="pp-sticky">
        <div><b>{p.name}</b><span>{money(p.price * qty)}</span></div>
        <button className="btn-gold" onClick={() => onAdd(p, qty)}>Agregar</button>
      </div>
    </div>
  )
}
