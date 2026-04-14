// src/lib/integrations-registry.ts
// Master catalog of all integrations ORGANA supports

export type IntegrationCategory =
  | 'communication'
  | 'productivity'
  | 'development'
  | 'analytics'
  | 'finance'
  | 'crm'
  | 'storage'
  | 'ai'
  | 'marketing'
  | 'hr'
  | 'operations'
  | 'security'

export type ConnectionStatus = 'connected' | 'available' | 'coming_soon'

export interface Integration {
  id: string
  name: string
  description: string
  long_description: string
  category: IntegrationCategory
  icon: string
  status: ConnectionStatus
  mcp_available: boolean
  mcp_url?: string
  capabilities: string[]
  typical_roles: string[]
  agent_value: string
  setup_complexity: 'one_click' | 'api_key' | 'oauth' | 'custom'
  priority_score?: number
  recommended_for?: string[]
  recommendation_reason?: string
}

export const INTEGRATIONS_REGISTRY: Integration[] = [
  // ── COMMUNICATION ────────────────────────────────────────────────────────────
  {
    id: 'slack',
    name: 'Slack',
    description: 'Mensajería y canales de equipo',
    long_description: 'Permite a los agentes enviar mensajes, leer canales, buscar conversaciones y crear canvases. Esencial para agentes que necesitan comunicarse con humanos o monitorear discusiones del equipo.',
    category: 'communication',
    icon: '💬',
    status: 'available',
    mcp_available: true,
    mcp_url: 'https://mcp.slack.com/mcp',
    capabilities: ['Enviar mensajes', 'Leer canales', 'Buscar conversaciones', 'Crear canvases', 'Leer threads'],
    typical_roles: ['CEO', 'CTO', 'Project Manager', 'HR Director', 'Operations Manager'],
    agent_value: 'Los agentes pueden reportar resultados, escalar problemas y participar en discusiones de equipo automáticamente.',
    setup_complexity: 'oauth',
  },
  {
    id: 'gmail',
    name: 'Gmail',
    description: 'Email corporativo y comunicación externa',
    long_description: 'Lectura, búsqueda y creación de borradores de email. Permite a los agentes manejar comunicación externa, responder consultas recurrentes y organizar bandejas de entrada.',
    category: 'communication',
    icon: '📧',
    status: 'connected',
    mcp_available: true,
    mcp_url: 'https://gmail.mcp.claude.com/mcp',
    capabilities: ['Leer emails', 'Crear borradores', 'Buscar mensajes', 'Leer threads', 'Listar labels'],
    typical_roles: ['CEO', 'CFO', 'HR Director', 'Marketing Lead', 'Operations Manager'],
    agent_value: 'Automatiza respuestas a emails recurrentes, organiza la bandeja y escala mensajes urgentes.',
    setup_complexity: 'oauth',
  },
  {
    id: 'google-calendar',
    name: 'Google Calendar',
    description: 'Gestión de agenda y reuniones',
    long_description: 'Crear eventos, buscar horarios disponibles, gestionar invitaciones y organizar la agenda del equipo. Los agentes pueden coordinar reuniones automáticamente.',
    category: 'communication',
    icon: '📅',
    status: 'connected',
    mcp_available: true,
    mcp_url: 'https://gcal.mcp.claude.com/mcp',
    capabilities: ['Crear eventos', 'Buscar disponibilidad', 'Listar eventos', 'Responder invitaciones', 'Encontrar horarios libres'],
    typical_roles: ['CEO', 'CTO', 'Project Manager', 'HR Director', 'Operations Manager'],
    agent_value: 'Los agentes coordinan reuniones, encuentran horarios óptimos y mantienen la agenda actualizada sin intervención humana.',
    setup_complexity: 'oauth',
  },
  {
    id: 'whatsapp',
    name: 'WhatsApp Business',
    description: 'Mensajería con clientes y equipo',
    long_description: 'Integración con WhatsApp Business API para comunicación directa con clientes. Esencial en LATAM donde WhatsApp es el canal principal de negocios.',
    category: 'communication',
    icon: '📱',
    status: 'coming_soon',
    mcp_available: false,
    capabilities: ['Enviar mensajes', 'Responder consultas', 'Enviar archivos', 'Templates de mensajes'],
    typical_roles: ['Marketing Lead', 'Operations Manager', 'HR Director'],
    agent_value: 'Automatiza la comunicación con clientes por el canal más usado en Latinoamérica.',
    setup_complexity: 'api_key',
  },
  {
    id: 'resend',
    name: 'Resend',
    description: 'Emails transaccionales y notificaciones',
    long_description: 'Envío de emails transaccionales de alta calidad — invitaciones, notificaciones, alertas. Ya integrado en ORGANA para comunicaciones del equipo.',
    category: 'communication',
    icon: '✉️',
    status: 'connected',
    mcp_available: false,
    capabilities: ['Enviar emails transaccionales', 'Templates HTML', 'Tracking de delivery'],
    typical_roles: ['Operations Manager', 'HR Director'],
    agent_value: 'Ya integrado — los agentes envían emails transaccionales (invitaciones, alertas, reportes) automáticamente.',
    setup_complexity: 'api_key',
  },

  // ── PRODUCTIVITY ─────────────────────────────────────────────────────────────
  {
    id: 'notion',
    name: 'Notion',
    description: 'Documentación, wikis y bases de datos',
    long_description: 'Búsqueda, creación y actualización de páginas y bases de datos en Notion. Los agentes pueden mantener documentación actualizada y buscar conocimiento organizacional.',
    category: 'productivity',
    icon: '📝',
    status: 'available',
    mcp_available: true,
    mcp_url: 'https://mcp.notion.com/mcp',
    capabilities: ['Buscar páginas', 'Crear páginas', 'Actualizar bases de datos', 'Duplicar contenido'],
    typical_roles: ['CEO', 'CTO', 'Project Manager', 'Marketing Lead', 'HR Director'],
    agent_value: 'Los agentes documentan decisiones, actualizan wikis y buscan en la base de conocimiento automáticamente.',
    setup_complexity: 'oauth',
  },
  {
    id: 'figma',
    name: 'Figma',
    description: 'Diseño, prototipos y design systems',
    long_description: 'Acceso a archivos de diseño, variables, componentes y capacidad de generar diagramas. Los agentes pueden extraer contexto de diseño para desarrollo.',
    category: 'productivity',
    icon: '🎨',
    status: 'available',
    mcp_available: true,
    mcp_url: 'https://mcp.figma.com/mcp',
    capabilities: ['Leer diseños', 'Extraer variables', 'Generar diagramas', 'Ver componentes'],
    typical_roles: ['CTO', 'Developer', 'Marketing Lead'],
    agent_value: 'Los agentes de desarrollo extraen specs de diseño directamente de Figma, reduciendo fricción en handoff.',
    setup_complexity: 'oauth',
  },

  // ── STORAGE ──────────────────────────────────────────────────────────────────
  {
    id: 'google-drive',
    name: 'Google Drive',
    description: 'Archivos, documentos y hojas de cálculo',
    long_description: 'Acceso a archivos compartidos, Google Docs, Sheets y Slides. Los agentes pueden leer reportes, buscar documentos y organizar archivos del equipo.',
    category: 'storage',
    icon: '📁',
    status: 'connected',
    mcp_available: true,
    mcp_url: 'https://drivemcp.googleapis.com/mcp/v1',
    capabilities: ['Buscar archivos', 'Leer documentos', 'Listar carpetas', 'Acceder a Sheets'],
    typical_roles: ['CEO', 'CFO', 'CTO', 'Project Manager', 'Marketing Lead', 'HR Director', 'Operations Manager'],
    agent_value: 'Acceso directo a toda la documentación de la empresa — reportes, presentaciones, hojas de cálculo.',
    setup_complexity: 'oauth',
  },

  // ── DEVELOPMENT ──────────────────────────────────────────────────────────────
  {
    id: 'linear',
    name: 'Linear',
    description: 'Gestión de proyectos y tickets de desarrollo',
    long_description: 'Crear, asignar y trackear issues, proyectos y ciclos. Ideal para agentes técnicos que necesitan gestionar el backlog y coordinar sprints.',
    category: 'development',
    icon: '🎯',
    status: 'available',
    mcp_available: true,
    mcp_url: 'https://mcp.linear.app/mcp',
    capabilities: ['Crear issues', 'Asignar tareas', 'Listar proyectos', 'Trackear ciclos', 'Buscar issues', 'Comentar'],
    typical_roles: ['CTO', 'Project Manager', 'Developer'],
    agent_value: 'Los agentes técnicos gestionan el backlog, crean tickets desde bugs detectados y actualizan el estado de tareas.',
    setup_complexity: 'oauth',
  },
  {
    id: 'github',
    name: 'GitHub',
    description: 'Repositorios, PRs y code review',
    long_description: 'Acceso a repositorios, pull requests, issues y code review. Los agentes de desarrollo pueden monitorear PRs, revisar código y crear issues automáticamente.',
    category: 'development',
    icon: '🐙',
    status: 'available',
    mcp_available: true,
    mcp_url: 'https://github.com/github/github-mcp-server',
    capabilities: ['Listar repos', 'Crear issues', 'Revisar PRs', 'Buscar código', 'Leer commits'],
    typical_roles: ['CTO', 'Developer'],
    agent_value: 'Automatiza code review, crea issues desde bugs y monitorea la salud de los repositorios.',
    setup_complexity: 'oauth',
  },
  {
    id: 'vercel',
    name: 'Vercel',
    description: 'Deployments, builds y logs de producción',
    long_description: 'Monitoreo de deployments, análisis de builds y acceso a logs. Los agentes pueden verificar el estado de producción y debuggear problemas antes de que afecten a usuarios.',
    category: 'development',
    icon: '▲',
    status: 'available',
    mcp_available: true,
    mcp_url: 'https://mcp.vercel.com/',
    capabilities: ['Listar proyectos', 'Ver deployments', 'Analizar builds', 'Debuggear errores'],
    typical_roles: ['CTO', 'Developer'],
    agent_value: 'Monitoreo automático de producción — los agentes detectan errores antes que los usuarios.',
    setup_complexity: 'oauth',
  },
  {
    id: 'sentry',
    name: 'Sentry',
    description: 'Monitoreo de errores y debugging',
    long_description: 'Detección, tracking y análisis de errores en producción. Los agentes pueden investigar bugs, buscar patrones de errores y priorizar fixes automáticamente.',
    category: 'development',
    icon: '🐛',
    status: 'available',
    mcp_available: true,
    mcp_url: 'https://mcp.sentry.dev/mcp',
    capabilities: ['Buscar issues', 'Ver detalles de errores', 'Analizar releases', 'Listar proyectos'],
    typical_roles: ['CTO', 'Developer'],
    agent_value: 'Los agentes detectan y priorizan errores en producción automáticamente, reduciendo tiempo de respuesta.',
    setup_complexity: 'oauth',
  },
  {
    id: 'supabase',
    name: 'Supabase',
    description: 'Base de datos, auth y almacenamiento',
    long_description: 'Gestión directa de la base de datos PostgreSQL, autenticación de usuarios y storage de archivos. Los agentes pueden consultar datos, crear tablas y gestionar usuarios.',
    category: 'development',
    icon: '⚡',
    status: 'available',
    mcp_available: true,
    mcp_url: 'https://mcp.supabase.com/mcp',
    capabilities: ['Consultar base de datos', 'Crear tablas', 'Gestionar auth', 'Subir archivos', 'Ejecutar queries'],
    typical_roles: ['CTO', 'Developer'],
    agent_value: 'Los agentes técnicos pueden consultar y modificar datos directamente, sin intermediarios.',
    setup_complexity: 'api_key',
  },
  {
    id: 'cloudflare',
    name: 'Cloudflare',
    description: 'CDN, Workers y servicios de red',
    long_description: 'Gestión de Workers, KV storage, DNS y servicios de red. Para agentes que necesitan administrar infraestructura edge y monitorear performance global.',
    category: 'operations',
    icon: '☁️',
    status: 'available',
    mcp_available: true,
    mcp_url: 'https://bindings.mcp.cloudflare.com/mcp',
    capabilities: ['Gestionar Workers', 'KV Storage', 'DNS management', 'Ver analytics'],
    typical_roles: ['CTO', 'Developer'],
    agent_value: 'Administración automática de infraestructura edge y caché.',
    setup_complexity: 'api_key',
  },

  // ── FINANCE ──────────────────────────────────────────────────────────────────
  {
    id: 'stripe',
    name: 'Stripe',
    description: 'Pagos, suscripciones y facturación',
    long_description: 'Gestión de clientes, productos, precios y pagos. Los agentes financieros pueden monitorear ingresos, crear facturas y gestionar suscripciones automáticamente.',
    category: 'finance',
    icon: '💳',
    status: 'available',
    mcp_available: true,
    mcp_url: 'https://mcp.stripe.com',
    capabilities: ['Crear clientes', 'Gestionar productos', 'Listar pagos', 'Crear facturas', 'Ver suscripciones'],
    typical_roles: ['CFO', 'CEO', 'Operations Manager'],
    agent_value: 'Automatiza la facturación, monitorea MRR/churn y alerta sobre pagos fallidos.',
    setup_complexity: 'api_key',
  },
  {
    id: 'quickbooks',
    name: 'QuickBooks',
    description: 'Contabilidad y reportes financieros',
    long_description: 'Acceso a datos contables, reportes de P&L, balances y flujo de caja. Ideal para agentes financieros que necesitan generar reportes periódicos sin intervención manual.',
    category: 'finance',
    icon: '📊',
    status: 'coming_soon',
    mcp_available: false,
    capabilities: ['Leer reportes', 'Ver transacciones', 'Generar P&L', 'Monitorear flujo de caja'],
    typical_roles: ['CFO', 'CEO'],
    agent_value: 'El agente financiero genera reportes automáticos y alerta sobre anomalías en el flujo de caja.',
    setup_complexity: 'oauth',
  },

  // ── CRM ──────────────────────────────────────────────────────────────────────
  {
    id: 'hubspot',
    name: 'HubSpot',
    description: 'CRM, ventas y marketing automation',
    long_description: 'Gestión de contactos, deals, campañas y pipeline de ventas. Los agentes pueden calificar leads, actualizar deals y disparar automatizaciones de marketing.',
    category: 'crm',
    icon: '🔶',
    status: 'coming_soon',
    mcp_available: false,
    capabilities: ['Gestionar contactos', 'Actualizar deals', 'Calificar leads', 'Buscar en CRM', 'Disparar workflows'],
    typical_roles: ['CEO', 'Marketing Lead', 'Operations Manager'],
    agent_value: 'Automatiza la calificación de leads, actualiza el pipeline y genera reportes de ventas sin intervención.',
    setup_complexity: 'oauth',
  },

  // ── MARKETING ────────────────────────────────────────────────────────────────
  {
    id: 'mailchimp',
    name: 'Mailchimp',
    description: 'Email marketing y campañas',
    long_description: 'Creación y gestión de campañas de email marketing, listas de suscriptores y automatizaciones. Los agentes de marketing pueden enviar newsletters y analizar métricas de performance.',
    category: 'marketing',
    icon: '🐒',
    status: 'available',
    mcp_available: true,
    mcp_url: 'https://ai-inc.mailchimp.com/claude/mcp/v2',
    capabilities: ['Crear campañas', 'Gestionar audiencias', 'Editar templates', 'Analizar resultados'],
    typical_roles: ['Marketing Lead'],
    agent_value: 'El agente de marketing crea, programa y optimiza campañas de email automáticamente.',
    setup_complexity: 'oauth',
  },
  {
    id: 'meta-business',
    name: 'Meta Business Suite',
    description: 'Instagram, Facebook Ads y analytics',
    long_description: 'Gestión de campañas en Meta (Facebook/Instagram), publicación de contenido y análisis de métricas publicitarias. Control completo del ecosistema de ads desde el agente.',
    category: 'marketing',
    icon: '📘',
    status: 'coming_soon',
    mcp_available: false,
    capabilities: ['Crear ads', 'Publicar contenido', 'Analizar métricas', 'Gestionar audiencias'],
    typical_roles: ['Marketing Lead'],
    agent_value: 'Automatiza la gestión de campañas en Meta y reporta ROI en tiempo real.',
    setup_complexity: 'oauth',
  },

  // ── HR ───────────────────────────────────────────────────────────────────────
  {
    id: 'bamboohr',
    name: 'BambooHR',
    description: 'Gestión de RRHH y nómina',
    long_description: 'Gestión de empleados, ausencias, onboarding y reportes de RRHH. Los agentes de HR pueden automatizar procesos de personas y generar reportes sin esfuerzo manual.',
    category: 'hr',
    icon: '🌿',
    status: 'coming_soon',
    mcp_available: false,
    capabilities: ['Gestionar empleados', 'Trackear ausencias', 'Generar reportes', 'Onboarding automático'],
    typical_roles: ['HR Director'],
    agent_value: 'Automatiza procesos de RRHH: onboarding de nuevos empleados, tracking de ausencias, reportes periódicos.',
    setup_complexity: 'api_key',
  },
]

// ── RECOMMENDATION ENGINE ────────────────────────────────────────────────────

export interface OrgContext {
  agents: { id: string; name: string; role: string; department: string; capabilities: string[] }[]
  sector: string
  size: 'startup' | 'smb' | 'midmarket' | 'enterprise'
  connected_integrations: string[]
}

export function computeRecommendations(registry: Integration[], context: OrgContext): Integration[] {
  return registry.map(integration => {
    let score = 0
    const recommended_for: string[] = []
    const reasons: string[] = []

    if (!context.connected_integrations.includes(integration.id)) {
      // Role matching — +20 per matching agent
      context.agents.forEach(agent => {
        const roleMatch = integration.typical_roles.some(
          tr =>
            agent.role.toLowerCase().includes(tr.toLowerCase()) ||
            tr.toLowerCase().includes(agent.role.split(' ')[0].toLowerCase())
        )
        if (roleMatch) {
          score += 20
          if (!recommended_for.includes(agent.name)) recommended_for.push(agent.name)
        }
      })

      // Capability gap analysis — +15 per agent with matching capabilities
      context.agents.forEach(agent => {
        const capabilityOverlap = agent.capabilities.some(cap =>
          integration.capabilities.some(
            ic =>
              cap.toLowerCase().includes(ic.toLowerCase().split(' ')[0]) ||
              ic.toLowerCase().includes(cap.toLowerCase().split(' ')[0])
          )
        )
        if (capabilityOverlap && !recommended_for.includes(agent.name)) {
          score += 15
          recommended_for.push(agent.name)
        }
      })

      // MCP available = +10
      if (integration.mcp_available && integration.status === 'available') score += 10

      // Sector relevance — +15
      const sectorBoosts: Record<string, string[]> = {
        marketing_agency: ['figma', 'meta-business', 'mailchimp', 'hubspot', 'slack', 'notion'],
        technology:       ['github', 'linear', 'vercel', 'sentry', 'supabase', 'slack'],
        finance:          ['quickbooks', 'stripe', 'slack', 'google-drive'],
        retail:           ['stripe', 'hubspot', 'whatsapp', 'mailchimp'],
      }
      if (sectorBoosts[context.sector]?.includes(integration.id)) {
        score += 15
        reasons.push(`Clave para ${context.sector.replace('_', ' ')}`)
      }
    }

    // Build recommendation reason string
    if (recommended_for.length > 0) {
      reasons.unshift(`Útil para: ${recommended_for.slice(0, 3).join(', ')}`)
    }
    if (integration.mcp_available && integration.status === 'available') {
      reasons.push('Integración MCP disponible')
    }

    return {
      ...integration,
      priority_score: score,
      recommended_for,
      recommendation_reason: reasons.join(' · '),
    }
  }).sort((a, b) => {
    if (a.status === 'connected' && b.status !== 'connected') return -1
    if (b.status === 'connected' && a.status !== 'connected') return 1
    if ((b.priority_score ?? 0) !== (a.priority_score ?? 0)) return (b.priority_score ?? 0) - (a.priority_score ?? 0)
    if (a.status === 'available' && b.status === 'coming_soon') return -1
    if (b.status === 'available' && a.status === 'coming_soon') return 1
    return 0
  })
}

export const CATEGORY_LABELS: Record<IntegrationCategory, string> = {
  communication: 'Comunicación',
  productivity:  'Productividad',
  development:   'Desarrollo',
  analytics:     'Analytics',
  finance:       'Finanzas',
  crm:           'CRM & Ventas',
  storage:       'Almacenamiento',
  ai:            'AI',
  marketing:     'Marketing',
  hr:            'RRHH',
  operations:    'Operaciones',
  security:      'Seguridad',
}
