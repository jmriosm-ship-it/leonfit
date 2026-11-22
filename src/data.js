// Datos iniciales de la tienda. El panel de admin (#/admin) los reemplaza y los guarda.
// Para cambiar el catálogo usa el panel, no este archivo.
const SETTINGS = {
  whatsapp: '573214580943',
  instagram: 'https://www.instagram.com/leonfit_suplementos/',
  tiktok: 'https://www.tiktok.com/@leonfit_suplementos',
  freeShipping: 0, // 0 = sin envío gratis (se cambia en el panel)
  coupons: [],
  announcement: 'ENVÍOS A TODA COLOMBIA • PIDE POR WHATSAPP • ASESORÍA PERSONALIZADA',
  heroEyebrow: 'Sports Supplement Store',
  heroTitle: 'Despierta\nal *león*\nque llevas dentro.',
  heroText: 'Proteínas, creatina y pre-entrenos 100% originales con descuentos que sí se notan. Pide por WhatsApp y recibe en casa.',
  heroTag: '',
  heroTagSmall: 'solo hoy',
  flashOn: true,
  flashTitle: 'Se acaba hoy',
  flashCount: 4,
  combosTitle: 'Combos con descuento extra',
  schedule: 'Lun–Sáb 9am–5pm · Festivos 9am–12pm',
  heroStats: [['Toda Colombia', 'envíos nacionales'], ['100%', 'originales'], ['L–S', '9am a 5pm']],
  trust: [
    ['✔', 'Productos originales', 'Directo de proveedores'],
    ['🚚', 'Envíos a todo el país', 'Por transportadora'],
    ['💬', 'Asesoría por WhatsApp', 'Te guiamos según tu meta'],
    ['🔒', 'Compra segura', 'Pago confirmado contigo'],
  ],
  aboutEyebrow: 'Por qué LeonFit',
  aboutTitle: 'Entrena, rinde\ny *destaca*.',
  aboutText: 'Somos una tienda de suplementación y moda deportiva. Te asesoramos para que elijas lo que realmente necesitas para entrenar, rendir y destacar.',
  aboutChecks: ['Asesoría personalizada por WhatsApp', 'Envíos a toda Colombia', 'Pagos por Nequi, Credicervir y Bancolombia', 'Atención de lunes a sábado'],
  aboutButton: 'Hablar con un asesor',
  ctaTitle: '¿Listo para tu próximo nivel?',
  ctaButton: 'Ir a la tienda',
  footerText: 'LeonFit — Sports Supplement Store.\nSuplementación y moda deportiva.',
  faq: [
    ['¿A qué ciudades envían?', 'Enviamos a toda Colombia por transportadora. Te confirmamos el tiempo y el costo del envío antes de que pagues.'],
    ['¿Cómo hago mi pedido y cómo pago?', 'Armas tu carrito, llenas tus datos de entrega y te llega el pedido listo a nuestro WhatsApp. Allí confirmamos disponibilidad y el pago por Nequi, Credicervir o Bancolombia.'],
    ['¿Cuál es el horario de atención?', 'Lunes a sábado de 9:00 a. m. a 5:00 p. m. Los festivos de 9:00 a. m. a 12:00 m. y los domingos no hay servicio.'],
    ['¿No sé cuál producto elegir?', 'Escríbenos por WhatsApp y un asesor te recomienda según tu objetivo.'],
  ],
}

const CATEGORIES = []

// color = acento del empaque, label = texto corto en el pote
const PRODUCTS = []

const COMBOS = []

export const DEFAULT_DATA = { settings: SETTINGS, categories: CATEGORIES, products: PRODUCTS, combos: COMBOS }

// Texto genérico para categorías creadas desde el panel.
export const GENERIC_INFO = {
  benefits: ['Producto 100% original', 'Calidad verificada por LeonFit', 'Asesoría gratis por WhatsApp', 'Envío rápido a todo el país'],
  usage: 'Sigue las indicaciones de la etiqueta. Si tienes dudas, escríbenos por WhatsApp y te asesoramos.',
  nutrition: [['Porción', 'Ver etiqueta'], ['Calorías', 'Ver etiqueta']],
}

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
