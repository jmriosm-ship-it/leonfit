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

// Reduce la foto (máx. 900 px) para que cargue rápido.
function shrink(file, max = 900, quality = 0.85) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const u = URL.createObjectURL(file)
    img.onload = () => {
      const k = Math.min(1, max / Math.max(img.width, img.height))
      const c = document.createElement('canvas')
      c.width = Math.round(img.width * k)
      c.height = Math.round(img.height * k)
      c.getContext('2d').drawImage(img, 0, 0, c.width, c.height)
      URL.revokeObjectURL(u)
      const png = file.type === 'image/png'
      c.toBlob((b) => (b ? resolve({ blob: b, ext: png ? 'png' : 'jpg' }) : reject(new Error('Imagen no válida'))), png ? 'image/png' : 'image/jpeg', quality)
    }
    img.onerror = () => reject(new Error('No se pudo leer la imagen'))
    img.src = u
  })
}

const toDataUrl = (blob) => new Promise((res) => { const f = new FileReader(); f.onload = () => res(f.result); f.readAsDataURL(blob) })

// Devuelve la URL (o dataURL en modo demo) de la foto subida.
export async function uploadImage(file) {
  const { blob, ext } = await shrink(file)
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
