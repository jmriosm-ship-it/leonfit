import { useEffect, useState } from 'react'
import ProductArt from './ProductArt.jsx'
import { money } from '../data.js'
import { LEGAL } from '../legal.js'

const DEPARTMENTS = ['Amazonas', 'Antioquia', 'Arauca', 'Atlántico', 'Bogotá D.C.', 'Bolívar', 'Boyacá', 'Caldas', 'Caquetá', 'Casanare', 'Cauca', 'Cesar', 'Chocó', 'Córdoba', 'Cundinamarca', 'Guainía', 'Guaviare', 'Huila', 'La Guajira', 'Magdalena', 'Meta', 'Nariño', 'Norte de Santander', 'Putumayo', 'Quindío', 'Risaralda', 'San Andrés y Providencia', 'Santander', 'Sucre', 'Tolima', 'Valle del Cauca', 'Vaupés', 'Vichada']
const LS = 'leonfit-checkout'
const EMPTY = { name: '', phone: '', country: 'Colombia', dept: '', city: '', pay: '', address: '', barrio: '', notes: '', ok: false }

const load = () => {
  try { return { ...EMPTY, ...(JSON.parse(localStorage.getItem(LS)) || {}), ok: false } } catch { return EMPTY }
}

export default function CartPage({ cart, setQty, removeItem, clearCart, subtotal, discount, total, missing, applied, coupon, setCoupon, applyCoupon, freeShipping, whatsapp, onShop }) {
  const [f, setF] = useState(load)
  const [tried, setTried] = useState(false)
  const count = cart.reduce((a, x) => a + x.qty, 0)

  useEffect(() => { window.scrollTo({ top: 0 }) }, [])
  useEffect(() => {
    try { localStorage.setItem(LS, JSON.stringify({ ...f, ok: false })) } catch { /* sin storage */ }
  }, [f])

  const set = (k) => (e) => setF({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value })
  const digits = f.phone.replace(/\D/g, '').replace(/^57(?=\d{10}$)/, '')
  const errors = {
    name: f.name.trim().split(/\s+/).filter(Boolean).length < 2 && 'Escribe tu nombre y apellido',
    phone: !/^\d{10}$/.test(digits) && 'Escribe tu celular de 10 dígitos',
    dept: !f.dept && 'Elige el departamento',
    city: !f.city.trim() && 'Escribe la ciudad o municipio',
    pay: !f.pay && 'Elige un método de pago',
    address: f.address.trim().length < 6 && 'Escribe la dirección de entrega',
    ok: !f.ok && 'Debes aceptar para continuar',
  }
  const invalid = Object.values(errors).some(Boolean)
  const err = (k) => tried && errors[k] && <span className="f-err">{errors[k]}</span>

  const send = () => {
    setTried(true)
    if (invalid) {
      document.querySelector('.f-err')?.closest('label, .f-consent')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      return
    }
    const lines = cart.map((x) => `• ${x.qty}x ${x.name}${x.sub ? ` (${x.sub})` : ''} — ${money(x.price * x.qty)}`).join('\n')
    const msg = [
      'Hola LeonFit 🦁, quiero hacer este pedido:',
      '',
      '*PRODUCTOS*',
      lines,
      '',
      `Subtotal: ${money(subtotal)}`,
      applied ? `Cupón ${applied}: -${money(discount)}` : null,
      `Envío: ${freeShipping > 0 && missing === 0 ? 'Gratis' : 'A convenir'}`,
      `*TOTAL: ${money(total)}*`,
      '',
      '*DATOS DE ENTREGA*',
      `Nombre: ${f.name.trim()}`,
      `Celular: ${digits}`,
      `País: ${f.country}`,
      `Departamento: ${f.dept}`,
      `Ciudad: ${f.city.trim()}`,
      `Dirección: ${f.address.trim()}`,
      f.barrio.trim() ? `Barrio / referencia: ${f.barrio.trim()}` : null,
      `Método de pago: ${f.pay}`,
      f.notes.trim() ? `Notas: ${f.notes.trim()}` : null,
    ].filter((x) => x !== null).join('\n')
    window.open(`https://wa.me/${whatsapp}?text=${encodeURIComponent(msg)}`, '_blank')
  }

  if (!cart.length) {
    return (
      <div className="cartpage empty-cart">
        <span className="eyebrow">Carrito</span>
        <h1>Tu carrito está vacío</h1>
        <p>Mira la tienda y elige los productos que más te gusten.</p>
        <button className="btn-black" onClick={onShop}>Ver productos</button>
      </div>
    )
  }

  return (
    <div className="cartpage">
      <div className="cart-title"><h1>Tu carrito</h1><small>{count} {count === 1 ? 'producto' : 'productos'}</small></div>

      <div className="cart-grid">
        <div className="cart-left">
          <div className="cart-items">
            {cart.map((x) => (
              <div className="cart-item" key={x.key}>
                <div className="cart-img"><ProductArt color={x.color} label={x.label} size={x.size} image={x.image} glow={false} name={x.name} /></div>
                <div className="cart-info">
                  <b>{x.name}</b>
                  {x.sub && <small>{x.sub}</small>}
                  <small>{money(x.price)} c/u</small>
                </div>
                <div className="cart-side">
                  <div className="qty">
                    <button onClick={() => setQty(x.key, -1)} aria-label="Menos">−</button><span>{x.qty}</span><button onClick={() => setQty(x.key, 1)} aria-label="Más">+</button>
                  </div>
                  <strong>{money(x.price * x.qty)}</strong>
                  <button className="link-btn" onClick={() => removeItem(x.key)}>Quitar</button>
                </div>
              </div>
            ))}
          </div>

          <form className="checkout" onSubmit={(e) => { e.preventDefault(); send() }} noValidate>
            <h2>Datos de entrega</h2>
            <p className="sub">Con esto armamos tu pedido y te lo enviamos por WhatsApp.</p>
            <div className="f-grid">
              <label>Nombre completo<input value={f.name} onChange={set('name')} autoComplete="name" />{err('name')}</label>
              <label>Celular<input value={f.phone} onChange={set('phone')} placeholder="300 123 4567" inputMode="tel" autoComplete="tel" />{err('phone')}</label>
              <label>País<input value={f.country} onChange={set('country')} /></label>
              <label>Departamento
                <select value={f.dept} onChange={set('dept')}><option value="">Elige uno</option>{DEPARTMENTS.map((d) => <option key={d}>{d}</option>)}</select>
                {err('dept')}
              </label>
              <label>Ciudad / municipio<input value={f.city} onChange={set('city')} autoComplete="address-level2" />{err('city')}</label>
              <label>Método de pago
                <select value={f.pay} onChange={set('pay')}><option value="">Elige uno</option>{LEGAL.paymentList.map((p) => <option key={p}>{p}</option>)}</select>
                {err('pay')}
              </label>
              <label className="wide">Dirección<input value={f.address} onChange={set('address')} placeholder="Calle, número, apto…" autoComplete="street-address" />{err('address')}</label>
              <label className="wide">Barrio / punto de referencia <em>(opcional)</em><input value={f.barrio} onChange={set('barrio')} /></label>
              <label className="wide">Notas del pedido <em>(opcional)</em><textarea rows="3" value={f.notes} onChange={set('notes')} /></label>
            </div>
            <div className="f-consent">
              <label className="check">
                <input type="checkbox" checked={f.ok} onChange={set('ok')} />
                <span>Autorizo el tratamiento de mis datos según la <a href="#/privacidad" target="_blank" rel="noreferrer">política de privacidad</a> y acepto los <a href="#/terminos" target="_blank" rel="noreferrer">términos y condiciones</a>.</span>
              </label>
              {err('ok')}
            </div>
          </form>
        </div>

        <aside className="cart-sum">
          <h2>Resumen</h2>
          {freeShipping > 0 && (
            <div className="ship">
              <p>{missing === 0 ? '🎉 ¡Tienes envío gratis!' : `Te faltan ${money(missing)} para envío gratis`}</p>
              <div className="bar"><i style={{ width: Math.min(100, (total / freeShipping) * 100) + '%' }} /></div>
            </div>
          )}
          <div className="coupon">
            <input value={coupon} onChange={(e) => setCoupon(e.target.value)} placeholder="Cupón de descuento" aria-label="Cupón" />
            <button type="button" onClick={applyCoupon}>Aplicar</button>
          </div>
          <div className="sum"><span>Productos</span><span>{count}</span></div>
          <div className="sum"><span>Subtotal</span><span>{money(subtotal)}</span></div>
          {applied && <div className="sum green"><span>Cupón {applied}</span><span>-{money(discount)}</span></div>}
          <div className="sum"><span>Envío</span><span>{freeShipping > 0 && missing === 0 ? 'Gratis' : 'A convenir'}</span></div>
          <div className="sum big"><span>Total</span><span>{money(total)}</span></div>
          <button className="btn-black wide" onClick={send}>Pedir por WhatsApp</button>
          {tried && invalid && <p className="f-err block">Completa los datos marcados para continuar.</p>}
          <p className="fine">Se abrirá WhatsApp con tu pedido listo. No pagas nada en esta página: confirmamos disponibilidad, envío y pago por mensaje.</p>
          <button className="link-btn" onClick={clearCart}>Vaciar carrito</button>
        </aside>
      </div>
    </div>
  )
}
