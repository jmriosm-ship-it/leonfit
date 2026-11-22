import { useEffect } from 'react'
import { PRIVACY, TERMS } from '../legal.js'

export default function LegalPage({ kind, onBack }) {
  const doc = kind === 'privacidad' ? PRIVACY : TERMS
  useEffect(() => { window.scrollTo({ top: 0 }) }, [kind])
  return (
    <div className="legal">
      <nav className="crumbs"><a onClick={onBack}>Inicio</a> / <span>{doc.title}</span></nav>
      <h1>{doc.title}</h1>
      <div className="legal-tabs">
        <a href="#/terminos" className={kind === 'terminos' ? 'on' : ''}>Términos y condiciones</a>
        <a href="#/privacidad" className={kind === 'privacidad' ? 'on' : ''}>Privacidad</a>
      </div>
      {doc.sections.map(([h, paras]) => (
        <section key={h}>
          <h2>{h}</h2>
          {paras.map((t, i) => <p key={i}>{t}</p>)}
        </section>
      ))}
    </div>
  )
}
