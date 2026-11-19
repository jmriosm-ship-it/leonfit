import { useEffect, useMemo, useState } from 'react'
import ProductArt from './components/ProductArt.jsx'
import ProductPage from './components/ProductPage.jsx'
import { Socials } from './components/Icons.jsx'
import { CATEGORIES, COMBOS, COUPONS, FAQ, FREE_SHIPPING, PRODUCTS, WHATSAPP, money, pct } from './data.js'

const byId = (id) => PRODUCTS.find((p) => p.id === id)

function useCountdown() {
  const calc = () => {
    const end = new Date()
    end.setHours(23, 59, 59, 999)
    const s = Math.max(0, Math.floor((end - new Date()) / 1000))
    return [Math.floor(s / 3600), Math.floor((s % 3600) / 60), s % 60]
  }
  const [t, setT] = useState(calc)
  useEffect(() => {
    const i = setInterval(() => setT(calc()), 1000)
    return () => clearInterval(i)
  }, [])
  return t.map((n) => String(n).padStart(2, '0'))
}

function Stars({ value }) {
  return <span className="stars" aria-label={`${value} de 5`}>{'★'.repeat(Math.round(value))}<i>{'★'.repeat(5 - Math.round(value))}</i> <b>{value}</b></span>
}

function Card({ p, onAdd, onOpen }) {
  const off = pct(p)
  return (
    <article className="card">
      <div className="card-top">
        {off > 0 && <span className="off">-{off}%</span>}
        {p.badge && <span className="badge">{p.badge}</span>}
        <button className="card-art" onClick={() => onOpen(p)} aria-label={`Ver ${p.name}`}>
          <ProductArt color={p.color} label={p.label} name={p.name} size={p.size} />
        </button>
      </div>
      <div className="card-body">
        <small>{p.brand} · {p.size}</small>
        <h3>{p.name}</h3>
        <p className="flavor">{p.flavor}</p>
        <Stars value={p.rating} />
        <div className="price-row">
          <div>
            <strong>{money(p.price)}</strong>
            {p.old && <s>{money(p.old)}</s>}
          </div>
          <button className="btn-add" onClick={() => onAdd(p)}>Agregar</button>
        </div>
      </div>
    </article>
  )
}

export default function App() {
  const [cart, setCart] = useState(() => {
    try { return JSON.parse(localStorage.getItem('leonfit-cart')) || [] } catch { return [] }
  })
  const [open, setOpen] = useState(false)
  const [menu, setMenu] = useState(false)
  const [sort, setSort] = useState('popular')
  const [q, setQ] = useState('')
  const readRoute = () => {
    const m = window.location.hash.match(/^#\/(producto|categoria)\/([\w-]+)/)
    if (!m) return { page: 'home' }
    if (m[1] === 'producto') {
      const p = PRODUCTS.find((x) => x.id === Number(m[2]))
      return p ? { page: 'prod', p } : { page: 'home' }
    }
    return { page: 'cat', id: m[2] }
  }
  const [route, setRoute] = useState(readRoute)
  useEffect(() => {
    const on = () => { setRoute(readRoute()); window.scrollTo({ top: 0 }) }
    window.addEventListener('hashchange', on)
    return () => window.removeEventListener('hashchange', on)
  }, [])
  const setDetail = (p) => { window.location.hash = `/producto/${p.id}` }
  const filterTo = (c) => { setMenu(false); window.location.hash = `/categoria/${c}` }
  const [coupon, setCoupon] = useState('')
  const [applied, setApplied] = useState(null)
  const [toast, setToast] = useState('')
  const [h, m, s] = useCountdown()

  useEffect(() => {
    try { localStorage.setItem('leonfit-cart', JSON.stringify(cart)) } catch { /* sin storage */ }
  }, [cart])

  const flash = (msg) => {
    setToast(msg)
    clearTimeout(flash.t)
    flash.t = setTimeout(() => setToast(''), 2200)
  }

  const add = (p, n = 1) => {
    setCart((c) => {
      const i = c.findIndex((x) => x.key === 'p' + p.id)
      if (i >= 0) return c.map((x, j) => (j === i ? { ...x, qty: x.qty + n } : x))
      return [...c, { key: 'p' + p.id, name: p.name, sub: p.flavor, price: p.price, color: p.color, label: p.label, size: p.size, qty: n }]
    })
    flash(`${p.name} agregado al carrito`)
  }

  const addCombo = (cb) => {
    const items = cb.items.map(byId)
    const price = items.reduce((a, p) => a + p.price, 0) * (1 - cb.off)
    setCart((c) => {
      if (c.some((x) => x.key === cb.id)) return c.map((x) => (x.key === cb.id ? { ...x, qty: x.qty + 1 } : x))
      return [...c, { key: cb.id, name: cb.name, sub: cb.blurb, price, color: items[0].color, label: 'COMBO', size: '3 en 1', qty: 1 }]
    })
    flash(`${cb.name} agregado`)
  }

  const setQty = (key, d) =>
    setCart((c) => c.map((x) => (x.key === key ? { ...x, qty: x.qty + d } : x)).filter((x) => x.qty > 0))

  const count = cart.reduce((a, x) => a + x.qty, 0)
  const subtotal = cart.reduce((a, x) => a + x.price * x.qty, 0)
  const discount = applied ? subtotal * COUPONS[applied] : 0
  const total = subtotal - discount
  const missing = Math.max(0, FREE_SHIPPING - total)

  const applyCoupon = () => {
    const code = coupon.trim().toUpperCase()
    if (COUPONS[code]) { setApplied(code); flash(`Cupón ${code} aplicado`) }
    else { setApplied(null); flash('Cupón no válido') }
  }

  const checkout = () => {
    const lines = cart.map((x) => `• ${x.qty}x ${x.name} — ${money(x.price * x.qty)}`).join('\n')
    const msg = `Hola LeonFit 🦁, quiero hacer este pedido:\n\n${lines}\n\n${applied ? `Cupón ${applied}: -${money(discount)}\n` : ''}Total: ${money(total)}${missing === 0 ? ' (envío gratis)' : ''}`
    window.open(`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(msg)}`, '_blank')
  }

  const catId = route.page === 'cat' ? route.id : null
  const list = useMemo(() => {
    if (!catId) return []
    let l = PRODUCTS.filter((p) => catId === 'todos' || catId === 'buscar' || p.cat === catId)
    if (catId === 'ofertas') l = PRODUCTS.filter((p) => p.old)
    if (catId === 'buscar') l = l.filter((p) => (p.name + p.brand + p.flavor + p.cat).toLowerCase().includes(q.toLowerCase()))
    const sorters = { popular: (a, b) => b.reviews - a.reviews, menor: (a, b) => a.price - b.price, mayor: (a, b) => b.price - a.price, desc: (a, b) => pct(b) - pct(a) }
    return [...l].sort(sorters[sort])
  }, [catId, sort, q])
  const catInfo = CATEGORIES.find((c) => c.id === catId)
  const catTitle = catId === 'todos' ? 'Toda la tienda' : catId === 'ofertas' ? 'Ofertas 🔥' : catId === 'buscar' ? `Resultados para "${q}"` : catInfo?.name

  const flashDeals = [...PRODUCTS].filter((p) => p.old).sort((a, b) => pct(b) - pct(a)).slice(0, 4)
  const go = (id) => {
    setMenu(false)
    if (window.location.hash) {
      history.pushState(null, '', window.location.pathname)
      setRoute({ page: 'home' })
      setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }), 60)
    } else document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <>
      <div className="announce">
        <div className="marquee">
          {[0, 1].map((k) => (
            <span key={k}>
              🦁 ENVÍO GRATIS EN COMPRAS DESDE {money(FREE_SHIPPING)} &nbsp;•&nbsp; USA EL CUPÓN <b>LEON10</b> Y ACUMULA 10% OFF &nbsp;•&nbsp; PRODUCTOS 100% ORIGINALES &nbsp;•&nbsp; COMBOS CON HASTA 18% OFF &nbsp;•&nbsp;
            </span>
          ))}
        </div>
      </div>

      <header className="header">
        <button className="burger" onClick={() => setMenu(!menu)} aria-label="Menú">☰</button>
        <a href="#top" className="brand" onClick={() => go('top')}>
          <img src="/logo.jpg" alt="LeonFit" />
          <span>LEON<b>FIT</b></span>
        </a>
        <nav className={menu ? 'nav show' : 'nav'}>
          <div className="dd">
            <a onClick={() => filterTo('todos')}>Categorías ▾</a>
            <div className="dd-menu">
              <a onClick={() => filterTo('todos')}><b>Ver todo</b><small>Toda la tienda</small></a>
              {CATEGORIES.map((c) => (
                <a key={c.id} onClick={() => filterTo(c.id)}><b>{c.name}</b><small>{c.tag}</small></a>
              ))}
            </div>
          </div>
          <a onClick={() => filterTo('ofertas')} className="hot">Ofertas 🔥</a>
          <a onClick={() => go('combos')}>Combos</a>
          <a onClick={() => go('nosotros')}>Por qué LeonFit</a>
          <a onClick={() => go('faq')}>Preguntas</a>
        </nav>
        <div className="search">
          <input value={q} onChange={(e) => { setQ(e.target.value); if (e.target.value && catId !== 'buscar') filterTo('buscar') }} placeholder="Buscar proteína, creatina…" />
        </div>
        <button className="cart-btn" onClick={() => setOpen(true)} aria-label="Carrito">
          🛒<span>{count}</span>
        </button>
      </header>

      {route.page === 'prod' ? (
        <main id="top">
          <ProductPage p={route.p} onAdd={(p, n) => { add(p, n); setOpen(true) }} onBack={() => go('top')} onOpen={setDetail} onCategory={filterTo} />
        </main>
      ) : route.page === 'cat' ? (
        <main id="top" className="catpage">
          <nav className="crumbs"><a onClick={() => go('top')}>Inicio</a> / <span>{catTitle}</span></nav>
          <div className="head row">
            <div><span className="eyebrow">{catInfo?.tag || 'Catálogo'}</span><h2>{catTitle}</h2><p className="count">{list.length} productos</p></div>
            <select value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Ordenar">
              <option value="popular">Más populares</option>
              <option value="desc">Mayor descuento</option>
              <option value="menor">Precio: menor a mayor</option>
              <option value="mayor">Precio: mayor a menor</option>
            </select>
          </div>
          <div className="chips">
            {[{ id: 'todos', name: 'Todos' }, { id: 'ofertas', name: '🔥 Ofertas' }, ...CATEGORIES].map((c) => (
              <button key={c.id} className={catId === c.id ? 'chip on' : 'chip'} onClick={() => filterTo(c.id)}>{c.name}</button>
            ))}
          </div>
          {list.length ? (
            <div className="grid">{list.map((p) => <Card key={p.id} p={p} onAdd={add} onOpen={setDetail} />)}</div>
          ) : (
            <p className="empty">No encontramos productos. Escríbenos por WhatsApp y lo conseguimos.</p>
          )}
        </main>
      ) : (
      <main id="top">
        <section className="hero">
          <div className="hero-glow" />
          <div className="hero-text">
            <span className="eyebrow">Sports Supplement Store</span>
            <h1>Despierta<br />al <em>león</em><br />que llevas dentro.</h1>
            <p>Proteínas, creatina y pre-entrenos 100% originales con descuentos que sí se notan. Pide por WhatsApp y recibe en casa.</p>
            <div className="hero-cta">
              <button className="btn-gold" onClick={() => filterTo('todos')}>Comprar ahora</button>
              <button className="btn-line" onClick={() => filterTo('ofertas')}>Ver ofertas -35%</button>
            </div>
            <ul className="hero-stats">
              <li><b>+1.500</b>clientes felices</li>
              <li><b>100%</b>originales</li>
              <li><b>24 h</b>despacho</li>
            </ul>
          </div>
          <div className="hero-art">
            <div className="hero-ring" />
            <div className="stack s1"><ProductArt color="#6b3a1e" label="WHEY" size="2 lb" name="Whey" /></div>
            <div className="stack s2"><ProductArt color="#e5322b" label="PRE" size="300 g" name="Pre" /></div>
            <div className="stack s3"><ProductArt color="#e8e8e8" label="CREA" size="300 g" name="Creatina" /></div>
            <div className="hero-tag">-35%<small>solo hoy</small></div>
          </div>
        </section>

        <section className="trust">
          {[['✔', 'Productos originales', 'Lote y registro verificable'], ['🚚', 'Envío gratis', `Desde ${money(FREE_SHIPPING)}`], ['💬', 'Asesoría por WhatsApp', 'Te guiamos según tu meta'], ['🔒', 'Compra segura', 'Pago confirmado contigo']].map(([i, t, d]) => (
            <div key={t}><span>{i}</span><b>{t}</b><small>{d}</small></div>
          ))}
        </section>

        <section className="section" id="categorias">
          <div className="head row">
            <div><span className="eyebrow">Compra por categoría</span><h2>Elige tu categoría</h2></div>
          </div>
          <div className="bigcats">
            {CATEGORIES.map((c, i) => {
              const items = PRODUCTS.filter((p) => p.cat === c.id)
              const top = items[0]
              return (
                <button key={c.id} className="bigcat" onClick={() => filterTo(c.id)} style={{ '--c': top.color }}>
                  <div className="bigcat-art"><ProductArt color={top.color} label={top.label} size={top.size} name={c.name} /></div>
                  <div className="bigcat-info">
                    <em>0{i + 1}</em>
                    <small>{c.tag}</small>
                    <b>{c.name}</b>
                    <span>{items.length} productos · Ver todos →</span>
                  </div>
                </button>
              )
            })}
          </div>
          <button className="offers-banner" onClick={() => filterTo('ofertas')}>
            <span>🔥 Hasta -35%</span>
            <b>Todas las ofertas en un solo lugar</b>
            <em>Ver ofertas →</em>
          </button>
        </section>

        <section className="section flash">
          <div className="head row">
            <div><span className="eyebrow">Oferta relámpago</span><h2>Se acaba hoy</h2></div>
            <div className="timer" aria-label="Tiempo restante">
              <div><b>{h}</b>hrs</div><i>:</i><div><b>{m}</b>min</div><i>:</i><div><b>{s}</b>seg</div>
            </div>
          </div>
          <div className="grid four">
            {flashDeals.map((p) => <Card key={p.id} p={p} onAdd={add} onOpen={setDetail} />)}
          </div>
        </section>

        <section className="section" id="combos">
          <div className="head"><span className="eyebrow">Ahorra más</span><h2>Combos con descuento extra</h2></div>
          <div className="combos">
            {COMBOS.map((cb) => {
              const items = cb.items.map(byId)
              const full = items.reduce((a, p) => a + p.price, 0)
              const price = full * (1 - cb.off)
              return (
                <article key={cb.id} className="combo">
                  <span className="off">-{Math.round(cb.off * 100)}%</span>
                  <div className="combo-arts">
                    {items.map((p) => <ProductArt key={p.id} color={p.color} label={p.label} size={p.size} name={p.name} glow={false} />)}
                  </div>
                  <h3>{cb.name}</h3>
                  <p>{cb.blurb}</p>
                  <div className="price-row">
                    <div><strong>{money(price)}</strong><s>{money(full)}</s><small className="save">Ahorras {money(full - price)}</small></div>
                    <button className="btn-add" onClick={() => addCombo(cb)}>Agregar combo</button>
                  </div>
                </article>
              )
            })}
          </div>
        </section>

        <section className="section about" id="nosotros">
          <div className="about-logo"><img src="/logo.jpg" alt="Logo LeonFit" /></div>
          <div>
            <span className="eyebrow">Por qué LeonFit</span>
            <h2>Rendimiento real,<br />precio de manada.</h2>
            <p>Somos una tienda especializada en nutrición deportiva. Seleccionamos cada producto, verificamos su origen y te asesoramos para que compres lo que realmente necesitas, sin pagar de más.</p>
            <ul className="checks">
              <li>Solo marcas y proveedores autorizados</li>
              <li>Asesoría personalizada sin costo</li>
              <li>Descuentos por volumen, cupones y combos</li>
              <li>Entrega rápida en tu ciudad y envíos nacionales</li>
            </ul>
            <button className="btn-gold" onClick={() => window.open(`https://wa.me/${WHATSAPP}`, '_blank')}>Hablar con un asesor</button>
          </div>
        </section>

        <section className="section" id="faq">
          <div className="head"><span className="eyebrow">Dudas</span><h2>Preguntas frecuentes</h2></div>
          <div className="faq">
            {FAQ.map(([a, b]) => (
              <details key={a}><summary>{a}</summary><p>{b}</p></details>
            ))}
          </div>
        </section>

        <section className="cta">
          <h2>¿Listo para tu próximo nivel?</h2>
          <p>Usa el cupón <b>LEON10</b> en tu primera compra.</p>
          <button className="btn-gold" onClick={() => filterTo('todos')}>Ir a la tienda</button>
        </section>
      </main>
      )}

      <footer className="footer">
        <div>
          <img src="/logo.jpg" alt="" />
          <p>LeonFit — Sports Supplement Store.<br />Tu tienda de suplementos deportivos.</p>
        </div>
        <div><b>Tienda</b>{CATEGORIES.slice(0, 4).map((c) => <a key={c.id} onClick={() => filterTo(c.id)}>{c.name}</a>)}</div>
        <div><b>Ayuda</b><a onClick={() => go('faq')}>Preguntas</a><a onClick={() => go('combos')}>Combos</a><a onClick={() => go('nosotros')}>Nosotros</a></div>
        <div><b>Contacto</b><a>WhatsApp: +57 300 000 0000</a><a>Instagram y TikTok: @leonfit</a><a>Lun–Sáb · 8am–7pm</a><Socials /></div>
        <small>© {new Date().getFullYear()} LeonFit. Los suplementos no sustituyen una dieta equilibrada. Consulta a tu médico.</small>
      </footer>

      <Socials className="float" />
      {toast && <div className="toast">{toast}</div>}

      <div className={open ? 'drawer-bg show' : 'drawer-bg'} onClick={() => setOpen(false)} />
      <aside className={open ? 'drawer show' : 'drawer'} aria-hidden={!open}>
        <div className="drawer-head"><h3>Tu carrito ({count})</h3><button onClick={() => setOpen(false)} aria-label="Cerrar">✕</button></div>
        <div className="ship">
          <p>{missing === 0 ? '🎉 ¡Tienes envío gratis!' : `Te faltan ${money(missing)} para envío gratis`}</p>
          <div className="bar"><i style={{ width: Math.min(100, (total / FREE_SHIPPING) * 100) + '%' }} /></div>
        </div>
        <div className="lines">
          {cart.length === 0 && <p className="empty">Tu carrito está vacío. ¡Agrega algo de fuerza!</p>}
          {cart.map((x) => (
            <div className="line" key={x.key}>
              <div className="line-art"><ProductArt color={x.color} label={x.label} size={x.size} glow={false} /></div>
              <div>
                <b>{x.name}</b>
                <small>{x.sub}</small>
                <div className="qty">
                  <button onClick={() => setQty(x.key, -1)}>−</button><span>{x.qty}</span><button onClick={() => setQty(x.key, 1)}>+</button>
                </div>
              </div>
              <strong>{money(x.price * x.qty)}</strong>
            </div>
          ))}
        </div>
        {cart.length > 0 && (
          <div className="drawer-foot">
            <div className="coupon">
              <input value={coupon} onChange={(e) => setCoupon(e.target.value)} placeholder="Cupón (prueba LEON10)" />
              <button onClick={applyCoupon}>Aplicar</button>
            </div>
            <div className="sum"><span>Subtotal</span><span>{money(subtotal)}</span></div>
            {applied && <div className="sum green"><span>Cupón {applied}</span><span>-{money(discount)}</span></div>}
            <div className="sum"><span>Envío</span><span>{missing === 0 ? 'Gratis' : 'Se calcula al confirmar'}</span></div>
            <div className="sum big"><span>Total</span><span>{money(total)}</span></div>
            <button className="btn-gold wide" onClick={checkout}>Pedir por WhatsApp</button>
          </div>
        )}
      </aside>
    </>
  )
}
