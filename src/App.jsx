import { useEffect, useMemo, useState } from 'react'
import ProductArt from './components/ProductArt.jsx'
import ProductPage from './components/ProductPage.jsx'
import { Socials } from './components/Icons.jsx'
import LegalPage from './components/LegalPage.jsx'
import CartPage from './components/CartPage.jsx'
import { LEGAL } from './legal.js'
import { money, pct } from './data.js'
import { useData } from './DataContext.jsx'

// Texto con *palabra* → palabra resaltada en dorado; salto de línea → <br>.
const fancy = (t = '') => t.split('\n').map((line, i) => (
  <span key={i}>{i > 0 && <br />}{line.split(/(\*[^*]+\*)/g).map((x, j) => (x.startsWith('*') && x.endsWith('*') && x.length > 2 ? <em key={j}>{x.slice(1, -1)}</em> : x))}</span>
))

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
        {p.soldOut ? <span className="badge sold">Agotado</span> : p.badge && <span className="badge">{p.badge}</span>}
        <button className="card-art" onClick={() => onOpen(p)} aria-label={`Ver ${p.name}`}>
          <ProductArt color={p.color} label={p.label} name={p.name} size={p.size} image={p.image} />
        </button>
      </div>
      <div className="card-body">
        <small>{p.brand} · {p.size}</small>
        <h3>{p.name}</h3>
        <p className="flavor">{p.flavor}</p>
        {p.reviews > 0 && <Stars value={p.rating} />}
        <div className="price-row">
          <div>
            <strong>{money(p.price)}</strong>
            {p.old && <s>{money(p.old)}</s>}
          </div>
          <button className="btn-add" disabled={p.soldOut} onClick={() => onAdd(p)}>{p.soldOut ? 'Agotado' : 'Agregar'}</button>
        </div>
      </div>
    </article>
  )
}

export default function App() {
  const store = useData()
  const { categories: CATEGORIES, settings } = store
  const PRODUCTS = useMemo(() => store.products.filter((p) => !p.hidden), [store.products])
  const COMBOS = useMemo(() => store.combos.filter((c) => c.active !== false), [store.combos])
  const COUPONS = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10)
    return Object.fromEntries((settings.coupons || [])
      .filter((c) => c.active !== false && !(c.expires && c.expires < today))
      .map((c) => [String(c.code).toUpperCase(), { type: c.type === 'cop' ? 'cop' : 'pct', value: Number(c.value ?? c.pct) || 0, min: Number(c.min) || 0 }]))
  }, [settings.coupons])
  const FREE_SHIPPING = settings.freeShipping
  const WHATSAPP = settings.whatsapp
  const byId = (id) => PRODUCTS.find((p) => p.id === id)
  const maxOff = Math.max(0, ...PRODUCTS.map(pct))
  const BASE = import.meta.env.BASE_URL
  const phone = WHATSAPP.replace(/^57(\d{3})(\d{3})(\d{4})$/, '+57 $1 $2 $3')
  const igHandle = (settings.instagram || '').replace(/[#?].*$/, '').split('/').filter(Boolean).pop() || ''
  const shopCats = CATEGORIES.filter((c) => PRODUCTS.some((p) => p.cat === c.id))
  const [shopCat, setShopCat] = useState('')
  const shopId = shopCats.some((c) => c.id === shopCat) ? shopCat : shopCats[0]?.id
  const shopList = PRODUCTS.filter((p) => p.cat === shopId).slice(0, 8)
  const [cart, setCart] = useState(() => {
    try { return JSON.parse(localStorage.getItem('leonfit-cart')) || [] } catch { return [] }
  })
  const [menu, setMenu] = useState(false)
  const [sort, setSort] = useState('popular')
  const [q, setQ] = useState('')
  const readRoute = () => {
    if (window.location.hash.startsWith('#/carrito')) return { page: 'cart' }
    const lg = window.location.hash.match(/^#\/(terminos|privacidad)/)
    if (lg) return { page: 'legal', kind: lg[1] }
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
      return [...c, { key: 'p' + p.id, name: p.name, sub: p.flavor, price: p.price, color: p.color, label: p.label, size: p.size, image: p.image, qty: n }]
    })
    flash(`${p.name} agregado al carrito`)
  }

  const addCombo = (cb) => {
    const items = cb.items.map(byId).filter(Boolean)
    if (!items.length) return
    const price = items.reduce((a, p) => a + p.price, 0) * (1 - cb.off / 100)
    setCart((c) => {
      if (c.some((x) => x.key === cb.id)) return c.map((x) => (x.key === cb.id ? { ...x, qty: x.qty + 1 } : x))
      return [...c, { key: cb.id, name: cb.name, sub: cb.blurb, price, color: items[0].color, label: 'COMBO', size: `${items.length} en 1`, image: items[0].image, qty: 1 }]
    })
    flash(`${cb.name} agregado`)
  }

  const goCart = () => { setMenu(false); window.location.hash = '/carrito' }
  const removeItem = (key) => setCart((c) => c.filter((x) => x.key !== key))
  const clearCart = () => { setCart([]); setApplied(null) }
  const setQty = (key, d) =>
    setCart((c) => c.map((x) => (x.key === key ? { ...x, qty: x.qty + d } : x)).filter((x) => x.qty > 0))

  const count = cart.reduce((a, x) => a + x.qty, 0)
  const subtotal = cart.reduce((a, x) => a + x.price * x.qty, 0)
  const cp = applied ? COUPONS[applied] : null
  const couponOk = Boolean(cp) && subtotal >= cp.min
  const discount = couponOk ? (cp.type === 'cop' ? Math.min(cp.value, subtotal) : Math.round((subtotal * cp.value) / 100)) : 0
  const total = subtotal - discount
  const missing = Math.max(0, FREE_SHIPPING - total)

  const applyCoupon = () => {
    const code = coupon.trim().toUpperCase()
    const c = COUPONS[code]
    if (!c) { setApplied(null); flash('Cupón no válido o vencido') }
    else if (subtotal < c.min) { setApplied(null); flash(`Este cupón aplica en compras desde ${money(c.min)}`) }
    else { setApplied(code); flash(`Cupón ${code} aplicado`) }
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

  const flagged = PRODUCTS.filter((p) => p.flash)
  const flashDeals = flagged.length ? flagged : [...PRODUCTS].filter((p) => p.old).sort((a, b) => pct(b) - pct(a)).slice(0, settings.flashCount || 4)
  const heroPicks = PRODUCTS.filter((p) => p.hero)
  const heroItems = (heroPicks.length ? heroPicks : PRODUCTS.filter((p) => p.image)).slice(0, 3)
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
              🦁 {settings.announcement.replace('{envio}', money(FREE_SHIPPING))} &nbsp;•&nbsp;
            </span>
          ))}
        </div>
      </div>

      <header className="header">
        <div className="hdr-top">
          <button className="burger" onClick={() => setMenu(!menu)} aria-label="Menú">☰</button>
          <a href="#top" className="brand" onClick={() => go('top')}>
            <img src={`${BASE}logo.jpg`} alt="LeonFit" />
            <span>LEON<b>FIT</b></span>
          </a>
          <div className="ship-to"><small>Enviar a</small><b>📍 Colombia</b></div>
          <div className="search">
            <input value={q} onChange={(e) => { setQ(e.target.value); if (e.target.value && catId !== 'buscar') filterTo('buscar') }} placeholder="Busca o pregúntanos: «proteína sin lactosa»" aria-label="Buscar" />
            <button className="search-btn" aria-label="Buscar" onClick={() => q && filterTo('buscar')}>
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
            </button>
          </div>
          <a className="hdr-link" href={`https://wa.me/${WHATSAPP}`} target="_blank" rel="noreferrer"><small>Escríbenos por WhatsApp</small><b>{phone}</b></a>
          <button className="cart-btn" onClick={goCart} aria-label="Carrito">
            🛒<span>{count}</span><em>Carrito</em>
          </button>
        </div>
        <nav className={menu ? 'nav show' : 'nav'}>
          <div className="dd">
            <a onClick={() => filterTo('todos')}>Comprar todo ▾</a>
            <div className="dd-menu">
              <a onClick={() => filterTo('todos')}><b>Ver todo</b><small>Toda la tienda</small></a>
              {CATEGORIES.map((c) => (
                <a key={c.id} onClick={() => filterTo(c.id)}><b>{c.name}</b><small>{c.tag}</small></a>
              ))}
            </div>
          </div>
          <a onClick={() => go('combos')}>Arma tu combo</a>
          <a onClick={() => filterTo('ofertas')}>Ofertas 🔥</a>
          <a href={`https://wa.me/${WHATSAPP}`} target="_blank" rel="noreferrer">Asesoría</a>
          <a onClick={() => go('nosotros')}>Nosotros</a>
          <a onClick={() => go('faq')}>Preguntas</a>
        </nav>
      </header>

      {route.page === 'cart' ? (
        <main id="top">
          <CartPage cart={cart} setQty={setQty} removeItem={removeItem} clearCart={clearCart} subtotal={subtotal} discount={discount} total={total} missing={missing} applied={couponOk ? applied : null} coupon={coupon} setCoupon={setCoupon} applyCoupon={applyCoupon} freeShipping={FREE_SHIPPING} whatsapp={WHATSAPP} onShop={() => filterTo('todos')} />
        </main>
      ) : route.page === 'legal' ? (
        <main id="top"><LegalPage kind={route.kind} onBack={() => go('top')} /></main>
      ) : route.page === 'prod' ? (
        <main id="top">
          <ProductPage p={route.p} onAdd={(p, n) => { add(p, n); goCart() }} onBack={() => go('top')} onOpen={setDetail} onCategory={filterTo} />
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
            <span className="pill-tag">● {settings.heroEyebrow}</span>
            <h1>{fancy(settings.heroTitle)}</h1>
            <p>{settings.heroText}</p>
            <div className="hero-cta">
              <button className="btn-white" onClick={() => filterTo('todos')}>Comprar ahora →</button>
              {maxOff > 0 && <button className="btn-line" onClick={() => filterTo('ofertas')}>Ver ofertas -{maxOff}%</button>}
            </div>
            <ul className="hero-stats">
              {(settings.heroStats || []).map(([b, t], i) => <li key={i}><b>{b}</b>{t}</li>)}
            </ul>
          </div>
          <div className="hero-art">
            {settings.heroImage ? (
              <img className="hero-img" src={settings.heroImage} alt="LeonFit" />
            ) : heroItems.length ? (
              <>
                <div className="hero-ring" />
                <div className={`hero-stack n${heroItems.length}`}>
                  {heroItems.map((p, i) => (
                    <button key={p.id} className={`stack s${i + 1}`} onClick={() => setDetail(p)} aria-label={p.name}>
                      <ProductArt color={p.color} label={p.label} size={p.size} name={p.name} image={p.image} />
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <>
                <div className="hero-ring" />
                <img className="hero-logo stack" src={`${BASE}logo.jpg`} alt="LeonFit" />
              </>
            )}
            <div className="hero-tag">{settings.heroTag || (maxOff ? `-${maxOff}%` : "🦁")}<small>{settings.heroTagSmall}</small></div>
          </div>
        </section>

        <section className="trust">
          {(settings.trust || []).map(([i, t, d]) => (
            <div key={t}><span>{i}</span><b>{t}</b><small>{d}</small></div>
          ))}
        </section>

        {PRODUCTS.length === 0 && (
        <section className="section" id="categorias">
          <div className="head"><span className="eyebrow">Catálogo</span><h2>Estamos <em>preparando</em> la tienda</h2></div>
          <p className="empty">Muy pronto verás aquí todos los productos. Mientras tanto, escríbenos por WhatsApp y te asesoramos.</p>
          <a className="btn-white dark-btn" href={`https://wa.me/${WHATSAPP}`} target="_blank" rel="noreferrer">Escribir por WhatsApp</a>
        </section>
        )}

        {PRODUCTS.length > 0 && (
        <section className="section" id="categorias">
          <div className="head row">
            <div><span className="eyebrow">Compra por categoría</span><h2>Compra por <em>categoría</em></h2></div>
          </div>
          <div className="bigcats">
            {CATEGORIES.filter((c) => PRODUCTS.some((p) => p.cat === c.id)).map((c, i) => {
              const items = PRODUCTS.filter((p) => p.cat === c.id)
              const top = items[0]
              return (
                <button key={c.id} className="bigcat" onClick={() => filterTo(c.id)} style={{ '--c': top.color }}>
                  <div className="bigcat-art"><ProductArt color={top.color} label={top.label} size={top.size} name={c.name} image={top.image} /></div>
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
            <span>🔥 {maxOff ? `Hasta -${maxOff}%` : 'Ofertas'}</span>
            <b>Todas las ofertas en un solo lugar</b>
            <em>Ver ofertas →</em>
          </button>
        </section>
        )}

        {shopCats.length > 0 && (
        <section className="section shop" id="tienda">
          <div className="head"><span className="eyebrow">Catálogo</span><h2>Encuentra el suplemento ideal para tu <em>meta</em></h2></div>
          <div className="tabs">
            {shopCats.map((c) => <button key={c.id} className={shopId === c.id ? 'on' : ''} onClick={() => setShopCat(c.id)}>{c.name}</button>)}
          </div>
          <div className="grid">{shopList.map((p) => <Card key={p.id} p={p} onAdd={add} onOpen={setDetail} />)}</div>
          <div className="center"><button className="btn-line dark" onClick={() => filterTo(shopId)}>Ver todo en {shopCats.find((c) => c.id === shopId)?.name} →</button></div>
        </section>
        )}

        {settings.flashOn && flashDeals.length > 0 && (
        <section className="section flash">
          <div className="head row">
            <div><span className="eyebrow">Oferta relámpago</span><h2>{settings.flashTitle}</h2></div>
            <div className="timer" aria-label="Tiempo restante">
              <div><b>{h}</b>hrs</div><i>:</i><div><b>{m}</b>min</div><i>:</i><div><b>{s}</b>seg</div>
            </div>
          </div>
          <div className="grid four">
            {flashDeals.map((p) => <Card key={p.id} p={p} onAdd={add} onOpen={setDetail} />)}
          </div>
        </section>
        )}

        {COMBOS.length > 0 && (
        <section className="section" id="combos">
          <div className="head"><span className="eyebrow">Ahorra más</span><h2>{settings.combosTitle}</h2></div>
          <div className="combos">
            {COMBOS.map((cb) => {
              const items = cb.items.map(byId).filter(Boolean)
              if (!items.length) return null
              const full = items.reduce((a, p) => a + p.price, 0)
              const price = full * (1 - cb.off / 100)
              return (
                <article key={cb.id} className="combo">
                  <span className="off">-{Math.round(cb.off)}%</span>
                  <div className="combo-arts">
                    {items.map((p) => <ProductArt key={p.id} color={p.color} label={p.label} size={p.size} name={p.name} image={p.image} glow={false} />)}
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
        )}

        <section className="section about" id="nosotros">
          <div className="about-logo"><img src={`${BASE}logo.jpg`} alt="Logo LeonFit" /></div>
          <div>
            <span className="eyebrow">{settings.aboutEyebrow}</span>
            <h2>{fancy(settings.aboutTitle)}</h2>
            <p>{settings.aboutText}</p>
            <ul className="checks">
              {(settings.aboutChecks || []).map((c, i) => <li key={i}>{c}</li>)}
            </ul>
            {settings.aboutButton && <button className="btn-gold" onClick={() => window.open(`https://wa.me/${WHATSAPP}`, '_blank')}>{settings.aboutButton}</button>}
          </div>
        </section>

        <section className="section" id="faq">
          <div className="head"><span className="eyebrow">Dudas</span><h2>Preguntas frecuentes</h2></div>
          <div className="faq">
            {settings.faq.map(([a, b]) => (
              <details key={a}><summary>{a}</summary><p>{b}</p></details>
            ))}
          </div>
        </section>

        <section className="cta">
          <h2>{settings.ctaTitle}</h2>
          {Object.keys(COUPONS)[0] && <p>Usa el cupón <b>{Object.keys(COUPONS)[0]}</b> en tu compra.</p>}
          <button className="btn-gold" onClick={() => filterTo('todos')}>{settings.ctaButton}</button>
        </section>
      </main>
      )}

      <footer className="footer">
        <div>
          <img src={`${import.meta.env.BASE_URL}logo.jpg`} alt="" />
          <p>{fancy(settings.footerText)}</p>
        </div>
        <div><b>Tienda</b>{CATEGORIES.slice(0, 4).map((c) => <a key={c.id} onClick={() => filterTo(c.id)}>{c.name}</a>)}</div>
        <div><b>Ayuda</b><a onClick={() => go('faq')}>Preguntas</a><a onClick={() => go('combos')}>Combos</a><a onClick={() => go('nosotros')}>Nosotros</a><a href="#/terminos">Términos y condiciones</a><a href="#/privacidad">Política de privacidad</a></div>
        <div><b>Contacto</b><a href={`https://wa.me/${WHATSAPP}`} target="_blank" rel="noreferrer">WhatsApp: {phone}</a>{igHandle && <a href={settings.instagram} target="_blank" rel="noreferrer">Instagram: @{igHandle}</a>}<a>{settings.schedule}</a><Socials /></div>
        <small>© {new Date().getFullYear()} {LEGAL.brand} · {LEGAL.owner} · {LEGAL.idType} {LEGAL.id}. Los suplementos no sustituyen una dieta equilibrada. Consulta a tu médico.</small>
      </footer>

      <Socials className="float" />
      {toast && <div className="toast">{toast}</div>}

    </>
  )
}
