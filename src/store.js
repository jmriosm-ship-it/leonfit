// Capa de datos de LeonFit.
// - Con VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY: los datos viven en Supabase (los ve todo el mundo).
// - Sin ellas: "modo demo", todo se guarda solo en este navegador (sirve para probar el panel).
import { DEFAULT_DATA } from './data.js'

const URL_ = import.meta.env.VITE_SUPABASE_URL
const KEY = import.meta.env.VITE_SUPABASE_ANON_KEY
export const CLOUD = Boolean(URL_ && KEY)
export const DEMO_PASSWORD = 'leonfit'

const LS_DATA = 'leonfit-data'
const LS_SESSION = 'leonfit-session'
const BUCKET = 'products'

const read = (k) => { try { return JSON.parse(localStorage.getItem(k)) } catch { return null } }
const write = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)) } catch { throw new Error('No hay espacio en el navegador. Usa fotos más pequeñas o conecta Supabase.') } }

export function normalize(d) {
  const x = d && typeof d === 'object' ? d : {}
  return {
    settings: { ...DEFAULT_DATA.settings, ...(x.settings || {}) },
    categories: Array.isArray(x.categories) ? x.categories : DEFAULT_DATA.categories,
    products: Array.isArray(x.products) ? x.products : DEFAULT_DATA.products,
    combos: Array.isArray(x.combos) ? x.combos : DEFAULT_DATA.combos,
  }
}

export const cached = () => normalize(read(LS_DATA))

export async function loadData() {
  if (!CLOUD) return cached()
  const r = await fetch(`${URL_}/rest/v1/site_data?id=eq.1&select=data`, { headers: { apikey: KEY, Authorization: `Bearer ${KEY}` } })
  if (!r.ok) throw new Error('No se pudo leer la tienda')
  const rows = await r.json()
  const d = normalize(rows[0]?.data)
  write(LS_DATA, d) // copia para que la tienda abra rápido
  return d
}

// ---- sesión de admin ----
export function getSession() {
  const s = read(LS_SESSION)
  if (!s) return null
  if (!CLOUD) return s
  return s.expires_at * 1000 > Date.now() ? s : null
}

export async function signIn(email, password) {
  if (!CLOUD) {
    if (password !== DEMO_PASSWORD) throw new Error('Correo o contraseña incorrectos')
    const s = { email: email || 'admin@leonfit.demo', demo: true }
    write(LS_SESSION, s)
    return s
  }
  const r = await fetch(`${URL_}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: { apikey: KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  if (!r.ok) throw new Error('Correo o contraseña incorrectos')
  const j = await r.json()
  const s = { email: j.user?.email || email, access_token: j.access_token, expires_at: Math.floor(Date.now() / 1000) + j.expires_in - 30 }
  write(LS_SESSION, s)
  return s
}

export function signOut() {
  try { localStorage.removeItem(LS_SESSION) } catch { /* sin storage */ }
}

const auth = () => {
  const s = getSession()
  if (!s) throw new Error('Tu sesión venció. Vuelve a entrar.')
  return s
}

// ---- guardar ----
export async function saveData(data) {
  const clean = normalize(data)
  if (!CLOUD) { write(LS_DATA, clean); return clean }
  const s = auth()
  const r = await fetch(`${URL_}/rest/v1/site_data`, {
    method: 'POST',
    headers: { apikey: KEY, Authorization: `Bearer ${s.access_token}`, 'Content-Type': 'application/json', Prefer: 'resolution=merge-duplicates,return=minimal' },
    body: JSON.stringify({ id: 1, data: clean, updated_at: new Date().toISOString() }),
  })
  if (!r.ok) throw new Error('No se pudo guardar en la nube. ¿Ejecutaste supabase/setup.sql?')
  write(LS_DATA, clean)
  return clean
}

// Quita el fondo de la foto: toma los colores que dominan los bordes (blanco, gris, negro, degradados…)
// y borra todo lo que, partiendo de los bordes, se parezca a ellos. Luego recorta los márgenes vacíos.
// Devuelve false (sin tocar la imagen) si los bordes no tienen un fondo claro que quitar.
export function cutBackground(c) {
  const w = c.width
  const h = c.height
  const ctx = c.getContext('2d', { willReadFrequently: true })
  const img = ctx.getImageData(0, 0, w, h)
  const px = img.data
  const at = (x, y) => (y * w + x) * 4
  const edge = []
  for (let x = 0; x < w; x++) { edge.push(at(x, 0), at(x, h - 1)) }
  for (let y = 1; y < h - 1; y++) { edge.push(at(0, y), at(w - 1, y)) }
  if (edge.filter((i) => px[i + 3] < 250).length > edge.length * 0.5) return false // ya es transparente
  // Paleta del fondo: los colores (agrupados en cubos de 16) que más se repiten en el borde.
  const bins = new Map()
  for (const i of edge) {
    const k = (px[i] >> 4) * 256 + (px[i + 1] >> 4) * 16 + (px[i + 2] >> 4)
    const b = bins.get(k) || [0, 0, 0, 0]
    b[0]++; b[1] += px[i]; b[2] += px[i + 1]; b[3] += px[i + 2]
    bins.set(k, b)
  }
  const pal = [...bins.values()].filter((b) => b[0] >= edge.length * 0.03).sort((a, b) => b[0] - a[0]).slice(0, 8).map((b) => [b[1] / b[0], b[2] / b[0], b[3] / b[0]])
  const covered = [...bins.values()].filter((b) => b[0] >= edge.length * 0.03).reduce((a, b) => a + b[0], 0)
  if (!pal.length || covered < edge.length * 0.6) return false // el borde tiene demasiados colores: no hay fondo parejo
  const dist = (i) => { let m = 1e9; for (const p of pal) { const d = Math.hypot(px[i] - p[0], px[i + 1] - p[1], px[i + 2] - p[2]); if (d < m) m = d } return m }
  const TOL = 44
  const seen = new Uint8Array(w * h)
  const stack = []
  const push = (x, y) => { const p = y * w + x; if (!seen[p] && dist(p * 4) < TOL) { seen[p] = 1; stack.push(p) } }
  for (let x = 0; x < w; x++) { push(x, 0); push(x, h - 1) }
  for (let y = 0; y < h; y++) { push(0, y); push(w - 1, y) }
  let removed = 0
  while (stack.length) {
    const p = stack.pop()
    px[p * 4 + 3] = 0
    removed++
    const x = p % w
    const y = (p / w) | 0
    if (x > 0) push(x - 1, y)
    if (x < w - 1) push(x + 1, y)
    if (y > 0) push(x, y - 1)
    if (y < h - 1) push(x, y + 1)
  }
  const share = removed / (w * h)
  if (share < 0.04 || share > 0.92) return false // no parece haber un fondo que quitar
  // Bordes suaves: los píxeles pegados al fondo se vuelven semitransparentes según qué tan parecidos son al fondo.
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const p = y * w + x
      if (seen[p]) continue
      if (!(seen[p - 1] || seen[p + 1] || seen[p - w] || seen[p + w])) continue
      const d = dist(p * 4)
      if (d < TOL * 1.7) px[p * 4 + 3] = Math.round(255 * Math.min(1, (d - TOL * 0.4) / (TOL * 1.3)))
    }
  }
  // Recorte: caja que rodea lo que quedó visible, con un pequeño margen.
  let x0 = w, y0 = h, x1 = 0, y1 = 0
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (px[at(x, y) + 3] > 30) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y }
  ctx.putImageData(img, 0, 0)
  if (x1 > x0 && y1 > y0) {
    const m = Math.round(Math.max(x1 - x0, y1 - y0) * 0.03)
    x0 = Math.max(0, x0 - m); y0 = Math.max(0, y0 - m); x1 = Math.min(w - 1, x1 + m); y1 = Math.min(h - 1, y1 + m)
    const cw = x1 - x0 + 1
    const ch = y1 - y0 + 1
    const data = ctx.getImageData(x0, y0, cw, ch)
    c.width = cw
    c.height = ch
    c.getContext('2d').putImageData(data, 0, 0)
  }
  return true
}

// Reduce la foto (máx. 900 px) para que cargue rápido.
function shrink(file, max = 1600, quality = 0.92, cut = false) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const u = URL.createObjectURL(file)
    img.onload = () => {
      const k = Math.min(1, max / Math.max(img.width, img.height))
      const c = document.createElement('canvas')
      c.width = Math.round(img.width * k)
      c.height = Math.round(img.height * k)
      c.getContext('2d', { willReadFrequently: true }).drawImage(img, 0, 0, c.width, c.height)
      URL.revokeObjectURL(u)
      const cutDone = cut && cutBackground(c)
      const png = cutDone || file.type === 'image/png'
      c.toBlob((b) => (b ? resolve({ blob: b, ext: png ? 'png' : 'jpg' }) : reject(new Error('Imagen no válida'))), png ? 'image/png' : 'image/jpeg', quality)
    }
    img.onerror = () => reject(new Error('No se pudo leer la imagen'))
    img.src = u
  })
}

const toDataUrl = (blob) => new Promise((res) => { const f = new FileReader(); f.onload = () => res(f.result); f.readAsDataURL(blob) })

// Devuelve la URL (o dataURL en modo demo) de la foto subida.
export async function uploadImage(file, { cutout = false } = {}) {
  const { blob, ext } = await shrink(file, 1600, 0.92, cutout)
  if (!CLOUD) return toDataUrl(blob)
  const s = auth()
  const name = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`
  const r = await fetch(`${URL_}/storage/v1/object/${BUCKET}/${name}`, {
    method: 'POST',
    headers: { apikey: KEY, Authorization: `Bearer ${s.access_token}`, 'Content-Type': blob.type },
    body: blob,
  })
  if (!r.ok) throw new Error('No se pudo subir la foto')
  return `${URL_}/storage/v1/object/public/${BUCKET}/${name}`
}
