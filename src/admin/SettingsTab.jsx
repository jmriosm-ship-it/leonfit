import { useState } from 'react'
import { uploadImage } from '../store.js'

function Section({ title, hint, children }) {
  return (
    <section className="ad-card ad-sec">
      <h3>{title}</h3>
      {hint && <p className="ad-sub">{hint}</p>}
      {children}
    </section>
  )
}

export default function SettingsTab({ store, commit, notify }) {
  const [s, setS] = useState(store.settings)
  const [busy, setBusy] = useState(false)
  const set = (k) => (e) => setS({ ...s, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value })
  const num = (k) => (e) => setS({ ...s, [k]: Number(e.target.value) || 0 })

  const setCoupon = (i, ch) => setS({ ...s, coupons: s.coupons.map((c, j) => (j === i ? { ...c, ...ch } : c)) })
  const setFaq = (i, k, v) => setS({ ...s, faq: s.faq.map((f, j) => (j === i ? (k === 0 ? [v, f[1]] : [f[0], v]) : f)) })

  const pickHero = async (e) => {
    const f = e.target.files?.[0]
    e.target.value = ''
    if (!f) return
    try { const url = await uploadImage(f); setS((x) => ({ ...x, heroImage: url })) } catch (x) { notify(x.message, true) }
  }

  const save = async () => {
    setBusy(true)
    const clean = {
      ...s,
      whatsapp: String(s.whatsapp).replace(/\D/g, ''),
      coupons: s.coupons.filter((c) => c.code.trim()).map((c) => ({ code: c.code.trim().toUpperCase(), pct: Math.min(90, Math.max(1, Number(c.pct) || 0)) })),
      faq: s.faq.filter(([a, b]) => a.trim() && b.trim()),
      flashCount: Math.min(8, Math.max(2, Number(s.flashCount) || 4)),
    }
    if (await commit((d) => ({ ...d, settings: clean }), 'Página actualizada ✔')) setS(clean)
    setBusy(false)
  }

  return (
    <>
      <div className="ad-bar">
        <div><h2>Control de la página</h2><p className="ad-sub">Todo lo que ves en la tienda se cambia desde aquí. Los cambios salen al pulsar “Guardar cambios”.</p></div>
        <button className="ad-btn gold" onClick={save} disabled={busy}>{busy ? 'Guardando…' : 'Guardar cambios'}</button>
      </div>

      <Section title="Barra de anuncio (arriba de todo)" hint="Usa {envio} para mostrar automáticamente el monto de envío gratis.">
        <label>Texto<textarea rows="2" value={s.announcement} onChange={set('announcement')} /></label>
      </Section>

      <Section title="Portada" hint="En el título, una palabra entre *asteriscos* sale en dorado. Cada línea nueva es un salto de línea.">
        <div className="ad-checks">
          <b>Imagen de la portada</b>
          <p className="ad-hint">Ahora se muestra una imagen de ejemplo (botes dibujados). Sube tu foto para reemplazarla.</p>
          <label className="ad-btn file" style={{ maxWidth: 220 }}>📷 {s.heroImage ? 'Cambiar foto' : 'Subir foto'}<input type="file" accept="image/*" hidden onChange={pickHero} /></label>
          {s.heroImage && <button type="button" className="ad-link" onClick={() => setS({ ...s, heroImage: '' })}>Quitar y volver al ejemplo</button>}
        </div>
        <label>Texto pequeño superior<input value={s.heroEyebrow} onChange={set('heroEyebrow')} /></label>
        <label>Título<textarea rows="3" value={s.heroTitle} onChange={set('heroTitle')} /></label>
        <label>Descripción<textarea rows="3" value={s.heroText} onChange={set('heroText')} /></label>
        <div className="ad-row">
          <label>Sello de descuento<input value={s.heroTag} onChange={set('heroTag')} placeholder="-35%" /></label>
          <label>Texto del sello<input value={s.heroTagSmall} onChange={set('heroTagSmall')} placeholder="solo hoy" /></label>
        </div>
      </Section>

      <Section title="Oferta relámpago" hint="Muestra los productos marcados como “En oferta relámpago”. Si no marcas ninguno, salen los de mayor descuento.">
        <div className="ad-checks"><label><input type="checkbox" checked={s.flashOn} onChange={set('flashOn')} /> Mostrar esta sección con cuenta regresiva</label></div>
        <div className="ad-row">
          <label>Título<input value={s.flashTitle} onChange={set('flashTitle')} /></label>
          <label>Cantidad automática (2–8)<input type="number" min="2" max="8" value={s.flashCount} onChange={num('flashCount')} /></label>
        </div>
        <label>Título de la sección de combos<input value={s.combosTitle} onChange={set('combosTitle')} /></label>
      </Section>

      <Section title="Envío y cupones">
        <label>Envío gratis desde (COP)<input type="number" min="0" value={s.freeShipping} onChange={num('freeShipping')} /></label>
        <b>Cupones de descuento</b>
        {s.coupons.map((c, i) => (
          <div className="ad-row coupon" key={i}>
            <input value={c.code} onChange={(e) => setCoupon(i, { code: e.target.value })} placeholder="CÓDIGO" />
            <input type="number" min="1" max="90" value={c.pct} onChange={(e) => setCoupon(i, { pct: e.target.value })} />
            <span>% de descuento</span>
            <button className="ad-btn sm danger" onClick={() => setS({ ...s, coupons: s.coupons.filter((_, j) => j !== i) })}>Quitar</button>
          </div>
        ))}
        <button className="ad-btn sm" onClick={() => setS({ ...s, coupons: [...s.coupons, { code: '', pct: 10 }] })}>+ Agregar cupón</button>
      </Section>

      <Section title="Contacto y redes">
        <div className="ad-row">
          <label>WhatsApp (con país, sin +)<input value={s.whatsapp} onChange={set('whatsapp')} placeholder="573001234567" /></label>
          <label>Horario<input value={s.schedule} onChange={set('schedule')} /></label>
        </div>
        <div className="ad-row">
          <label>Instagram (enlace)<input value={s.instagram} onChange={set('instagram')} /></label>
          <label>TikTok (enlace)<input value={s.tiktok} onChange={set('tiktok')} /></label>
        </div>
      </Section>

      <Section title="Preguntas frecuentes">
        {s.faq.map(([a, b], i) => (
          <div className="ad-faq" key={i}>
            <input value={a} onChange={(e) => setFaq(i, 0, e.target.value)} placeholder="Pregunta" />
            <textarea rows="2" value={b} onChange={(e) => setFaq(i, 1, e.target.value)} placeholder="Respuesta" />
            <button className="ad-btn sm danger" onClick={() => setS({ ...s, faq: s.faq.filter((_, j) => j !== i) })}>Quitar</button>
          </div>
        ))}
        <button className="ad-btn sm" onClick={() => setS({ ...s, faq: [...s.faq, ['', '']] })}>+ Agregar pregunta</button>
      </Section>

      <div className="ad-actions"><button className="ad-btn gold" onClick={save} disabled={busy}>{busy ? 'Guardando…' : 'Guardar cambios'}</button></div>
    </>
  )
}
