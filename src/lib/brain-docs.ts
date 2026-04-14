// src/lib/brain-docs.ts
// Mock data and utilities for the Brain document upload + org-brain chatbot.

// ─── Types ────────────────────────────────────────────────────────────────────

export interface BrainDoc {
  id: string
  filename: string
  uploadedAt: string
  size: string
  status: 'processed' | 'pending' | 'processing'
  extractedItems?: {
    tasks: number
    tools: number
    decisions: number
    knowledge: number
  }
  linkedAgents?: string[]
}

// ─── Pre-loaded demo documents ────────────────────────────────────────────────

export const PRELOADED_DOCS: BrainDoc[] = [
  {
    id: 'doc-ceo',
    filename: 'NovaStore-Manual-CEO-Direccion.docx',
    uploadedAt: '2026-04-14T09:00:00',
    size: '45 KB',
    status: 'processed',
    extractedItems: { tasks: 7, tools: 6, decisions: 4, knowledge: 5 },
    linkedAgents: ['ceo-twin'],
  },
  {
    id: 'doc-ops',
    filename: 'NovaStore-Manual-Operaciones-Logistica.docx',
    uploadedAt: '2026-04-14T09:05:00',
    size: '52 KB',
    status: 'processed',
    extractedItems: { tasks: 9, tools: 7, decisions: 5, knowledge: 7 },
    linkedAgents: ['ops-twin'],
  },
  {
    id: 'doc-fin',
    filename: 'NovaStore-Manual-Finanzas-Admin.docx',
    uploadedAt: '2026-04-14T09:10:00',
    size: '38 KB',
    status: 'processed',
    extractedItems: { tasks: 6, tools: 5, decisions: 3, knowledge: 4 },
    linkedAgents: ['finance-twin'],
  },
  {
    id: 'doc-mkt',
    filename: 'NovaStore-Manual-Marketing-Digital.docx',
    uploadedAt: '2026-04-14T09:15:00',
    size: '41 KB',
    status: 'processed',
    extractedItems: { tasks: 6, tools: 5, decisions: 2, knowledge: 4 },
    linkedAgents: ['marketing-twin'],
  },
  {
    id: 'doc-sup',
    filename: 'NovaStore-Manual-Soporte-Cliente.docx',
    uploadedAt: '2026-04-14T09:20:00',
    size: '36 KB',
    status: 'processed',
    extractedItems: { tasks: 5, tools: 3, decisions: 2, knowledge: 5 },
    linkedAgents: ['support-twin'],
  },
]

// ─── Mock extraction results ─────────────────────────────────────────────────
// Shown when a user "processes" a newly-uploaded file.

export function getMockExtractedItems(): BrainDoc['extractedItems'] {
  return {
    tasks: Math.floor(Math.random() * 6) + 3,
    tools: Math.floor(Math.random() * 4) + 2,
    decisions: Math.floor(Math.random() * 3) + 1,
    knowledge: Math.floor(Math.random() * 4) + 2,
  }
}

// ─── localStorage helpers ─────────────────────────────────────────────────────

const STORAGE_KEY = 'organa-brain-docs'

export function loadDocs(): BrainDoc[] {
  if (typeof window === 'undefined') return PRELOADED_DOCS
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw) as BrainDoc[]
  } catch {
    // ignore
  }
  return PRELOADED_DOCS
}

export function saveDocs(docs: BrainDoc[]): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(docs))
}

// ─── Brain chat keyword responses ─────────────────────────────────────────────

export const BRAIN_RESPONSES: Record<string, string> = {
  proveedor:
    'El proveedor principal de Nova Store es **Textil SRL**. El contacto es Roberto (cel 11-3456-7890). Las condiciones actuales son 60 días de pago, con reuniones quincenales para revisar catálogo y precios. Para proveedores nuevos, la política es negociar siempre 60 días de pago como mínimo.\n\n_Esta información viene del conocimiento de Martín (CEO) y Carlos (Operaciones)._',

  envio:
    'Nova Store trabaja con 3 operadores logísticos:\n• **OCA** para CABA/GBA (1-3 días, descuento 12% con código ECOM2026)\n• **Correo Argentino** para interior (3-7 días, Tierra del Fuego mínimo 10 días)\n• **Andreani** para envíos de volumen\n\nRegla crítica: NUNCA despachar después de las 16h. MercadoLibre penaliza si no se despacha en 24h.\n\n_Esta información viene del conocimiento de Carlos (Operaciones)._',

  logistica:
    'Nova Store trabaja con 3 operadores logísticos:\n• **OCA** para CABA/GBA (1-3 días, descuento 12% con código ECOM2026)\n• **Correo Argentino** para interior (3-7 días, Tierra del Fuego mínimo 10 días)\n• **Andreani** para envíos de volumen\n\nRegla crítica: NUNCA despachar después de las 16h. MercadoLibre penaliza si no se despacha en 24h.\n\n_Esta información viene del conocimiento de Carlos (Operaciones)._',

  factura:
    'La facturación se hace en ARCA/AFIP. **Factura A** para empresas (CUIT), **Factura B** para consumidor final. Regla: facturar siempre antes del 10 de cada mes. Cuidado: ARCA se cae frecuentemente los viernes a la tarde.\n\nEl contador externo es Estudio García — contacto Laura, tel 11-4567-8900.\n\n_Esta información viene del conocimiento de Ana (Finanzas)._',

  afip:
    'La facturación se hace en ARCA/AFIP. **Factura A** para empresas (CUIT), **Factura B** para consumidor final. Regla: facturar siempre antes del 10 de cada mes. Cuidado: ARCA se cae frecuentemente los viernes a la tarde.\n\nEl contador externo es Estudio García — contacto Laura, tel 11-4567-8900.\n\n_Esta información viene del conocimiento de Ana (Finanzas)._',

  descuento:
    'Los descuentos hasta **15%** los puede aprobar Marketing directamente. Cualquier descuento superior al 15% requiere aprobación del CEO (Martín) por WhatsApp.\n\nEl margen mínimo en cualquier producto es **35%** — esta regla no tiene excepciones.\n\n_Esta información viene del conocimiento de Martín (CEO) y Lucía (Marketing)._',

  precio:
    'El margen mínimo en cualquier producto es **35%** — sin excepciones. Los descuentos hasta 15% los aprueba Marketing; más del 15% requiere OK del CEO por WhatsApp.\n\n_Esta información viene del conocimiento de Martín (CEO) y Ana (Finanzas)._',

  margen:
    'El margen mínimo en cualquier producto es **35%** — sin excepciones. Los descuentos hasta 15% los aprueba Marketing; más del 15% requiere OK del CEO por WhatsApp.\n\n_Esta información viene del conocimiento de Martín (CEO) y Ana (Finanzas)._',

  reclamo:
    'Proceso de reclamos:\n1. Diego (Soporte) recibe el reclamo por WhatsApp o MercadoLibre\n2. Clasifica: defecto, demora, error, arrepentimiento\n3. Si es defecto → escala al CEO con fotos\n4. Si es demora → contacta al operador logístico\n5. Si paquete perdido >10 días → reenvío sin costo\n\nSLA: responder en menos de **2 horas** siempre.\n\n_Esta información viene del conocimiento de Diego (Soporte) y Carlos (Operaciones)._',

  soporte:
    'Proceso de reclamos:\n1. Diego (Soporte) recibe el reclamo por WhatsApp o MercadoLibre\n2. Clasifica: defecto, demora, error, arrepentimiento\n3. Si es defecto → escala al CEO con fotos\n4. Si es demora → contacta al operador logístico\n5. Si paquete perdido >10 días → reenvío sin costo\n\nSLA: responder en menos de **2 horas** siempre.\n\n_Esta información viene del conocimiento de Diego (Soporte) y Carlos (Operaciones)._',

  marketing:
    'Estrategia de marketing digital de Nova Store:\n• **Instagram**: 3 posts/semana + stories diarios. Mejor horario: martes 18h.\n• **Email**: newsletter semanal los jueves por Mailchimp (límite 500 mails)\n• **Pauta**: Meta Ads, hasta $200/día sin aprobación, más requiere OK del CEO\n• Público: mujeres 25-40 años, zona AMBA\n• Agencia externa: Studio Pixel, contacto Carla (carla@studiopixel.com)\n\n_Esta información viene del conocimiento de Lucía (Marketing)._',

  instagram:
    '• **Instagram**: 3 posts/semana + stories diarios. Mejor horario: martes 18h.\n• Contenido: catálogo, testimonios y behind-the-scenes.\n• Diseño: Canva + Studio Pixel (agencia externa).\n• Pauta de Meta Ads: hasta $200/día sin aprobación del CEO.\n\n_Esta información viene del conocimiento de Lucía (Marketing)._',

  stock:
    'El stock se gestiona en **Google Sheets**, pestaña "Stock Actual". Cuando un producto baja de 5 unidades, se genera alerta. Si es un producto estrella (top 5 ventas), Carlos escala al CEO inmediatamente.\n\nReposición <$500: Operaciones la gestiona directo. >$500: requiere aprobación del CEO.\n\nEl packaging estándar es caja 30×20×15.\n\n_Esta información viene del conocimiento de Carlos (Operaciones)._',

  inventario:
    'El stock se gestiona en **Google Sheets**, pestaña "Stock Actual". Cuando un producto baja de 5 unidades, se genera alerta. Si es un producto estrella (top 5 ventas), Carlos escala al CEO inmediatamente.\n\nReposición <$500: Operaciones la gestiona directo. >$500: requiere aprobación del CEO.\n\n_Esta información viene del conocimiento de Carlos (Operaciones)._',

  equipo:
    'Nova Store tiene 5 personas:\n• **Martín García** — CEO, dirección estratégica y decisiones de negocio\n• **Carlos Méndez** — Operaciones, gestión de stock, envíos y logística\n• **Ana Ruiz** — Finanzas, facturación, flujo de caja y administración\n• **Lucía Fernández** — Marketing, redes sociales, pauta y email marketing\n• **Diego López** — Soporte, atención al cliente por WhatsApp y MercadoLibre\n\nReunión semanal: lunes 10am por Google Meet.\n\n_Esta información viene del conocimiento de todos los agentes._',

  costo:
    'Estructura de costos clave:\n• Margen mínimo: **35%** (sin excepciones)\n• Logística OCA: descuento 12% con código ECOM2026\n• Pauta marketing: hasta $200/día sin aprobación\n• Gastos <$500: cada área aprueba sola. >$500: CEO aprueba.\n• MercadoPago liquida a 48h hábiles\n• Contador: honorarios mensuales a Estudio García\n\n_Esta información viene del conocimiento de Ana (Finanzas) y Martín (CEO)._',

  presupuesto:
    'Estructura de costos clave:\n• Margen mínimo: **35%** (sin excepciones)\n• Logística OCA: descuento 12% con código ECOM2026\n• Pauta marketing: hasta $200/día sin aprobación\n• Gastos <$500: cada área aprueba sola. >$500: CEO aprueba.\n• MercadoPago liquida a 48h hábiles\n\n_Esta información viene del conocimiento de Ana (Finanzas) y Martín (CEO)._',

  mercadolibre:
    'MercadoLibre es el canal de ventas principal de Nova Store. Reglas clave:\n• Responder preguntas en menos de **2 horas** (afecta reputación)\n• Despachar en menos de **24h** de confirmado el pago\n• NUNCA despachar después de las 16h\n• Reclamos se procesan vía Diego (Soporte)\n\n_Esta información viene del conocimiento de Carlos (Operaciones) y Diego (Soporte)._',

  default:
    'Basándome en el conocimiento organizacional de Nova Store, puedo responder sobre: **proveedores**, **envíos y logística**, **facturación**, **descuentos y pricing**, **reclamos**, **marketing digital**, **stock e inventario**, **el equipo**, y **costos**.\n\n¿Sobre qué área te gustaría saber más?',
}

export function getBrainResponse(message: string): string {
  const lower = message.toLowerCase()
  for (const key of Object.keys(BRAIN_RESPONSES)) {
    if (key !== 'default' && lower.includes(key)) {
      return BRAIN_RESPONSES[key]
    }
  }
  return BRAIN_RESPONSES['default']
}
