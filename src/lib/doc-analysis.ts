// src/lib/doc-analysis.ts
// Gap analysis de documentación para ecommerce PyME

export interface ExpectedDoc {
  id: string
  title: string
  description: string
  priority: 'critical' | 'important' | 'nice-to-have'
  owner: string       // graph node id del responsable
  ownerName: string
  ownerRole: string
  category: 'operaciones' | 'finanzas' | 'marketing' | 'soporte' | 'legal' | 'rrhh' | 'estrategia'
  exists: boolean
  matchedDoc?: string
}

const ECOMMERCE_EXPECTED_DOCS: ExpectedDoc[] = [
  // ── YA EXISTEN ────────────────────────────────────────────────────────────
  {
    id: 'doc-manual-ceo',
    title: 'Manual de Dirección General',
    description: 'Procesos de decisión, política de pricing, gestión de proveedores, reglas de negocio.',
    priority: 'critical',
    owner: 'ceo',
    ownerName: 'Martín García',
    ownerRole: 'CEO',
    category: 'estrategia',
    exists: true,
    matchedDoc: 'NovaStore-Manual-CEO-Direccion.docx',
  },
  {
    id: 'doc-manual-ops',
    title: 'Manual de Operaciones y Logística',
    description: 'Gestión de stock, envíos, devoluciones, operadores logísticos.',
    priority: 'critical',
    owner: 'ops',
    ownerName: 'Carlos Méndez',
    ownerRole: 'Operaciones',
    category: 'operaciones',
    exists: true,
    matchedDoc: 'NovaStore-Manual-Operaciones-Logistica.docx',
  },
  {
    id: 'doc-manual-fin',
    title: 'Manual de Finanzas y Administración',
    description: 'Facturación, flujo de caja, conciliación, pagos a proveedores.',
    priority: 'critical',
    owner: 'finanzas',
    ownerName: 'Ana Ruiz',
    ownerRole: 'Finanzas',
    category: 'finanzas',
    exists: true,
    matchedDoc: 'NovaStore-Manual-Finanzas-Admin.docx',
  },
  {
    id: 'doc-manual-mkt',
    title: 'Manual de Marketing Digital',
    description: 'Redes sociales, email marketing, pauta publicitaria, métricas.',
    priority: 'critical',
    owner: 'marketing',
    ownerName: 'Lucía Fernández',
    ownerRole: 'Marketing',
    category: 'marketing',
    exists: true,
    matchedDoc: 'NovaStore-Manual-Marketing-Digital.docx',
  },
  {
    id: 'doc-manual-sup',
    title: 'Manual de Atención al Cliente',
    description: 'Canales, SLAs, proceso de reclamos, templates de respuesta.',
    priority: 'critical',
    owner: 'soporte',
    ownerName: 'Diego López',
    ownerRole: 'Soporte',
    category: 'soporte',
    exists: true,
    matchedDoc: 'NovaStore-Manual-Soporte-Cliente.docx',
  },

  // ── FALTAN ────────────────────────────────────────────────────────────────
  {
    id: 'doc-catalogo',
    title: 'Catálogo de Productos',
    description: 'SKUs, descripciones, fotos, precios, proveedores, temporada. Esencial para que Soporte y Marketing tengan info actualizada de productos.',
    priority: 'critical',
    owner: 'ops',
    ownerName: 'Carlos Méndez',
    ownerRole: 'Operaciones',
    category: 'operaciones',
    exists: false,
  },
  {
    id: 'doc-politica-devolucion',
    title: 'Política de Devoluciones y Garantía',
    description: 'Condiciones, plazos, proceso paso a paso, quién absorbe el costo de envío según caso. Soporte lo necesita para responder sin escalar.',
    priority: 'critical',
    owner: 'soporte',
    ownerName: 'Diego López',
    ownerRole: 'Soporte',
    category: 'soporte',
    exists: false,
  },
  {
    id: 'doc-precios-competencia',
    title: 'Análisis de Precios y Competencia',
    description: 'Benchmark de precios vs. competidores principales, estrategia de diferenciación, reglas de price matching.',
    priority: 'important',
    owner: 'ceo',
    ownerName: 'Martín García',
    ownerRole: 'CEO',
    category: 'estrategia',
    exists: false,
  },
  {
    id: 'doc-calendario-comercial',
    title: 'Calendario Comercial Anual',
    description: 'Fechas clave (Black Friday, Cyber Monday, Día de la Madre, etc.), presupuestos por campaña, responsables, deadlines de preparación.',
    priority: 'important',
    owner: 'marketing',
    ownerName: 'Lucía Fernández',
    ownerRole: 'Marketing',
    category: 'marketing',
    exists: false,
  },
  {
    id: 'doc-proveedores-backup',
    title: 'Directorio de Proveedores Alternativos',
    description: 'Proveedores de backup para cada categoría de producto. Contactos, condiciones, tiempos de entrega. Para cuando el proveedor principal falla.',
    priority: 'important',
    owner: 'ceo',
    ownerName: 'Martín García',
    ownerRole: 'CEO',
    category: 'operaciones',
    exists: false,
  },
  {
    id: 'doc-onboarding-empleado',
    title: 'Guía de Onboarding para Nuevos Empleados',
    description: 'Qué necesita saber alguien nuevo en su primera semana: herramientas, accesos, contactos, procesos básicos por área.',
    priority: 'important',
    owner: 'ceo',
    ownerName: 'Martín García',
    ownerRole: 'CEO',
    category: 'rrhh',
    exists: false,
  },
  {
    id: 'doc-faq-clientes',
    title: 'FAQ y Base de Conocimiento para Clientes',
    description: 'Preguntas frecuentes, guía de talles, tiempos de envío por zona, política de cambios. Para que Soporte copie y pegue en vez de redactar cada vez.',
    priority: 'important',
    owner: 'soporte',
    ownerName: 'Diego López',
    ownerRole: 'Soporte',
    category: 'soporte',
    exists: false,
  },
  {
    id: 'doc-contratos-proveedores',
    title: 'Contratos y Acuerdos con Proveedores',
    description: 'Contratos vigentes, condiciones comerciales, vencimientos, cláusulas importantes.',
    priority: 'nice-to-have',
    owner: 'finanzas',
    ownerName: 'Ana Ruiz',
    ownerRole: 'Finanzas',
    category: 'legal',
    exists: false,
  },
  {
    id: 'doc-plan-contingencia',
    title: 'Plan de Contingencia Operativa',
    description: 'Qué hacer si: se cae la web, se queda sin stock un producto estrella, se va un empleado clave, falla un operador logístico.',
    priority: 'nice-to-have',
    owner: 'ceo',
    ownerName: 'Martín García',
    ownerRole: 'CEO',
    category: 'estrategia',
    exists: false,
  },
  {
    id: 'doc-brand-guidelines',
    title: 'Guía de Marca y Tono de Comunicación',
    description: 'Logo, colores, tipografía, tono de voz para redes y atención al cliente. Para que todos comuniquen igual.',
    priority: 'nice-to-have',
    owner: 'marketing',
    ownerName: 'Lucía Fernández',
    ownerRole: 'Marketing',
    category: 'marketing',
    exists: false,
  },
]

export const TOTAL_DOCS    = ECOMMERCE_EXPECTED_DOCS.length
export const EXISTING_DOCS = ECOMMERCE_EXPECTED_DOCS.filter(d => d.exists).length

export function getCompletionRate(): number {
  return Math.round((EXISTING_DOCS / TOTAL_DOCS) * 100)
}

export function getMissingByPriority(): {
  critical: ExpectedDoc[]
  important: ExpectedDoc[]
  niceToHave: ExpectedDoc[]
} {
  const missing = ECOMMERCE_EXPECTED_DOCS.filter(d => !d.exists)
  return {
    critical:   missing.filter(d => d.priority === 'critical'),
    important:  missing.filter(d => d.priority === 'important'),
    niceToHave: missing.filter(d => d.priority === 'nice-to-have'),
  }
}

export function getMissingByOwner(): Record<string, ExpectedDoc[]> {
  const missing = ECOMMERCE_EXPECTED_DOCS.filter(d => !d.exists)
  return missing.reduce<Record<string, ExpectedDoc[]>>((acc, doc) => {
    if (!acc[doc.ownerName]) acc[doc.ownerName] = []
    acc[doc.ownerName].push(doc)
    return acc
  }, {})
}

export function getNextRecommendation(): ExpectedDoc {
  const missing = ECOMMERCE_EXPECTED_DOCS.filter(d => !d.exists)
  return (
    missing.find(d => d.priority === 'critical') ??
    missing.find(d => d.priority === 'important') ??
    missing[0]
  )
}
