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

// ─── Constants ────────────────────────────────────────────────────────────────

export const ACCEPTED_EXTENSIONS = ['.docx', '.pdf', '.txt']

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
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

// Set of IDs that belong to the pre-seeded demo — these cannot be deleted
export const PRELOADED_DOC_IDS = new Set(PRELOADED_DOCS.map(d => d.id))

// ─── Mock extraction results ─────────────────────────────────────────────────

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
    "Nova Store's main supplier is **Textil SRL**. The contact is Roberto (mobile 11-3456-7890). Current terms are 60-day payment with biweekly meetings to review catalog and pricing. For new suppliers, policy is to always negotiate a minimum of 60-day payment terms.\n\n_This information comes from Martín (CEO) and Carlos (Operations)'s knowledge._",

  envio:
    'Nova Store works with 3 logistics operators:\n• **OCA** for CABA/GBA (1-3 days, 12% discount with code ECOM2026)\n• **Correo Argentino** for the interior (3-7 days, Tierra del Fuego minimum 10 days)\n• **Andreani** for bulk shipments\n\nCritical rule: NEVER dispatch after 4pm. MercadoLibre penalizes if not shipped within 24h.\n\n_This information comes from Carlos (Operations)\'s knowledge._',

  logistica:
    'Nova Store works with 3 logistics operators:\n• **OCA** for CABA/GBA (1-3 days, 12% discount with code ECOM2026)\n• **Correo Argentino** for the interior (3-7 days, Tierra del Fuego minimum 10 days)\n• **Andreani** for bulk shipments\n\nCritical rule: NEVER dispatch after 4pm. MercadoLibre penalizes if not shipped within 24h.\n\n_This information comes from Carlos (Operations)\'s knowledge._',

  factura:
    'Invoicing is done through ARCA/AFIP. **Invoice A** for companies (CUIT), **Invoice B** for end consumers. Rule: always invoice before the 10th of each month. Note: ARCA frequently goes down on Friday afternoons.\n\nExternal accountant is Estudio García — contact Laura, tel 11-4567-8900.\n\n_This information comes from Ana (Finance)\'s knowledge._',

  afip:
    'Invoicing is done through ARCA/AFIP. **Invoice A** for companies (CUIT), **Invoice B** for end consumers. Rule: always invoice before the 10th of each month. Note: ARCA frequently goes down on Friday afternoons.\n\nExternal accountant is Estudio García — contact Laura, tel 11-4567-8900.\n\n_This information comes from Ana (Finance)\'s knowledge._',

  descuento:
    'Discounts up to **15%** can be approved by Marketing directly. Any discount above 15% requires CEO (Martín) approval via WhatsApp.\n\nThe minimum margin on any product is **35%** — this rule has no exceptions.\n\n_This information comes from Martín (CEO) and Lucía (Marketing)\'s knowledge._',

  precio:
    'The minimum margin on any product is **35%** — no exceptions. Discounts up to 15% are approved by Marketing; above 15% requires CEO approval via WhatsApp.\n\n_This information comes from Martín (CEO) and Ana (Finance)\'s knowledge._',

  margen:
    'The minimum margin on any product is **35%** — no exceptions. Discounts up to 15% are approved by Marketing; above 15% requires CEO approval via WhatsApp.\n\n_This information comes from Martín (CEO) and Ana (Finance)\'s knowledge._',

  reclamo:
    'Claims process:\n1. Diego (Support) receives the claim via WhatsApp or MercadoLibre\n2. Classifies: defect, delay, error, change of mind\n3. If defect → escalates to CEO with photos\n4. If delay → contacts the logistics operator\n5. If package lost >10 days → resend at no cost\n\nSLA: always respond within **2 hours**.\n\n_This information comes from Diego (Support) and Carlos (Operations)\'s knowledge._',

  soporte:
    'Claims process:\n1. Diego (Support) receives the claim via WhatsApp or MercadoLibre\n2. Classifies: defect, delay, error, change of mind\n3. If defect → escalates to CEO with photos\n4. If delay → contacts the logistics operator\n5. If package lost >10 days → resend at no cost\n\nSLA: always respond within **2 hours**.\n\n_This information comes from Diego (Support) and Carlos (Operations)\'s knowledge._',

  marketing:
    'Nova Store digital marketing strategy:\n• **Instagram**: 3 posts/week + daily stories. Best time: Tuesday 6pm.\n• **Email**: weekly newsletter on Thursdays via Mailchimp (500 email limit)\n• **Paid ads**: Meta Ads, up to $200/day without approval, more requires CEO approval\n• Audience: women 25-40 years old, AMBA area\n• External agency: Studio Pixel, contact Carla (carla@studiopixel.com)\n\n_This information comes from Lucía (Marketing)\'s knowledge._',

  instagram:
    '• **Instagram**: 3 posts/week + daily stories. Best time: Tuesday 6pm.\n• Content: catalog, testimonials and behind-the-scenes.\n• Design: Canva + Studio Pixel (external agency).\n• Meta Ads spend: up to $200/day without CEO approval.\n\n_This information comes from Lucía (Marketing)\'s knowledge._',

  stock:
    'Stock is managed in **Google Sheets**, tab "Current Stock". When a product drops below 5 units, an alert is triggered. If it\'s a star product (top 5 sales), Carlos escalates to CEO immediately.\n\nRestock <$500: Operations handles it directly. >$500: requires CEO approval.\n\nStandard packaging is a 30×20×15 box.\n\n_This information comes from Carlos (Operations)\'s knowledge._',

  inventario:
    'Stock is managed in **Google Sheets**, tab "Current Stock". When a product drops below 5 units, an alert is triggered. If it\'s a star product (top 5 sales), Carlos escalates to CEO immediately.\n\nRestock <$500: Operations handles it directly. >$500: requires CEO approval.\n\n_This information comes from Carlos (Operations)\'s knowledge._',

  equipo:
    'Nova Store has 5 people:\n• **Martín García** — CEO, strategic direction and business decisions\n• **Carlos Méndez** — Operations, stock management, shipping and logistics\n• **Ana Ruiz** — Finance, invoicing, cash flow and administration\n• **Lucía Fernández** — Marketing, social media, paid ads and email marketing\n• **Diego López** — Support, customer service via WhatsApp and MercadoLibre\n\nWeekly meeting: Mondays 10am on Google Meet.\n\n_This information comes from all agents\'s knowledge._',

  costo:
    'Key cost structure:\n• Minimum margin: **35%** (no exceptions)\n• OCA logistics: 12% discount with code ECOM2026\n• Marketing spend: up to $200/day without approval\n• Expenses <$500: each department approves independently. >$500: CEO approves.\n• MercadoPago settles within 48 business hours\n• Accountant: monthly fees to Estudio García\n\n_This information comes from Ana (Finance) and Martín (CEO)\'s knowledge._',

  presupuesto:
    'Key cost structure:\n• Minimum margin: **35%** (no exceptions)\n• OCA logistics: 12% discount with code ECOM2026\n• Marketing spend: up to $200/day without approval\n• Expenses <$500: each department approves independently. >$500: CEO approves.\n• MercadoPago settles within 48 business hours\n\n_This information comes from Ana (Finance) and Martín (CEO)\'s knowledge._',

  mercadolibre:
    'MercadoLibre is the main sales channel for Nova Store. Key rules:\n• Answer questions within **2 hours** (affects reputation)\n• Ship within **24h** of confirmed payment\n• NEVER dispatch after 4pm\n• Claims are handled by Diego (Support)\n\n_This information comes from Carlos (Operations) and Diego (Support)\'s knowledge._',

  default:
    "Based on Nova Store's organizational knowledge, I can answer about: **suppliers**, **shipping and logistics**, **invoicing**, **discounts and pricing**, **claims**, **digital marketing**, **stock and inventory**, **the team**, and **costs**.\n\nWhat area would you like to know more about?",
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
