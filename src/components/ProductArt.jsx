// Pote de suplemento dibujado en SVG (reemplazable por fotos reales).
export default function ProductArt({ color = '#c9a15a', label = 'LEON', name = '', size = '', glow = true, image = '' }) {
  if (image) return <img src={image} alt={name} className="art art-img" loading="lazy" />
  const id = `g${color.replace('#', '')}${label}`.replace(/\W/g, '')
  return (
    <svg viewBox="0 0 200 240" className="art" role="img" aria-label={name}>
      <defs>
        <linearGradient id={id} x1="0" x2="1">
          <stop offset="0" stopColor="#000" stopOpacity=".55" />
          <stop offset=".3" stopColor="#fff" stopOpacity=".18" />
          <stop offset=".6" stopColor="#000" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity=".6" />
        </linearGradient>
        <radialGradient id={id + 'r'} cx=".5" cy=".5" r=".5">
          <stop offset="0" stopColor={color} stopOpacity=".55" />
          <stop offset="1" stopColor={color} stopOpacity="0" />
        </radialGradient>
        <clipPath id={id+'c'}><path d="M38 56h124l6 20v132a14 14 0 0 1-14 14H46a14 14 0 0 1-14-14V76z" /></clipPath>
      </defs>
      {glow && <circle cx="100" cy="125" r="100" fill={`url(#${id}r)`} />}
      <ellipse cx="100" cy="226" rx="62" ry="8" fill="#000" opacity=".6" />
      {/* tapa */}
      <rect x="42" y="22" width="116" height="34" rx="6" fill="#0b0b0b" stroke="#c9a15a" strokeWidth="1.5" />
      <rect x="42" y="22" width="116" height="34" rx="6" fill={`url(#${id})`} />
      {[0, 1, 2, 3, 4, 5, 6].map((i) => (
        <line key={i} x1={52 + i * 16} y1="26" x2={52 + i * 16} y2="52" stroke="#c9a15a" strokeOpacity=".25" />
      ))}
      {/* cuerpo */}
      <path d="M38 56h124l6 20v132a14 14 0 0 1-14 14H46a14 14 0 0 1-14-14V76z" fill="#101010" stroke="#2a2a2a" />
      <g clipPath={`url(#${id}c)`}>
      <rect x="32" y="84" width="136" height="104" fill={color} />
      <rect x="32" y="84" width="136" height="104" fill="#000" opacity=".28" />
      <rect x="32" y="84" width="136" height="3" fill="#c9a15a" />
      <rect x="32" y="185" width="136" height="3" fill="#c9a15a" />
      {/* león mini */}
      <path d="M100 94l8 6 10-2-2 10 6 6-8 4 0 10-14-6-14 6 0-10-8-4 6-6-2-10 10 2z" fill="#e8c47c" opacity=".9" />
      <text x="100" y="146" textAnchor="middle" fontFamily="Archivo, sans-serif" fontWeight="900" fontSize={label.length > 5 ? 22 : 28} fill="#fff" letterSpacing="1">
        {label}
      </text>
      <text x="100" y="164" textAnchor="middle" fontFamily="Archivo Narrow, sans-serif" fontWeight="700" fontSize="10" fill="#e8c47c" letterSpacing="3">
        LEONFIT
      </text>
      <text x="100" y="179" textAnchor="middle" fontFamily="Archivo Narrow, sans-serif" fontWeight="700" fontSize="9" fill="#fff" opacity=".8" letterSpacing="2">
        {size.toUpperCase()}
      </text>
      <rect x="32" y="56" width="136" height="164" fill={`url(#${id})`} opacity=".7" />
      </g>
    </svg>
  )
}
