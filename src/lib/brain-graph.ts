// src/lib/brain-graph.ts
// Static knowledge graph data for the "Cerebro Organizacional" page.
// Derived from the Nova Store seed: persons, tools, decisions, and
// tribal knowledge extracted from each agent's KnowledgeBase categories.

export type NodeType = 'person' | 'tool' | 'decision' | 'knowledge' | 'document'

export interface GraphNode {
  id: string
  label: string
  type: NodeType
  group: string        // agentId or 'shared'
  connections: number  // total link count — drives circle size
  detail?: string      // shown in the side panel
}

export interface GraphLink {
  source: string
  target: string
  type: 'reports_to' | 'uses_tool' | 'makes_decision' | 'shares_knowledge' | 'works_with' | 'documents'
  label?: string
}

export interface BrainGraphData {
  nodes: GraphNode[]
  links: GraphLink[]
}

// ─── Node colour palette ─────────────────────────────────────────────────────

export const NODE_COLOR: Record<NodeType, string> = {
  person:    '#4F6BED',
  tool:      '#F59E0B',
  decision:  '#EF4444',
  knowledge: '#8B5CF6',
  document:  '#06B6D4',
}

export const LINK_COLOR: Record<GraphLink['type'], string> = {
  reports_to:      '#4F6BED',
  works_with:      '#94A3B8',
  uses_tool:       '#F59E0B',
  makes_decision:  '#EF4444',
  shares_knowledge:'#8B5CF6',
  documents:       '#06B6D4',
}

// ─── Graph nodes ─────────────────────────────────────────────────────────────

const NODES: GraphNode[] = [
  // ── Persons (5) ────────────────────────────────────────────────────────────
  {
    id: 'ceo',
    label: 'Martín García',
    type: 'person',
    group: 'ceo',
    connections: 18,
    detail: 'CEO y fundador de Nova Store. Aprueba decisiones clave de presupuesto, marketing y operaciones.',
  },
  {
    id: 'ops',
    label: 'Carlos Méndez',
    type: 'person',
    group: 'ops',
    connections: 17,
    detail: 'Responsable de logística, despachos y operaciones diarias.',
  },
  {
    id: 'finanzas',
    label: 'Ana Ruiz',
    type: 'person',
    group: 'finanzas',
    connections: 13,
    detail: 'Contabilidad, relación con ARCA/AFIP, banco y proveedores.',
  },
  {
    id: 'marketing',
    label: 'Lucía Fernández',
    type: 'person',
    group: 'marketing',
    connections: 11,
    detail: 'Gestiona redes sociales, pauta publicitaria y campañas de contenido.',
  },
  {
    id: 'soporte',
    label: 'Diego López',
    type: 'person',
    group: 'soporte',
    connections: 9,
    detail: 'Atiende reclamos y consultas de clientes en MercadoLibre y Tienda Nube.',
  },

  // ── Tools (18) ─────────────────────────────────────────────────────────────
  { id: 'google-sheets',     label: 'Google Sheets',     type: 'tool', group: 'shared',    connections: 3, detail: 'Planillas compartidas de seguimiento y reportes.' },
  { id: 'whatsapp',          label: 'WhatsApp',           type: 'tool', group: 'shared',    connections: 5, detail: 'Canal de comunicación interno y con proveedores.' },
  { id: 'gmail',             label: 'Gmail',              type: 'tool', group: 'shared',    connections: 3, detail: 'Correo corporativo para comunicación formal.' },
  { id: 'tienda-nube',       label: 'Tienda Nube',        type: 'tool', group: 'shared',    connections: 3, detail: 'Plataforma de ecommerce principal de Nova Store.' },
  { id: 'mercadolibre',      label: 'MercadoLibre',       type: 'tool', group: 'shared',    connections: 3, detail: 'Canal de ventas principal por volumen.' },
  { id: 'arca-afip',         label: 'ARCA / AFIP',        type: 'tool', group: 'finanzas',  connections: 1, detail: 'Portal fiscal para facturas y declaraciones.' },
  { id: 'instagram',         label: 'Instagram',          type: 'tool', group: 'marketing', connections: 1, detail: 'Canal de contenido orgánico y comunidad.' },
  { id: 'canva',             label: 'Canva',              type: 'tool', group: 'marketing', connections: 1, detail: 'Diseño de piezas para redes sociales y campañas.' },
  { id: 'mailchimp',         label: 'Mailchimp',          type: 'tool', group: 'marketing', connections: 1, detail: 'Email marketing y automatizaciones de fidelización.' },
  { id: 'meta-ads',          label: 'Meta Ads',           type: 'tool', group: 'marketing', connections: 1, detail: 'Pauta paga en Facebook e Instagram.' },
  { id: 'mercadopago',       label: 'MercadoPago',        type: 'tool', group: 'finanzas',  connections: 1, detail: 'Procesador de pagos para Tienda Nube y ML.' },
  { id: 'google-meet',       label: 'Google Meet',        type: 'tool', group: 'ceo',       connections: 1, detail: 'Videollamadas con proveedores y equipo remoto.' },
  { id: 'google-analytics',  label: 'Google Analytics',   type: 'tool', group: 'marketing', connections: 1, detail: 'Análisis de tráfico web y conversiones.' },
  { id: 'whatsapp-business', label: 'WA Business',        type: 'tool', group: 'soporte',   connections: 1, detail: 'Atención al cliente postventa y seguimiento de pedidos.' },
  { id: 'correo-argentino',  label: 'Correo Argentino',   type: 'tool', group: 'ops',       connections: 1, detail: 'Operador logístico principal para el interior.' },
  { id: 'oca',               label: 'OCA',                type: 'tool', group: 'ops',       connections: 1, detail: 'Operador logístico de respaldo.' },
  { id: 'excel',             label: 'Excel',              type: 'tool', group: 'finanzas',  connections: 1, detail: 'Análisis financiero y proyecciones de margen.' },
  { id: 'banco-galicia',     label: 'Banco Galicia',      type: 'tool', group: 'finanzas',  connections: 1, detail: 'Cuenta corriente y acreditaciones.' },

  // ── Decisions (6) ──────────────────────────────────────────────────────────
  {
    id: 'dec-descuentos',
    label: 'Descuentos >15%',
    type: 'decision',
    group: 'shared',
    connections: 2,
    detail: 'Descuentos mayores al 15% requieren aprobación del CEO.',
  },
  {
    id: 'dec-compras',
    label: 'Compras >$500',
    type: 'decision',
    group: 'shared',
    connections: 3,
    detail: 'Compras mayores a $500 USD requieren aprobación del CEO.',
  },
  {
    id: 'dec-pauta',
    label: 'Pauta >$200/día',
    type: 'decision',
    group: 'shared',
    connections: 2,
    detail: 'Pauta publicitaria mayor a $200/día requiere aprobación del CEO.',
  },
  {
    id: 'dec-stock',
    label: 'Quiebre de stock',
    type: 'decision',
    group: 'shared',
    connections: 2,
    detail: 'Quiebre de stock debe escalarse al CEO inmediatamente.',
  },
  {
    id: 'dec-reclamo',
    label: 'Reclamo producto',
    type: 'decision',
    group: 'shared',
    connections: 2,
    detail: 'Reclamos de producto deben escalarse al CEO.',
  },
  {
    id: 'dec-logistica',
    label: 'Operador logístico',
    type: 'decision',
    group: 'ops',
    connections: 1,
    detail: 'Selección del operador logístico según zona de envío.',
  },

  // ── Documents (5) ──────────────────────────────────────────────────────────
  {
    id: 'doc-ceo',
    label: 'Manual CEO',
    type: 'document',
    group: 'ceo',
    connections: 9,
    detail: 'Manual de Dirección General. Procesos de decisión, pricing, proveedores y reglas de negocio.',
  },
  {
    id: 'doc-ops',
    label: 'Manual Operaciones',
    type: 'document',
    group: 'ops',
    connections: 10,
    detail: 'Manual de Operaciones y Logística. Gestión de stock, envíos, devoluciones y operadores.',
  },
  {
    id: 'doc-fin',
    label: 'Manual Finanzas',
    type: 'document',
    group: 'finanzas',
    connections: 8,
    detail: 'Manual de Finanzas y Administración. Facturación, flujo de caja y pagos a proveedores.',
  },
  {
    id: 'doc-mkt',
    label: 'Manual Marketing',
    type: 'document',
    group: 'marketing',
    connections: 8,
    detail: 'Manual de Marketing Digital. Redes sociales, email marketing, pauta y métricas.',
  },
  {
    id: 'doc-sup',
    label: 'Manual Soporte',
    type: 'document',
    group: 'soporte',
    connections: 6,
    detail: 'Manual de Atención al Cliente. Canales, SLAs, reclamos y templates de respuesta.',
  },

  // ── Knowledge (8) ──────────────────────────────────────────────────────────
  {
    id: 'know-margen',
    label: 'Margen mínimo 35%',
    type: 'knowledge',
    group: 'shared',
    connections: 2,
    detail: 'Todo producto debe mantener un margen mínimo del 35% para ser rentable.',
  },
  {
    id: 'know-proveedor',
    label: 'Textil SRL',
    type: 'knowledge',
    group: 'shared',
    connections: 2,
    detail: 'Proveedor principal: Textil SRL. Contacto directo vía WhatsApp con CEO y Ops.',
  },
  {
    id: 'know-contador',
    label: 'Estudio García',
    type: 'knowledge',
    group: 'shared',
    connections: 2,
    detail: 'Estudio contable externo que maneja impuestos, balances y declaraciones.',
  },
  {
    id: 'know-despacho',
    label: 'Despachar antes 16h',
    type: 'knowledge',
    group: 'ops',
    connections: 1,
    detail: 'Todo despacho debe realizarse antes de las 16h para asegurar el retiro del día.',
  },
  {
    id: 'know-arca',
    label: 'ARCA cae viernes',
    type: 'knowledge',
    group: 'finanzas',
    connections: 1,
    detail: 'ARCA/AFIP frecuentemente presenta caídas los viernes a la tarde — no dejar trámites para ese momento.',
  },
  {
    id: 'know-ml',
    label: 'Responder <2h en ML',
    type: 'knowledge',
    group: 'shared',
    connections: 2,
    detail: 'Las preguntas en MercadoLibre deben responderse en menos de 2h para mantener el nivel de servicio y reputación.',
  },
  {
    id: 'know-postear',
    label: 'Postear martes 18h',
    type: 'knowledge',
    group: 'marketing',
    connections: 1,
    detail: 'El mejor horario de publicación para la audiencia de Nova Store es los martes a las 18h.',
  },
  {
    id: 'know-oca',
    label: 'Código OCA: ECOM2026',
    type: 'knowledge',
    group: 'ops',
    connections: 1,
    detail: 'Código de cliente OCA para envíos ecommerce: ECOM2026.',
  },
]

// ─── Graph links ──────────────────────────────────────────────────────────────

const LINKS: GraphLink[] = [
  // ── Person ↔ Person ────────────────────────────────────────────────────────
  { source: 'ops',       target: 'ceo',       type: 'reports_to' },
  { source: 'finanzas',  target: 'ceo',       type: 'reports_to' },
  { source: 'marketing', target: 'ceo',       type: 'reports_to' },
  { source: 'soporte',   target: 'ceo',       type: 'reports_to' },
  { source: 'ops',       target: 'soporte',   type: 'works_with' },
  { source: 'ops',       target: 'finanzas',  type: 'works_with' },
  { source: 'marketing', target: 'soporte',   type: 'works_with' },

  // ── CEO → Tools ────────────────────────────────────────────────────────────
  { source: 'ceo', target: 'google-sheets',   type: 'uses_tool' },
  { source: 'ceo', target: 'whatsapp',         type: 'uses_tool' },
  { source: 'ceo', target: 'gmail',            type: 'uses_tool' },
  { source: 'ceo', target: 'tienda-nube',      type: 'uses_tool' },
  { source: 'ceo', target: 'mercadolibre',     type: 'uses_tool' },
  { source: 'ceo', target: 'google-meet',      type: 'uses_tool' },

  // ── Ops → Tools ────────────────────────────────────────────────────────────
  { source: 'ops', target: 'google-sheets',   type: 'uses_tool' },
  { source: 'ops', target: 'whatsapp',         type: 'uses_tool' },
  { source: 'ops', target: 'gmail',            type: 'uses_tool' },
  { source: 'ops', target: 'tienda-nube',      type: 'uses_tool' },
  { source: 'ops', target: 'mercadolibre',     type: 'uses_tool' },
  { source: 'ops', target: 'correo-argentino', type: 'uses_tool' },
  { source: 'ops', target: 'oca',              type: 'uses_tool' },

  // ── Finanzas → Tools ───────────────────────────────────────────────────────
  { source: 'finanzas', target: 'google-sheets',  type: 'uses_tool' },
  { source: 'finanzas', target: 'whatsapp',        type: 'uses_tool' },
  { source: 'finanzas', target: 'gmail',           type: 'uses_tool' },
  { source: 'finanzas', target: 'arca-afip',       type: 'uses_tool' },
  { source: 'finanzas', target: 'mercadopago',     type: 'uses_tool' },
  { source: 'finanzas', target: 'excel',           type: 'uses_tool' },
  { source: 'finanzas', target: 'banco-galicia',   type: 'uses_tool' },

  // ── Marketing → Tools ──────────────────────────────────────────────────────
  { source: 'marketing', target: 'instagram',       type: 'uses_tool' },
  { source: 'marketing', target: 'canva',            type: 'uses_tool' },
  { source: 'marketing', target: 'mailchimp',        type: 'uses_tool' },
  { source: 'marketing', target: 'meta-ads',         type: 'uses_tool' },
  { source: 'marketing', target: 'google-analytics', type: 'uses_tool' },
  { source: 'marketing', target: 'whatsapp',         type: 'uses_tool' },

  // ── Soporte → Tools ────────────────────────────────────────────────────────
  { source: 'soporte', target: 'whatsapp-business', type: 'uses_tool' },
  { source: 'soporte', target: 'tienda-nube',       type: 'uses_tool' },
  { source: 'soporte', target: 'mercadolibre',      type: 'uses_tool' },
  { source: 'soporte', target: 'whatsapp',          type: 'uses_tool' },

  // ── Person → Decision ──────────────────────────────────────────────────────
  { source: 'marketing', target: 'dec-descuentos', type: 'makes_decision' },
  { source: 'ceo',       target: 'dec-descuentos', type: 'makes_decision' },
  { source: 'finanzas',  target: 'dec-compras',    type: 'makes_decision' },
  { source: 'ceo',       target: 'dec-compras',    type: 'makes_decision' },
  { source: 'ops',       target: 'dec-compras',    type: 'makes_decision' },
  { source: 'marketing', target: 'dec-pauta',      type: 'makes_decision' },
  { source: 'ceo',       target: 'dec-pauta',      type: 'makes_decision' },
  { source: 'ops',       target: 'dec-stock',      type: 'makes_decision' },
  { source: 'ceo',       target: 'dec-stock',      type: 'makes_decision' },
  { source: 'soporte',   target: 'dec-reclamo',    type: 'makes_decision' },
  { source: 'ceo',       target: 'dec-reclamo',    type: 'makes_decision' },
  { source: 'ops',       target: 'dec-logistica',  type: 'makes_decision' },

  // ── Person → Knowledge ─────────────────────────────────────────────────────
  { source: 'ceo',       target: 'know-margen',    type: 'shares_knowledge' },
  { source: 'finanzas',  target: 'know-margen',    type: 'shares_knowledge' },
  { source: 'ceo',       target: 'know-proveedor', type: 'shares_knowledge' },
  { source: 'ops',       target: 'know-proveedor', type: 'shares_knowledge' },
  { source: 'ceo',       target: 'know-contador',  type: 'shares_knowledge' },
  { source: 'finanzas',  target: 'know-contador',  type: 'shares_knowledge' },
  { source: 'ops',       target: 'know-despacho',  type: 'shares_knowledge' },
  { source: 'finanzas',  target: 'know-arca',      type: 'shares_knowledge' },
  { source: 'ops',       target: 'know-ml',        type: 'shares_knowledge' },
  { source: 'soporte',   target: 'know-ml',        type: 'shares_knowledge' },
  { source: 'marketing', target: 'know-postear',   type: 'shares_knowledge' },
  { source: 'ops',       target: 'know-oca',       type: 'shares_knowledge' },

  // ── Document → Owner (person) ──────────────────────────────────────────────
  { source: 'doc-ceo', target: 'ceo',       type: 'documents' },
  { source: 'doc-ops', target: 'ops',       type: 'documents' },
  { source: 'doc-fin', target: 'finanzas',  type: 'documents' },
  { source: 'doc-mkt', target: 'marketing', type: 'documents' },
  { source: 'doc-sup', target: 'soporte',   type: 'documents' },

  // ── Document → Tools ──────────────────────────────────────────────────────
  { source: 'doc-ceo', target: 'google-sheets',    type: 'documents' },
  { source: 'doc-ceo', target: 'whatsapp',          type: 'documents' },
  { source: 'doc-ceo', target: 'tienda-nube',       type: 'documents' },
  { source: 'doc-ceo', target: 'mercadolibre',      type: 'documents' },

  { source: 'doc-ops', target: 'google-sheets',    type: 'documents' },
  { source: 'doc-ops', target: 'tienda-nube',       type: 'documents' },
  { source: 'doc-ops', target: 'mercadolibre',      type: 'documents' },
  { source: 'doc-ops', target: 'oca',               type: 'documents' },
  { source: 'doc-ops', target: 'correo-argentino',  type: 'documents' },

  { source: 'doc-fin', target: 'arca-afip',         type: 'documents' },
  { source: 'doc-fin', target: 'excel',             type: 'documents' },
  { source: 'doc-fin', target: 'banco-galicia',     type: 'documents' },
  { source: 'doc-fin', target: 'mercadopago',       type: 'documents' },

  { source: 'doc-mkt', target: 'instagram',         type: 'documents' },
  { source: 'doc-mkt', target: 'canva',             type: 'documents' },
  { source: 'doc-mkt', target: 'mailchimp',         type: 'documents' },
  { source: 'doc-mkt', target: 'meta-ads',          type: 'documents' },
  { source: 'doc-mkt', target: 'google-analytics',  type: 'documents' },

  { source: 'doc-sup', target: 'whatsapp-business', type: 'documents' },
  { source: 'doc-sup', target: 'mercadolibre',      type: 'documents' },
  { source: 'doc-sup', target: 'tienda-nube',       type: 'documents' },

  // ── Document → Decisions ───────────────────────────────────────────────────
  { source: 'doc-ceo', target: 'dec-descuentos', type: 'documents' },
  { source: 'doc-ceo', target: 'dec-compras',    type: 'documents' },
  { source: 'doc-ops', target: 'dec-logistica',  type: 'documents' },
  { source: 'doc-ops', target: 'dec-stock',      type: 'documents' },
  { source: 'doc-fin', target: 'dec-compras',    type: 'documents' },
  { source: 'doc-mkt', target: 'dec-pauta',      type: 'documents' },
  { source: 'doc-sup', target: 'dec-reclamo',    type: 'documents' },

  // ── Document → Knowledge ───────────────────────────────────────────────────
  { source: 'doc-ceo', target: 'know-margen',    type: 'documents' },
  { source: 'doc-ceo', target: 'know-proveedor', type: 'documents' },
  { source: 'doc-ops', target: 'know-despacho',  type: 'documents' },
  { source: 'doc-ops', target: 'know-oca',       type: 'documents' },
  { source: 'doc-fin', target: 'know-contador',  type: 'documents' },
  { source: 'doc-fin', target: 'know-arca',      type: 'documents' },
  { source: 'doc-mkt', target: 'know-postear',   type: 'documents' },
  { source: 'doc-sup', target: 'know-ml',        type: 'documents' },
]

export const BRAIN_GRAPH_DATA: BrainGraphData = {
  nodes: NODES,
  links: LINKS,
}

// ─── Dynamic document node builder ───────────────────────────────────────────

const RANDOM_TOOL_POOL = [
  'google-sheets', 'whatsapp', 'gmail', 'tienda-nube', 'mercadolibre',
  'instagram', 'canva', 'mercadopago', 'google-meet', 'google-analytics',
]

export function buildUploadedDocNode(
  docId: string,
  filename: string,
  ownerPersonId: string = 'ceo',
): { node: GraphNode; links: GraphLink[] } {
  const nodeId = `doc-upload-${docId}`
  const label  = filename.replace(/\.(docx?|pdf|txt)$/i, '').slice(0, 20)

  // Pick 2 random tools from the pool
  const shuffled = [...RANDOM_TOOL_POOL].sort(() => Math.random() - 0.5)
  const linkedTools = shuffled.slice(0, 2)

  const links: GraphLink[] = [
    { source: nodeId, target: ownerPersonId, type: 'documents' },
    ...linkedTools.map(t => ({ source: nodeId, target: t, type: 'documents' as const })),
  ]

  const node: GraphNode = {
    id:          nodeId,
    label,
    type:        'document',
    group:       ownerPersonId,
    connections: links.length,
    detail:      `Documento subido: ${filename}`,
  }

  return { node, links }
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

export function getNodeConnections(
  nodeId: string,
  nodes: GraphNode[],
  links: GraphLink[],
): { node: GraphNode; linkType: GraphLink['type'] }[] {
  const map = new Map(nodes.map(n => [n.id, n]))
  const result: { node: GraphNode; linkType: GraphLink['type'] }[] = []

  for (const link of links) {
    if (link.source === nodeId) {
      const t = map.get(link.target as string)
      if (t) result.push({ node: t, linkType: link.type })
    } else if (link.target === nodeId) {
      const s = map.get(link.source as string)
      if (s) result.push({ node: s, linkType: link.type })
    }
  }

  return result
}
