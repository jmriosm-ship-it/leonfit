// Datos del negocio y textos legales. Revisa con el dueño y, si es posible, con un abogado.
export const LEGAL = {
  brand: 'LEONFIT_SUPLEMENTOS',
  owner: 'Juan José León Jácome',
  idType: 'NIT/C.C.',
  id: '1090990875',
  place: 'Barrio El Refugio, Colombia',
  email: 'leonjacomejuanjose0@gmail.com',
  whatsapp: '+57 321 458 0943',
  instagram: '@Leonfit_suplementos',
  tiktok: '@Leonfit_suplementos',
  site: 'leonfitt.com',
  payments: 'Nequi, Credicervir y Bancolombia',
  paymentList: ['Nequi', 'Credicervir', 'Bancolombia'],
  schedule: 'lunes a sábado de 9:00 a. m. a 5:00 p. m.; domingos sin servicio; festivos de 9:00 a. m. a 12:00 m.',
  updated: 'noviembre de 2026',
}

const L = LEGAL

export const TERMS = {
  title: 'Términos y condiciones',
  sections: [
    ['1. Quiénes somos', [
      `Este sitio (${L.site}) es operado por ${L.owner}, identificado con ${L.idType} ${L.id}, bajo el nombre comercial ${L.brand} ("LeonFit", "nosotros"). Ubicación: ${L.place}.`,
      `Contacto: correo ${L.email}, WhatsApp ${L.whatsapp}, Instagram ${L.instagram} y TikTok ${L.tiktok}. Horario de atención: ${L.schedule}.`,
    ]],
    ['2. Uso del sitio y aceptación', [
      'Al navegar o realizar un pedido en este sitio aceptas estos términos. Si no estás de acuerdo, te pedimos no usarlo. Para comprar debes ser mayor de edad o contar con la autorización de un adulto responsable.',
    ]],
    ['3. Productos e información', [
      'Vendemos suplementos deportivos y productos de moda deportiva. Las imágenes son de referencia y pueden variar levemente frente al empaque recibido. Los precios están expresados en pesos colombianos (COP) y pueden cambiar sin previo aviso; el precio que aplica es el confirmado al momento de tu pedido.',
      'La disponibilidad depende del inventario. Si un producto se agota después de tu pedido, te lo informaremos por WhatsApp para que elijas otro, esperes reposición o canceles.',
      'Los suplementos no son medicamentos ni sustituyen una alimentación equilibrada. Lee siempre la etiqueta y consulta a tu médico si estás embarazada, en lactancia, tomas medicamentos o tienes alguna condición de salud.',
    ]],
    ['4. Cómo se hace un pedido', [
      'Este sitio no procesa pagos en línea. Armas tu carrito y lo envías por WhatsApp; allí confirmamos disponibilidad, valor final, envío y forma de pago. El pedido solo queda en firme cuando confirmamos el pago.',
    ]],
    ['5. Medios de pago', [
      `Aceptamos: ${L.payments}. Te daremos los datos de pago directamente por WhatsApp. Nunca te pediremos claves ni códigos de verificación de tus cuentas. Desconfía de cualquier mensaje que lo haga, aunque diga venir de nosotros.`,
    ]],
    ['6. Envíos', [
      'Enviamos a toda Colombia a través de empresas transportadoras. El tiempo y el costo del envío dependen de la ciudad de destino y de la transportadora, y te los informamos antes de que pagues. Si ofrecemos una promoción de envío gratis, se indicará en el sitio y aplicará según las condiciones de esa promoción.',
      'Debes dar una dirección y un teléfono correctos. Si por datos errados el pedido no puede entregarse, los costos de un nuevo envío pueden quedar a tu cargo.',
    ]],
    ['7. Cambios, garantía y retracto', [
      'Si recibes un producto con defecto de fábrica, en mal estado, vencido o distinto al pedido, escríbenos por WhatsApp o al correo, con fotos y tu número de pedido, lo antes posible tras recibirlo. Lo revisaremos y, según el caso, lo cambiaremos o te daremos solución conforme a la ley.',
      'Por tratarse de productos de consumo, para cambios no relacionados con defectos el producto debe estar sellado, sin abrir ni usar y en su empaque original. Por seguridad no podemos recibir de vuelta productos abiertos.',
      'Tienes derecho de retracto en compras a distancia en los casos y plazos que establece la Ley 1480 de 2011 (Estatuto del Consumidor), salvo las excepciones legales. Para ejercerlo, contáctanos por los medios indicados arriba.',
    ]],
    ['8. Propiedad intelectual', [
      `El nombre ${L.brand}, el logo, los textos y el diseño del sitio son de ${L.owner} o se usan con autorización. No puedes copiarlos ni usarlos con fines comerciales sin permiso por escrito. Las marcas de los productos pertenecen a sus dueños.`,
    ]],
    ['9. Responsabilidad', [
      'Hacemos lo posible por mantener el sitio disponible y la información correcta, pero no garantizamos que esté libre de errores o interrupciones. No somos responsables por el uso inadecuado de los productos ni por retrasos atribuibles a las transportadoras o a causas de fuerza mayor.',
    ]],
    ['10. Reclamos y ley aplicable', [
      `Para peticiones, quejas o reclamos escríbenos a ${L.email} o por WhatsApp (${L.whatsapp}); responderemos dentro de los plazos legales. Estos términos se rigen por las leyes de la República de Colombia. Como consumidor también puedes acudir a la Superintendencia de Industria y Comercio (SIC).`,
    ]],
    ['11. Cambios a estos términos', [
      `Podemos actualizarlos en cualquier momento. La versión vigente es la publicada en este sitio. Última actualización: ${L.updated}.`,
    ]],
  ],
}

export const PRIVACY = {
  title: 'Política de privacidad y tratamiento de datos',
  sections: [
    ['1. Responsable del tratamiento', [
      `${L.owner}, identificado con ${L.idType} ${L.id}, nombre comercial ${L.brand}. Ubicación: ${L.place}. Correo: ${L.email}. WhatsApp: ${L.whatsapp}.`,
      'Esta política se expide conforme a la Ley 1581 de 2012 y sus normas reglamentarias sobre protección de datos personales en Colombia.',
    ]],
    ['2. Qué datos recogemos', [
      'Los que nos das al hacer un pedido o escribirnos: nombre, teléfono, dirección y ciudad de entrega, correo (si nos lo das) y el contenido de tu pedido o consulta. No solicitamos ni guardamos números de tarjetas ni claves bancarias en este sitio.',
      'En tu navegador se guarda el contenido de tu carrito para que no lo pierdas. Eso se queda en tu dispositivo y puedes borrarlo cuando quieras.',
    ]],
    ['3. Para qué los usamos', [
      'Para atender tu pedido o consulta, confirmar pagos, coordinar el envío y la entrega, gestionar cambios y garantías, y cumplir obligaciones legales. Solo te contactaremos para eso. Si en el futuro queremos enviarte promociones, te pediremos antes tu autorización, y podrás retirarla cuando quieras.',
    ]],
    ['4. Con quién los compartimos', [
      'Solo con quien es necesario: la empresa transportadora que entrega tu pedido (nombre, teléfono y dirección) y los proveedores tecnológicos que alojan el sitio y su base de datos (Cloudflare y Supabase). No vendemos tus datos a terceros.',
    ]],
    ['5. Analítica y publicidad', [
      'Actualmente este sitio no usa Google Analytics, Meta Pixel ni otras herramientas de seguimiento publicitario. Si se agregan, actualizaremos esta política.',
    ]],
    ['6. Tus derechos', [
      `Como titular puedes conocer, actualizar y rectificar tus datos, pedir prueba de tu autorización, saber cómo los usamos, solicitar su supresión y revocar la autorización, y presentar quejas ante la Superintendencia de Industria y Comercio. Escríbenos a ${L.email} o por WhatsApp al ${L.whatsapp} indicando tu nombre y qué solicitas; responderemos dentro de los plazos de ley.`,
    ]],
    ['7. Conservación y seguridad', [
      'Guardamos tus datos mientras sean necesarios para las finalidades descritas y para cumplir obligaciones legales; después los eliminamos o anonimizamos. Aplicamos medidas razonables para protegerlos, aunque ningún sistema es totalmente infalible.',
    ]],
    ['8. Menores de edad', [
      'No tratamos datos de menores sin autorización de sus padres o representantes legales.',
    ]],
    ['9. Cambios a esta política', [
      `Podemos actualizarla; la versión vigente es la publicada en este sitio. Última actualización: ${L.updated}.`,
    ]],
  ],
}
