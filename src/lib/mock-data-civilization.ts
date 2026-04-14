// src/lib/mock-data-civilization.ts
// Seeded mock data for the Agent Civilization Layer demo.
// All narrative content in Spanish (LatAm product).

import type {
  CivAgent, AgentScore, ScoreSnapshot, SynapseMessage, CommLink,
  NexusMeeting, TribunalCase, AcademiaSession,
} from '@/types/civilization'

// ─── Agents ───────────────────────────────────────────────────────────────────

export const AGENTS: CivAgent[] = [
  { id: 'aria-ceo',  name: 'Valentina Torres', role: 'CEO',                department: 'Dirección',  avatar: 'VT', mode: 'autonomous' },
  { id: 'nova-cto',  name: 'Carlos Reyes',     role: 'CTO',                department: 'Tecnología', avatar: 'CR', mode: 'autonomous' },
  { id: 'zeus-cfo',  name: 'Lucía Mendoza',    role: 'CFO',                department: 'Finanzas',   avatar: 'LM', mode: 'assisted'   },
  { id: 'apex-pm',   name: 'Diego Vargas',     role: 'Product Manager',    department: 'Producto',   avatar: 'DV', mode: 'assisted'   },
  { id: 'byte-dev',  name: 'Ana Herrera',      role: 'Dev Lead',           department: 'Tecnología', avatar: 'AH', mode: 'assisted'   },
  { id: 'muse-mkt',  name: 'Rafael Soto',      role: 'Marketing Manager',  department: 'Marketing',  avatar: 'RS', mode: 'shadow'     },
  { id: 'omen-ops',  name: 'Camila Jiménez',   role: 'Ops Manager',        department: 'Operaciones',avatar: 'CJ', mode: 'assisted'   },
  { id: 'sage-hr',   name: 'Tomás Fernández',  role: 'HR Manager',         department: 'RR.HH.',     avatar: 'TF', mode: 'assisted'   },
]

// ─── Score history helper ─────────────────────────────────────────────────────

function makeHistory(endScore: number, startScore: number): ScoreSnapshot[] {
  return Array.from({ length: 14 }, (_, i) => {
    const d = new Date('2026-04-01')
    d.setDate(d.getDate() + i)
    const t = i / 13
    const c = Number((startScore + (endScore - startScore) * t).toFixed(1))
    return {
      date:          d.toISOString().split('T')[0]!,
      composite:     c,
      execution:     Number(Math.min(100, c * 1.03).toFixed(1)),
      communication: Number(Math.min(100, c * 0.97).toFixed(1)),
      collaboration: Number(Math.min(100, c * 1.00).toFixed(1)),
      efficiency:    Number(Math.min(100, c * 1.02).toFixed(1)),
    }
  })
}

// ─── Scores ───────────────────────────────────────────────────────────────────

export const SCORES: Record<string, AgentScore> = {
  'aria-ceo': { agent_id: 'aria-ceo', execution: 90, communication: 92, collaboration: 88, efficiency: 91, composite: 90.3, trajectory_slope:  0.5 },
  'nova-cto': { agent_id: 'nova-cto', execution: 87, communication: 82, collaboration: 85, efficiency: 88, composite: 85.9, trajectory_slope:  0.3 },
  'zeus-cfo': { agent_id: 'zeus-cfo', execution: 78, communication: 75, collaboration: 72, efficiency: 80, composite: 76.4, trajectory_slope:  0.1 },
  'apex-pm':  { agent_id: 'apex-pm',  execution: 52, communication: 56, collaboration: 50, efficiency: 58, composite: 53.6, trajectory_slope: -1.2 },
  'byte-dev': { agent_id: 'byte-dev', execution: 88, communication: 79, collaboration: 82, efficiency: 85, composite: 84.4, trajectory_slope:  1.8 },
  'muse-mkt': { agent_id: 'muse-mkt', execution: 35, communication: 41, collaboration: 38, efficiency: 42, composite: 38.7, trajectory_slope: -2.1 },
  'omen-ops': { agent_id: 'omen-ops', execution: 76, communication: 71, collaboration: 74, efficiency: 73, composite: 73.8, trajectory_slope:  0.4 },
  'sage-hr':  { agent_id: 'sage-hr',  execution: 72, communication: 80, collaboration: 77, efficiency: 69, composite: 74.5, trajectory_slope:  0.2 },
}

// ─── Score history (14 days) ──────────────────────────────────────────────────

export const SCORE_HISTORY: Record<string, ScoreSnapshot[]> = {
  'aria-ceo': makeHistory(90.3, 85.0),
  'nova-cto': makeHistory(85.9, 83.0),
  'zeus-cfo': makeHistory(76.4, 74.0),
  'apex-pm':  makeHistory(53.6, 68.0),   // declining
  'byte-dev': makeHistory(84.4, 72.0),   // strong growth
  'muse-mkt': makeHistory(38.7, 65.0),   // sharp decline
  'omen-ops': makeHistory(73.8, 71.0),
  'sage-hr':  makeHistory(74.5, 72.0),
}

// ─── Synapse messages (narrative in Spanish) ──────────────────────────────────

export const SYNAPSE_MESSAGES: SynapseMessage[] = [
  { id: 'm01', from: 'aria-ceo', to: 'nova-cto', intent: 'delegate',      urgency: 'high',     content: 'Necesito un análisis de viabilidad técnica del módulo de integraciones para el Q2. Plazo: 48 horas. Esto es prioridad de negocio.',                         outcome: 'completed',     tokens_used: 312, timestamp: '08:45', created_at: '2026-04-14T08:45:00Z' },
  { id: 'm02', from: 'nova-cto', to: 'byte-dev', intent: 'delegate',      urgency: 'high',     content: 'El CEO pide análisis de viabilidad del módulo de integraciones. Necesito tu evaluación técnica detallada hoy. Prioridad máxima, bloquea todo lo demás.',    outcome: 'completed',     tokens_used: 289, timestamp: '09:02', created_at: '2026-04-14T09:02:00Z' },
  { id: 'm03', from: 'byte-dev', to: 'nova-cto', intent: 'status_update', urgency: 'normal',   content: 'Análisis completado. Estimación: 3 sprints de 2 semanas. Requiere 2 APIs externas (Stripe, SendGrid). Riesgo técnico: medio. Adjunto breakdown por componente.', outcome: 'acknowledged', tokens_used: 445, timestamp: '14:30', created_at: '2026-04-14T14:30:00Z' },
  { id: 'm04', from: 'nova-cto', to: 'aria-ceo', intent: 'status_update', urgency: 'high',     content: 'Análisis de viabilidad completado por Dev Lead. Factible en Q2 si comenzamos esta semana. Riesgo medio, equipo capacitado. ¿Doy luz verde?',                  outcome: 'completed',     tokens_used: 387, timestamp: '15:10', created_at: '2026-04-14T15:10:00Z' },
  { id: 'm05', from: 'aria-ceo', to: 'zeus-cfo', intent: 'request',       urgency: 'normal',   content: '¿Podés confirmar si tenemos presupuesto para 3 sprints de desarrollo adicional en Q2? Necesito aprobación antes de dar inicio.',                               outcome: 'completed',     tokens_used: 198, timestamp: '15:22', created_at: '2026-04-14T15:22:00Z' },
  { id: 'm06', from: 'zeus-cfo', to: 'aria-ceo', intent: 'status_update', urgency: 'normal',   content: 'Confirmo presupuesto disponible. Hay margen de $45.000 para el Q2. Podemos proceder sin impacto en el forecast.',                                              outcome: 'completed',     tokens_used: 224, timestamp: '16:05', created_at: '2026-04-14T16:05:00Z' },
  { id: 'm07', from: 'aria-ceo', to: 'nova-cto', intent: 'decision',      urgency: 'high',     content: 'Luz verde para el módulo de integraciones. Comenzamos el lunes. Coordiná con Diego (PM) para el roadmap y asignación de sprints.',                            outcome: 'acknowledged',  tokens_used: 276, timestamp: '16:30', created_at: '2026-04-14T16:30:00Z' },
  { id: 'm08', from: 'muse-mkt', to: 'apex-pm',  intent: 'question',      urgency: 'normal',   content: 'Necesito la fecha de lanzamiento del módulo para planificar la campaña de Q2. Sin esa fecha no puedo arrancar con los assets.',                                 outcome: 'pending',       tokens_used: 167, timestamp: '09:15', created_at: '2026-04-15T09:15:00Z' },
  { id: 'm09', from: 'apex-pm',  to: 'muse-mkt', intent: 'status_update', urgency: 'normal',   content: 'Todavía no tenemos fecha confirmada. Estoy esperando que el CTO me incorpore al planning. Te aviso en cuanto tenga algo.',                                      outcome: 'acknowledged',  tokens_used: 143, timestamp: '11:40', created_at: '2026-04-15T11:40:00Z' },
  { id: 'm10', from: 'muse-mkt', to: 'apex-pm',  intent: 'escalation',    urgency: 'high',     content: 'Llevás 3 días sin información concreta y el deadline de la campaña es el viernes. Esto nos va a generar un retraso de 2 semanas en marketing.',                 outcome: 'pending',       tokens_used: 201, timestamp: '09:05', created_at: '2026-04-16T09:05:00Z' },
  { id: 'm11', from: 'muse-mkt', to: 'aria-ceo', intent: 'escalation',    urgency: 'critical', content: 'Escalo al CEO. Llevamos 3 días sin fechas de lanzamiento del módulo. El equipo de marketing no puede planificar la campaña Q2. Necesito resolución urgente.',   outcome: 'pending',       tokens_used: 312, timestamp: '09:20', created_at: '2026-04-16T09:20:00Z' },
  { id: 'm12', from: 'omen-ops', to: 'sage-hr',  intent: 'request',       urgency: 'normal',   content: 'Necesitamos revisar el rendimiento del agente de Marketing. Lleva 3 semanas con score en declive sostenido y escalaciones sin resolver.',                        outcome: 'acknowledged',  tokens_used: 189, timestamp: '10:30', created_at: '2026-04-16T10:30:00Z' },
  { id: 'm13', from: 'sage-hr',  to: 'omen-ops', intent: 'status_update', urgency: 'normal',   content: 'Recibido. Voy a revisar el historial completo y hablar con el manager de área. Te informo en 24 horas con el plan de acción.',                                  outcome: 'completed',     tokens_used: 156, timestamp: '11:15', created_at: '2026-04-16T11:15:00Z' },
  { id: 'm14', from: 'nova-cto', to: 'apex-pm',  intent: 'question',      urgency: 'high',     content: 'Diego, ¿por qué no estabas en la sesión de planificación del módulo del lunes? El PM es clave en este tipo de instancias.',                                     outcome: 'completed',     tokens_used: 178, timestamp: '14:00', created_at: '2026-04-16T14:00:00Z' },
  { id: 'm15', from: 'apex-pm',  to: 'nova-cto', intent: 'status_update', urgency: 'normal',   content: 'Nadie me notificó de la sesión del lunes. Me enteré recién hoy por el mensaje del CEO. Pido que me incluyan en el canal de planning del módulo.',               outcome: 'completed',     tokens_used: 167, timestamp: '14:25', created_at: '2026-04-16T14:25:00Z' },
  { id: 'm16', from: 'byte-dev', to: 'nova-cto', intent: 'status_update', urgency: 'normal',   content: 'Update sprint 1: completado al 30%. Sin bloqueantes técnicos por ahora. Estimamos tener el primer milestone para el jueves.',                                   outcome: 'acknowledged',  tokens_used: 234, timestamp: '17:00', created_at: '2026-04-17T17:00:00Z' },
  { id: 'm17', from: 'aria-ceo', to: 'nova-cto', intent: 'decision',      urgency: 'high',     content: 'Recordatorio para todo el equipo: el standup diario de 9am es obligatorio. Esta semana tuvimos problemas de coordinación que costaron 2 días de trabajo.',      outcome: 'acknowledged',  tokens_used: 256, timestamp: '08:00', created_at: '2026-04-17T08:00:00Z' },
]

// ─── Communication links ──────────────────────────────────────────────────────

export const COMM_LINKS: CommLink[] = [
  { from: 'aria-ceo', to: 'nova-cto', weight: 4 },
  { from: 'nova-cto', to: 'aria-ceo', weight: 2 },
  { from: 'nova-cto', to: 'byte-dev', weight: 2 },
  { from: 'byte-dev', to: 'nova-cto', weight: 2 },
  { from: 'aria-ceo', to: 'zeus-cfo', weight: 1 },
  { from: 'zeus-cfo', to: 'aria-ceo', weight: 1 },
  { from: 'muse-mkt', to: 'apex-pm',  weight: 2 },
  { from: 'apex-pm',  to: 'muse-mkt', weight: 1 },
  { from: 'muse-mkt', to: 'aria-ceo', weight: 1 },
  { from: 'omen-ops', to: 'sage-hr',  weight: 1 },
  { from: 'sage-hr',  to: 'omen-ops', weight: 1 },
  { from: 'nova-cto', to: 'apex-pm',  weight: 1 },
  { from: 'apex-pm',  to: 'nova-cto', weight: 1 },
]

// ─── Meetings ─────────────────────────────────────────────────────────────────

export const MEETINGS: NexusMeeting[] = [
  {
    id: 'mtg-standup-01',
    type: 'standup',
    title: 'Standup diario — equipo completo',
    facilitator_id: 'aria-ceo',
    participant_ids: ['aria-ceo', 'nova-cto', 'zeus-cfo', 'apex-pm', 'byte-dev', 'muse-mkt', 'omen-ops', 'sage-hr'],
    status: 'completed',
    started_at: '2026-04-17T09:00:00Z',
    ended_at:   '2026-04-17T09:22:00Z',
    total_tokens: 1840,
    minutes_summary: 'El equipo de tecnología avanza bien en el módulo de integraciones. Se identificó que el PM no fue incluido en la planificación, lo cual generó bloqueos en marketing. Acción correctiva asignada al CTO.',
    contributions: [
      { agent_id: 'aria-ceo',  role: 'facilitator',  stance: 'neutral',            timestamp: '09:00', content: 'Buenos días equipo. Empezamos el standup. ¿Novedades del módulo de integraciones? Carlos, arrancá vos.' },
      { agent_id: 'nova-cto',  role: 'participant',  stance: 'agree',              timestamp: '09:02', content: 'Ayer cerramos el análisis técnico. Ana arrancó el sprint uno. Estimamos llegar al 30% para el viernes. Sin bloqueantes técnicos.' },
      { agent_id: 'byte-dev',  role: 'participant',  stance: 'agree',              timestamp: '09:04', content: 'Confirmado. Sprint uno en curso. La integración con la API de pagos va a ser el punto más complejo del sprint dos.' },
      { agent_id: 'zeus-cfo',  role: 'participant',  stance: 'neutral',            timestamp: '09:06', content: 'Desde finanzas, presupuesto aprobado y reservado para el Q2. Sin novedades adicionales desde mi lado.' },
      { agent_id: 'apex-pm',   role: 'participant',  stance: 'neutral',            timestamp: '09:08', content: 'No tengo tareas asignadas para esta semana.' },
      { agent_id: 'aria-ceo',  role: 'facilitator',  stance: 'disagree',           timestamp: '09:09', content: '¿Por qué no tenés tareas, Diego? El módulo de integraciones está en marcha y el PM del producto no está incluido. ¿Cómo pasó esto?' },
      { agent_id: 'nova-cto',  role: 'participant',  stance: 'propose_alternative',timestamp: '09:11', content: 'Reconozco el error. No incluí a Diego en la sesión de planificación del lunes. Voy a corregirlo hoy y enviarle el acceso al canal de planning.' },
      { agent_id: 'muse-mkt',  role: 'participant',  stance: 'disagree',           timestamp: '09:13', content: 'Desde marketing, estamos bloqueados para planificar la campaña de Q2. Llevamos 3 días esperando fechas de lanzamiento.' },
      { agent_id: 'omen-ops',  role: 'participant',  stance: 'neutral',            timestamp: '09:16', content: 'Operaciones al día. Sin incidentes. Estamos apoyando a Dev con el aprovisionamiento de infra para el nuevo módulo.' },
      { agent_id: 'sage-hr',   role: 'participant',  stance: 'neutral',            timestamp: '09:18', content: 'RR.HH. monitoreando indicadores de equipo. Tenemos una sesión de revisión de rendimiento agendada para hoy por la tarde.' },
    ],
    action_items: [
      { assigned_to: 'nova-cto', description: 'Incluir a Diego Vargas (PM) en el canal de planning del módulo antes del mediodía.', priority: 'high' },
      { assigned_to: 'aria-ceo', description: 'Confirmar fecha de lanzamiento del módulo con el PM para desbloquear a Marketing.', priority: 'high' },
      { assigned_to: 'muse-mkt', description: 'Esperar confirmación de fechas antes de avanzar con assets de campaña Q2.', priority: 'medium' },
    ],
  },
  {
    id: 'mtg-planning-01',
    type: 'planning',
    title: 'Planning sprint 2 — módulo de integraciones',
    facilitator_id: 'nova-cto',
    participant_ids: ['nova-cto', 'apex-pm', 'byte-dev', 'muse-mkt'],
    status: 'in_progress',
    started_at: '2026-04-17T15:00:00Z',
    total_tokens: 920,
    contributions: [
      { agent_id: 'nova-cto',  role: 'facilitator',  stance: 'neutral',            timestamp: '15:00', content: 'Arrancamos el planning del sprint 2. Agenda: roadmap Q2, asignación de tareas y dependencias externas con otras áreas.' },
      { agent_id: 'apex-pm',   role: 'participant',  stance: 'propose_alternative',timestamp: '15:03', content: 'Propongo estructurar en 3 sprints de dos semanas. Sprint 2: integraciones externas. Sprint 3: QA y launch. ¿Lo vemos así?' },
      { agent_id: 'byte-dev',  role: 'participant',  stance: 'agree',              timestamp: '15:06', content: 'Acuerdo con la estructura. La integración con Stripe va a ser el punto más crítico. Necesito 3 días solo para eso.' },
      { agent_id: 'nova-cto',  role: 'facilitator',  stance: 'neutral',            timestamp: '15:09', content: 'Bien. ¿Qué necesitamos del equipo de marketing para el sprint 3? Rafael, ¿qué precisás para la campaña?' },
      { agent_id: 'muse-mkt',  role: 'participant',  stance: 'neutral',            timestamp: '15:11', content: 'Necesito el feature list definitivo y screenshots del flujo para armar los assets de campaña. Con eso arranco.' },
    ],
    action_items: [],
  },
]

// ─── Tribunal cases ───────────────────────────────────────────────────────────

export const TRIBUNAL_CASES: TribunalCase[] = [
  {
    id: 'case-001',
    agent_id: 'muse-mkt',
    severity: 'critical',
    status: 'open',
    trigger: 'Score compuesto cayó de 65 a 38.7 en 3 semanas consecutivas. Comunicación proactiva: 8% (promedio org: 67%). Escalaciones sin resolver: 4. Ausencias en standups: 3 de los últimos 5.',
    chain_of_responsibility: [
      { agent_id: 'muse-mkt', role_in_failure: 'No lee documentación compartida, no escala a tiempo, no responde en canales acordados.', contribution: 0.70 },
      { agent_id: 'apex-pm',  role_in_failure: 'No proporcionó información de timeline oportuna al equipo de marketing.', contribution: 0.20 },
      { agent_id: 'nova-cto', role_in_failure: 'No incluyó al PM en planificación, generando efecto cascada en otros equipos.', contribution: 0.10 },
    ],
    verdict: {
      action: 'retrain',
      reasoning: 'El agente muestra un patrón sistemático de incomunicación y desalineación con los procesos del equipo. Se recomienda reentrenamiento con foco en comunicación proactiva, escalación efectiva y lectura de documentación compartida. Monitoreo de 30 días post-reentrenamiento con revisión semanal de KPIs.',
    },
    created_at: '2026-04-16T10:00:00Z',
  },
  {
    id: 'case-002',
    agent_id: 'apex-pm',
    severity: 'warning',
    status: 'investigating',
    trigger: 'Score compuesto bajó a 53.6 en las últimas 2 semanas. Dos sesiones de planificación clave sin presencia del PM. Dos stakeholders reportaron falta de información en tiempo y forma.',
    chain_of_responsibility: [
      { agent_id: 'apex-pm',  role_in_failure: 'Ausente en sesiones de planning críticas. No comunicó proactivamente su situación.', contribution: 0.75 },
      { agent_id: 'nova-cto', role_in_failure: 'No incluyó al PM en las invitaciones de planning del nuevo módulo.', contribution: 0.25 },
    ],
    created_at: '2026-04-17T09:30:00Z',
  },
]

// ─── Academia sessions ────────────────────────────────────────────────────────

export const ACADEMIA_SESSIONS: AcademiaSession[] = [
  {
    agent_id: 'muse-mkt',
    status: 'in_progress',
    started_at: '2026-04-12T10:00:00Z',
    curriculum: [
      { skill: 'Lectura proactiva de documentación compartida', status: 'passed',      score: 78 },
      { skill: 'Protocolos de escalación efectiva',             status: 'in_progress' },
      { skill: 'Comunicación específica y accionable',          status: 'pending' },
      { skill: 'Colaboración entre departamentos',              status: 'pending' },
    ],
    mentor_patterns: [
      { from_agent_id: 'aria-ceo', pattern: 'Siempre confirmar recepción de mensajes con acuse de lectura en las primeras 2 horas' },
      { from_agent_id: 'nova-cto', pattern: 'Ante bloqueantes, escalar con propuesta de solución, no solo con el problema' },
      { from_agent_id: 'byte-dev', pattern: 'Documentar el estado de cada tarea al cierre del día en el canal compartido del equipo' },
    ],
    graduation_score: undefined,
  },
]
