import { useState } from 'react'
import { uploadImage } from '../store.js'

function Section({ title, hint, children }) {
  return (
    <section className="lfa-card lfa-sec">
      <h3>{title}</h3>
      {hint && <p className="lfa-sub">{hint}</p>}
      {children}
    </section>
  )
}

export default function SettingsTab({ store, commit, notify }) {
  const [s, setS] = useState(store.settings)
  const [busy, setBusy] = useState(false)
  const set = (k) => (e) => setS({ ...s, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value })
  const num = (k) => (e) => setS({ ...s, [k]: Number(e.target.value) || 0 })

  const setRow = (key, k, idx, v) => setS({ ...s, [key]: s[key].map((r, j) => (j === k ? r.map((x, m) => (m === idx ? v : x)) : r)) })
  const setCheck = (k, v) => setS({ ...s, aboutChecks: s.aboutChecks.map((x, j) => (j === k ? v : x)) })
  const setFaq = (i, k, v) => setS({ ...s, faq: s.faq.map((f, j) => (j === i ? (k === 0 ? [v, f[1]] : [f[0], v]) : f)) })

  const pickHero = async (e) => {
    const f = e.target.files?.[0]
    e.target.value = ''
    if (!f) return
    try { const url = await uploadImage(f); setS((x) => ({ ...x, heroImage: url })) } catch (x) { notify(x.message, true) }
  }

  const save = async () => {
    setBusy(true)
    const { coupons: _cupones, ...rest } = s // los cupones se manejan en su propia pestaña
    const clean = {
      ...rest,
      whatsapp: String(s.whatsapp).replace(/\D/g, ''),
      trust: (s.trust || []).filter(([, t]) => t.trim()),
      heroStats: (s.heroStats || []).filter(([b]) => b.trim()),
      aboutChecks: (s.aboutChecks || []).filter((x) => x.trim()),
      faq: s.faq.filter(([a, b]) => a.trim() && b.trim()),
      flashCount: Math.min(8, Math.max(2, Number(s.flashCount) || 4)),
    }
    if (await commit((d) => ({ ...d, settings: { ...d.settings, ...clean } }), 'Página actualizada ✔')) setS(clean)
    setBusy(false)
  }

  return (
    <>
      <div className="lfa-bar">
        <div><h2>Control de la página</h2><p className="lfa-sub">Todo lo que ves en la tienda se cambia desde aquí. Los cambios salen al pulsar “Guardar cambios”.</p></div>
        <button className="lfa-btn gold" onClick={save} disabled={busy}>{busy ? 'Guardando…' : 'Guardar cambios'}</button>
      </div>

      <Section title="Barra de anuncio (arriba de todo)" hint="Usa {envio} para mostrar automáticamente el monto de envío gratis.">
        <label>Texto<textarea rows="2" value={s.announcement} onChange={set('announcement')} /></label>
      </Section>

      <Section title="Portada" hint="En el título, una palabra entre *asteriscos* sale en dorado. Cada línea nueva es un salto de línea.">
        <div className="lfa-checks">
          <b>Imagen de la portada</b>
          <p className="lfa-hint">Opcional. Si no subes una foto, la portada muestra (flotando) los productos que marques con “Mostrar en la portada”.</p>
          <label className="lfa-btn file" style={{ maxWidth: 220 }}>📷 {s.heroImage ? 'Cambiar foto' : 'Subir foto'}<input type="file" accept="image/*" hidden onChange={pickHero} /></label>
          {s.heroImage && <button type="button" className="lfa-link" onClick={() => setS({ ...s, heroImage: '' })}>Quitar foto</button>}
        </div>
        <label>Texto pequeño superior<input value={s.heroEyebrow} onChange={set('heroEyebrow')} /></label>
        <label>Título<textarea rows="3" value={s.heroTitle} onChange={set('heroTitle')} /></label>
        <label>Descripción<textarea rows="3" value={s.heroText} onChange={set('heroText')} /></label>
        <div className="lfa-row">
          <label>Sello de descuento<input value={s.heroTag} onChange={set('heroTag')} placeholder="-35%" /></label>
          <label>Texto del sello<input value={s.heroTagSmall} onChange={set('heroTagSmall')} placeholder="solo hoy" /></label>
        </div>
      </Section>

      <Section title="Oferta relámpago" hint="Muestra los productos marcados como “En oferta relámpago”. Si no marcas ninguno, salen los de mayor descuento.">
        <div className="lfa-checks"><label><input type="checkbox" checked={s.flashOn} onChange={set('flashOn')} /> Mostrar esta sección con cuenta regresiva</label></div>
        <div className="lfa-row">
          <label>Título<input value={s.flashTitle} onChange={set('flashTitle')} /></label>
          <label>Cantidad automática (2–8)<input type="number" min="2" max="8" value={s.flashCount} onChange={num('flashCount')} /></label>
        </div>
        <label>Título de la sección de combos<input value={s.combosTitle} onChange={set('combosTitle')} /></label>
      </Section>

      <Section title="Envío" hint="Los cupones de descuento se crean en la pestaña Cupones.">
        <label>Envío gratis desde (COP) — deja 0 si no ofrecen envío gratis<input type="number" min="0" value={s.freeShipping} onChange={num('freeShipping')} /></label>
      </Section>

      <Section title="Cifras de la portada" hint="Los tres datos pequeños debajo de los botones de la portada.">
        {(s.heroStats || []).map(([b, t], i) => (
          <div className="lfa-row pair" key={i}>
            <input value={b} onChange={(e) => setRow('heroStats', i, 0, e.target.value)} placeholder="Dato grande (ej. Toda Colombia)" />
            <input value={t} onChange={(e) => setRow('heroStats', i, 1, e.target.value)} placeholder="Texto pequeño" />
            <button className="lfa-btn sm danger" onClick={() => setS({ ...s, heroStats: s.heroStats.filter((_, j) => j !== i) })}>Quitar</button>
          </div>
        ))}
        {(s.heroStats || []).length < 4 && <button className="lfa-btn sm" onClick={() => setS({ ...s, heroStats: [...(s.heroStats || []), ['', '']] })}>+ Agregar cifra</button>}
      </Section>

      <Section title="Franja de confianza" hint="Los cuadros con icono que salen debajo de la portada (ej. Envíos, Asesoría…).">
        {(s.trust || []).map(([i2, t, d], i) => (
          <div className="lfa-row trust" key={i}>
            <input value={i2} onChange={(e) => setRow('trust', i, 0, e.target.value)} placeholder="Icono" />
            <input value={t} onChange={(e) => setRow('trust', i, 1, e.target.value)} placeholder="Título" />
            <input value={d} onChange={(e) => setRow('trust', i, 2, e.target.value)} placeholder="Texto pequeño" />
            <button className="lfa-btn sm danger" onClick={() => setS({ ...s, trust: s.trust.filter((_, j) => j !== i) })}>Quitar</button>
          </div>
        ))}
        {(s.trust || []).length < 4 && <button className="lfa-btn sm" onClick={() => setS({ ...s, trust: [...(s.trust || []), ['✔', '', '']] })}>+ Agregar cuadro</button>}
      </Section>

      <Section title="Sección “Nosotros”" hint="En el título, una palabra entre *asteriscos* sale destacada.">
        <label>Texto pequeño superior<input value={s.aboutEyebrow} onChange={set('aboutEyebrow')} /></label>
        <label>Título<textarea rows="2" value={s.aboutTitle} onChange={set('aboutTitle')} /></label>
        <label>Descripción<textarea rows="3" value={s.aboutText} onChange={set('aboutText')} /></label>
        <b>Puntos de la lista</b>
        {(s.aboutChecks || []).map((c, i) => (
          <div className="lfa-row pair" key={i}>
            <input value={c} onChange={(e) => setCheck(i, e.target.value)} />
            <button className="lfa-btn sm danger" onClick={() => setS({ ...s, aboutChecks: s.aboutChecks.filter((_, j) => j !== i) })}>Quitar</button>
          </div>
        ))}
        <button className="lfa-btn sm" onClick={() => setS({ ...s, aboutChecks: [...(s.aboutChecks || []), ''] })}>+ Agregar punto</button>
        <label>Texto del botón<input value={s.aboutButton} onChange={set('aboutButton')} /></label>
      </Section>

      <Section title="Cierre y pie de página">
        <div className="lfa-row">
          <label>Título final<input value={s.ctaTitle} onChange={set('ctaTitle')} /></label>
          <label>Texto del botón final<input value={s.ctaButton} onChange={set('ctaButton')} /></label>
        </div>
        <label>Texto del pie de página<textarea rows="2" value={s.footerText} onChange={set('footerText')} /></label>
      </Section>

      <Section title="Contacto y redes">
        <div className="lfa-row">
          <label>WhatsApp (con país, sin +)<input value={s.whatsapp} onChange={set('whatsapp')} placeholder="573001234567" /></label>
          <label>Horario<input value={s.schedule} onChange={set('schedule')} /></label>
        </div>
        <div className="lfa-row">
          <label>Instagram (enlace)<input value={s.instagram} onChange={set('instagram')} /></label>
          <label>TikTok (enlace)<input value={s.tiktok} onChange={set('tiktok')} /></label>
        </div>
      </Section>

      <Section title="Preguntas frecuentes">
        {s.faq.map(([a, b], i) => (
          <div className="lfa-faq" key={i}>
            <input value={a} onChange={(e) => setFaq(i, 0, e.target.value)} placeholder="Pregunta" />
            <textarea rows="2" value={b} onChange={(e) => setFaq(i, 1, e.target.value)} placeholder="Respuesta" />
            <button className="lfa-btn sm danger" onClick={() => setS({ ...s, faq: s.faq.filter((_, j) => j !== i) })}>Quitar</button>
          </div>
        ))}
        <button className="lfa-btn sm" onClick={() => setS({ ...s, faq: [...s.faq, ['', '']] })}>+ Agregar pregunta</button>
      </Section>

      <div className="lfa-actions"><button className="lfa-btn gold" onClick={save} disabled={busy}>{busy ? 'Guardando…' : 'Guardar cambios'}</button></div>
    </>
  )
}
