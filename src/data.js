// Datos de ejemplo: cambiar por el catálogo real del local.
export const WHATSAPP = '573000000000'
export const SOCIAL = {
  whatsapp: `https://wa.me/${WHATSAPP}`,
  instagram: 'https://instagram.com/leonfit',
  tiktok: 'https://tiktok.com/@leonfit',
}
export const FREE_SHIPPING = 180000
export const COUPONS = { LEON10: 0.1, FIT15: 0.15 }

export const CATEGORIES = [
  { id: 'proteinas', name: 'Proteínas', tag: 'Músculo' },
  { id: 'creatina', name: 'Creatina', tag: 'Fuerza' },
  { id: 'preentreno', name: 'Pre-entreno', tag: 'Energía' },
  { id: 'aminoacidos', name: 'Aminoácidos', tag: 'Recuperación' },
  { id: 'quemadores', name: 'Quemadores', tag: 'Definición' },
  { id: 'vitaminas', name: 'Vitaminas', tag: 'Bienestar' },
]

// color = acento del empaque, label = texto corto en el pote
export const PRODUCTS = [
  { id: 1, name: 'Whey Gold Standard', brand: 'LeonFit Lab', cat: 'proteinas', price: 189000, old: 235000, flavor: 'Chocolate Intenso', size: '2 lb', servings: 30, color: '#6b3a1e', label: 'WHEY', badge: 'Más vendido', rating: 4.9, reviews: 312, desc: '24 g de proteína por servicio, absorción rápida y mezcla sin grumos.' },
  { id: 2, name: 'Isolate Zero Carb', brand: 'LeonFit Lab', cat: 'proteinas', price: 249000, old: 295000, flavor: 'Vainilla Francesa', size: '2 lb', servings: 29, color: '#c9a15a', label: 'ISO', badge: 'Premium', rating: 4.8, reviews: 187, desc: 'Aislada al 90%, cero azúcar y baja en lactosa.' },
  { id: 3, name: 'Mass Gainer 5000', brand: 'Titan', cat: 'proteinas', price: 159000, old: 199000, flavor: 'Fresa Cream', size: '6 lb', servings: 20, color: '#b3263e', label: 'MASS', badge: null, rating: 4.6, reviews: 94, desc: '1.100 calorías por servicio para quienes cuesta ganar peso.' },
  { id: 4, name: 'Creatina Monohidrato', brand: 'LeonFit Lab', cat: 'creatina', price: 79000, old: 98000, flavor: 'Sin sabor', size: '300 g', servings: 60, color: '#e8e8e8', label: 'CREA', badge: 'Más vendido', rating: 5.0, reviews: 421, desc: 'Creapure® micronizada. 5 g por servicio, 60 servicios.' },
  { id: 5, name: 'Creatina HCl Matrix', brand: 'Apex', cat: 'creatina', price: 119000, old: null, flavor: 'Mango Ice', size: '240 g', servings: 48, color: '#e08a1e', label: 'HCL', badge: 'Nuevo', rating: 4.7, reviews: 58, desc: 'Mayor solubilidad, sin hinchazón ni fase de carga.' },
  { id: 6, name: 'Pre-Workout Inferno', brand: 'Apex', cat: 'preentreno', price: 129000, old: 165000, flavor: 'Sandía Fuego', size: '300 g', servings: 30, color: '#e5322b', label: 'PRE', badge: 'Explosivo', rating: 4.8, reviews: 203, desc: '300 mg de cafeína, beta-alanina y citrulina. Energía sin crash.' },
  { id: 7, name: 'Pre-Workout Black Mamba', brand: 'Titan', cat: 'preentreno', price: 139000, old: 172000, flavor: 'Uva Venom', size: '270 g', servings: 30, color: '#7a2fd0', label: 'MAMBA', badge: null, rating: 4.7, reviews: 76, desc: 'Foco extremo y bombeo para sesiones pesadas.' },
  { id: 8, name: 'BCAA 2:1:1 Recovery', brand: 'LeonFit Lab', cat: 'aminoacidos', price: 89000, old: 109000, flavor: 'Limón Hielo', size: '300 g', servings: 30, color: '#18b9a6', label: 'BCAA', badge: null, rating: 4.5, reviews: 112, desc: 'Reduce la fatiga y acelera la recuperación muscular.' },
  { id: 9, name: 'EAA Complete', brand: 'Apex', cat: 'aminoacidos', price: 105000, old: null, flavor: 'Frutos Rojos', size: '350 g', servings: 35, color: '#d6336c', label: 'EAA', badge: 'Nuevo', rating: 4.6, reviews: 41, desc: 'Los 9 aminoácidos esenciales en una sola mezcla.' },
  { id: 10, name: 'Fat Burner Thermo X', brand: 'Titan', cat: 'quemadores', price: 99000, old: 129000, flavor: '90 cápsulas', size: '90 caps', servings: 45, color: '#f2b705', label: 'THERMO', badge: 'Oferta', rating: 4.4, reviews: 88, desc: 'Termogénico con té verde, L-carnitina y cafeína.' },
  { id: 11, name: 'Multivitamínico Elite', brand: 'LeonFit Lab', cat: 'vitaminas', price: 65000, old: 82000, flavor: '120 tabletas', size: '120 tabs', servings: 60, color: '#3d8bff', label: 'VITA', badge: null, rating: 4.6, reviews: 133, desc: '23 vitaminas y minerales para rendimiento y defensas.' },
  { id: 12, name: 'Omega 3 Ultra', brand: 'LeonFit Lab', cat: 'vitaminas', price: 72000, old: null, flavor: '100 softgels', size: '100 sg', servings: 50, color: '#2fb36b', label: 'OMEGA', badge: null, rating: 4.7, reviews: 97, desc: 'EPA y DHA de alta pureza para corazón y articulaciones.' },
]

export const COMBOS = [
  { id: 'c1', name: 'Combo Masa Muscular', items: [1, 4, 8], off: 0.15, blurb: 'Whey + Creatina + BCAA' },
  { id: 'c2', name: 'Combo Definición', items: [2, 10, 11], off: 0.15, blurb: 'Isolate + Thermo X + Multivitamínico' },
  { id: 'c3', name: 'Combo Bestia', items: [6, 4, 3], off: 0.18, blurb: 'Pre-Workout + Creatina + Mass Gainer' },
]

export const FAQ = [
  ['¿Los productos son originales?', 'Sí. Trabajamos solo con proveedores autorizados y todos los productos tienen registro sanitario y lote verificable.'],
  ['¿Cuánto tarda el envío?', 'En la ciudad entregamos el mismo día o al siguiente. A nivel nacional de 2 a 5 días hábiles.'],
  ['¿Cómo pago?', 'Por transferencia, Nequi, Daviplata, tarjeta o contra entrega según la zona. Confirmamos todo por WhatsApp.'],
  ['¿No sé cuál producto elegir?', 'Escríbenos por WhatsApp y un asesor te recomienda según tu objetivo y presupuesto.'],
]

export const money = (n) => '$' + Math.round(n).toLocaleString('es-CO')
export const pct = (p) => (p.old ? Math.round((1 - p.price / p.old) * 100) : 0)

// ---- Contenido de la página de cada producto (textos de ejemplo por categoría) ----
export const CAT_INFO = {
  proteinas: {
    benefits: ['Ayuda a construir y reparar masa muscular', 'Aporte alto de proteína por servicio', 'Mezcla fácil y buen sabor', 'Ideal después de entrenar o entre comidas'],
    usage: 'Mezcla 1 servicio (medida incluida) con 250 ml de agua o leche. Tómalo después del entrenamiento o entre comidas, 1 a 2 veces al día.',
    nutrition: [['Proteína', '24 g'], ['Carbohidratos', '3 g'], ['Grasas', '1.5 g'], ['Calorías', '120 kcal']],
  },
  creatina: {
    benefits: ['Más fuerza y potencia en cada serie', 'Mejor rendimiento en entrenamientos intensos', 'Apoya la recuperación muscular', 'Una de las más estudiadas del mundo'],
    usage: 'Toma 5 g al día mezclados en agua o jugo, con o sin entrenar. La constancia es lo que da resultados.',
    nutrition: [['Creatina monohidrato', '5 g'], ['Carbohidratos', '0 g'], ['Grasas', '0 g'], ['Calorías', '0 kcal']],
  },
  preentreno: {
    benefits: ['Energía y enfoque desde la primera serie', 'Mejor bombeo muscular', 'Menos fatiga durante el entrenamiento', 'Sabor intenso y mezcla rápida'],
    usage: 'Mezcla 1 medida con 300 ml de agua y tómalo 20 a 30 minutos antes de entrenar. Empieza con media medida para probar tolerancia. No tomar de noche.',
    nutrition: [['Cafeína', '300 mg'], ['Beta-alanina', '3.2 g'], ['Citrulina', '6 g'], ['Calorías', '10 kcal']],
  },
  aminoacidos: {
    benefits: ['Ayuda a recuperarte más rápido', 'Reduce la sensación de fatiga muscular', 'Se toma durante el entrenamiento', 'Sin azúcar, ligero y refrescante'],
    usage: 'Mezcla 1 medida con 400 ml de agua y tómalo durante o después del entrenamiento.',
    nutrition: [['Aminoácidos totales', '7 g'], ['Carbohidratos', '0 g'], ['Azúcar', '0 g'], ['Calorías', '25 kcal']],
  },
  quemadores: {
    benefits: ['Apoya el metabolismo y la energía', 'Ayuda en planes de definición', 'Fórmula con extractos naturales', 'Fácil de tomar en cápsulas'],
    usage: 'Toma 2 cápsulas al día con un vaso de agua, preferiblemente en la mañana y antes del almuerzo. No exceder la dosis.',
    nutrition: [['Té verde', '300 mg'], ['L-carnitina', '500 mg'], ['Cafeína', '100 mg'], ['Calorías', '0 kcal']],
  },
  vitaminas: {
    benefits: ['Apoya defensas y energía diaria', 'Cubre carencias de la dieta', 'Aporta a la salud del corazón y articulaciones', 'Uso diario, fácil de tragar'],
    usage: 'Toma 2 unidades al día con una comida y un vaso de agua, o según indicación de tu médico.',
    nutrition: [['Vitaminas y minerales', '23'], ['Vitamina C', '90 mg'], ['Vitamina D3', '25 mcg'], ['Calorías', '0 kcal']],
  },
}

const NAMES = ['Camilo R.', 'Valentina G.', 'Andrés M.', 'Laura P.', 'Sebastián T.', 'Daniela C.', 'Juan D.', 'Mariana S.', 'Felipe O.', 'Carolina V.']
const TEXTS = [
  [5, 'Excelente producto, lo uso hace dos meses y se nota la diferencia. Llegó rápido y bien sellado.'],
  [5, 'Muy buen sabor y se mezcla sin grumos. Ya es mi tercera compra.'],
  [4, 'Buena calidad por el precio. Lo único es que me gustaría una presentación más grande.'],
  [5, 'Me asesoraron por WhatsApp y acerté con el producto. Recomendado 100%.'],
  [5, 'Original y con registro sanitario, eso me dio confianza. Cumple lo que promete.'],
  [4, 'Muy bueno, resultados desde la segunda semana. El envío fue puntual.'],
  [5, 'El mejor precio que encontré y la atención es de primera.'],
  [4, 'Buen producto, sabor agradable. Lo volveré a pedir.'],
]
const MONTHS = ['hace 3 días', 'hace 1 semana', 'hace 2 semanas', 'hace 1 mes', 'hace 2 meses', 'hace 3 meses']

// Reseñas de ejemplo, estables por producto (se reemplazan por reseñas reales).
export function getReviews(p) {
  return [0, 1, 2, 3, 4].map((i) => {
    const t = TEXTS[(p.id * 3 + i * 5) % TEXTS.length]
    return { name: NAMES[(p.id + i * 3) % NAMES.length], rating: t[0], text: t[1], when: MONTHS[(p.id + i) % MONTHS.length], verified: true }
  })
}

// Distribución de estrellas aproximada a partir del promedio.
export function ratingBars(avg) {
  const five = Math.min(0.95, Math.max(0.3, (avg - 3.5) / 1.5))
  const four = (1 - five) * 0.65
  const three = (1 - five) * 0.22
  const two = (1 - five) * 0.08
  const one = (1 - five) * 0.05
  return [[5, five], [4, four], [3, three], [2, two], [1, one]]
}
