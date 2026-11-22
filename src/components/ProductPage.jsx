import { useEffect, useState } from 'react'
import ProductArt from './ProductArt.jsx'
import { money, pct } from '../data.js'
import { useData } from '../DataContext.jsx'

export default function ProductPage({ p, onAdd, onBack, onOpen, onCategory }) {
  const { categories: CATEGORIES, products: PRODUCTS, settings } = useData()
  const [qty, setQty] = useState(1)
  const cat = CATEGORIES.find((c) => c.id === p.cat)
  const off = pct(p)
  const related = PRODUCTS.filter((x) => x.cat === p.cat && x.id !== p.id).concat(PRODUCTS.filter((x) => x.cat !== p.cat && x.id !== p.id)).slice(0, 4)

  useEffect(() => {
    setQty(1)
    window.scrollTo({ top: 0 })
  }, [p.id])

  const buyNow = () => {
    const msg = `Hola LeonFit 🦁, quiero comprar:\n\n• ${qty}x ${p.name} (${p.flavor}) — ${money(p.price * qty)}\n\n¿Está disponible?`
    window.open(`https://wa.me/${settings.whatsapp}?text=${encodeURIComponent(msg)}`, '_blank')
  }

  return (
    <div className="pp">
      <nav className="crumbs">
        <a onClick={onBack}>Inicio</a> / <a onClick={() => onCategory(p.cat)}>{cat?.name}</a> / <span>{p.name}</span>
      </nav>

      <section className="pp-main">
        <div className="pp-gallery">
          {off > 0 && <span className="off">-{off}%</span>}
          <ProductArt color={p.color} label={p.label} size={p.size} name={p.name} image={p.image} />
        </div>

        <div className="pp-info">
          <small className="pp-brand">{p.brand} · {cat?.name}</small>
          <h1>{p.name}</h1>
          <div className="pp-price">
            <strong>{money(p.price)}</strong>
            {p.old && <s>{money(p.old)}</s>}
            {off > 0 && <em>Ahorras {money(p.old - p.price)}</em>}
          </div>
          <p className="pp-short">{p.desc}</p>

          <ul className="specs">
            <li><b>Sabor</b>{p.flavor}</li>
            <li><b>Presentación</b>{p.size}</li>
            {p.servings ? <li><b>Servicios</b>{p.servings}</li> : null}
            <li><b>Disponibilidad</b>{p.soldOut ? <span className="no">● Agotado</span> : <span className="ok">● En stock</span>}</li>
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
            <li>🚚 {settings.freeShipping ? `Envío gratis en compras desde ${money(settings.freeShipping)}` : 'Envíos a toda Colombia'}</li>
            <li>✔ Producto 100% original</li>
            <li>💬 Asesoría gratis por WhatsApp</li>
          </ul>
        </div>
      </section>

      <section className="pp-tabs" id="pp-tabs">
        <div className="pp-panel">
          <h3>Sobre {p.name}</h3>
          <p>{p.desc || 'Escríbenos por WhatsApp y te damos todos los detalles de este producto.'}</p>
          <small className="note">Revisa siempre la etiqueta del producto. Los suplementos no sustituyen una dieta equilibrada; consulta a tu médico si tienes alguna condición.</small>
        </div>
      </section>

      <section className="pp-related">
        <div className="head"><span className="eyebrow">Te puede gustar</span><h2>Productos relacionados</h2></div>
        <div className="grid four">
          {related.map((r) => (
            <article className="card" key={r.id}>
              <div className="card-top">
                {pct(r) > 0 && <span className="off">-{pct(r)}%</span>}
                <button className="card-art" onClick={() => onOpen(r)} aria-label={`Ver ${r.name}`}><ProductArt color={r.color} label={r.label} size={r.size} name={r.name} image={r.image} /></button>
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
