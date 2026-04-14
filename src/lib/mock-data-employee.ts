// src/lib/mock-data-employee.ts
// Mock data for the employee "Mi Twin" dashboard
// Story: ops-twin is the star (KRS 91, all achievements), marketing-twin has gaps (KRS 72, early stage)

// ─── Level system ───────────────────────────────────────────────────────────

export interface TwinLevel {
  level: number
  name: string
  min: number
  max: number | null // null = max level
  motivation: string
}

export const TWIN_LEVELS: TwinLevel[] = [
  {
    level: 1,
    name: 'Novato',
    min: 0,
    max: 30,
    motivation: 'Tu twin está dando sus primeros pasos. ¡Seguí trabajando para que aprenda!',
  },
  {
    level: 2,
    name: 'Aprendiz',
    min: 31,
    max: 50,
    motivation: 'Ya va entendiendo tu día a día. Cada hora de observación cuenta.',
  },
  {
    level: 3,
    name: 'Competente',
    min: 51,
    max: 70,
    motivation: 'Tu twin ya puede ayudarte con varias tareas. ¡Buen trabajo!',
  },
  {
    level: 4,
    name: 'Experto',
    min: 71,
    max: 85,
    motivation: 'Impresionante — tu twin conoce casi toda tu operación.',
  },
  {
    level: 5,
    name: 'Maestro',
    min: 86,
    max: null,
    motivation: 'Tu twin es un experto en tu rol. El conocimiento de tu puesto está preservado.',
  },
]

export function getLevelForKRS(krs: number): TwinLevel {
  for (let i = TWIN_LEVELS.length - 1; i >= 0; i--) {
    if (krs >= TWIN_LEVELS[i].min) return TWIN_LEVELS[i]
  }
  return TWIN_LEVELS[0]
}

// ─── Achievements ─────────────────────────────────────────────────────────

export interface Achievement {
  id: string
  icon: string
  title: string
  description: string
  unlocked: boolean
  unlockedAt?: string
}

const ALL_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first-hour',
    icon: '🎬',
    title: 'Primera hora',
    description: 'Tu twin te observó por primera vez',
    unlocked: false,
  },
  {
    id: 'five-tasks',
    icon: '📋',
    title: 'Cinco tareas',
    description: 'Tu twin identificó 5 tareas de tu rol',
    unlocked: false,
  },
  {
    id: 'ten-tasks',
    icon: '🎯',
    title: 'Diez tareas',
    description: '10 tareas documentadas — ¡gran progreso!',
    unlocked: false,
  },
  {
    id: 'full-coverage',
    icon: '🏆',
    title: 'Cobertura total',
    description: 'Todas las tareas de tu rol están documentadas',
    unlocked: false,
  },
  {
    id: 'consistency-king',
    icon: '💎',
    title: 'Consistencia',
    description: 'Consistencia > 90% entre lo que dijiste y lo que se observó',
    unlocked: false,
  },
  {
    id: 'no-gaps',
    icon: '✨',
    title: 'Sin gaps',
    description: 'No hay conocimiento faltante en tu rol',
    unlocked: false,
  },
  {
    id: 'assisted-mode',
    icon: '⚡',
    title: 'Modo Asistido',
    description: 'Tu twin pasó a Assisted Mode — ¡ya puede ejecutar solo!',
    unlocked: false,
  },
  {
    id: 'marathon',
    icon: '🏃',
    title: 'Maratón',
    description: '8+ horas de observación acumuladas',
    unlocked: false,
  },
  {
    id: 'zero-errors',
    icon: '🎖️',
    title: 'Impecable',
    description: '0% error rate — tu twin no se equivoca',
    unlocked: false,
  },
  {
    id: 'autonomous',
    icon: '🤖',
    title: 'Autónomo',
    description: 'Tu twin alcanzó Autonomous Mode',
    unlocked: false,
  },
]

function makeAchievements(unlockedIds: string[]): Achievement[] {
  return ALL_ACHIEVEMENTS.map(a =>
    unlockedIds.includes(a.id)
      ? { ...a, unlocked: true, unlockedAt: '14 abr 2026' }
      : a
  )
}

// ─── Learning feed ────────────────────────────────────────────────────────

export interface LearningItem {
  time: string
  type: 'screen' | 'chat'
  icon: string
  message: string
  detail: string
}

// ─── Team comparison ──────────────────────────────────────────────────────

export interface TeamHighlight {
  metric: string
  myValue: number
  teamAvg: number
  unit: string
  badge: string
  isAbove: boolean
}

export interface TeamComparisonData {
  myAgent: {
    name: string
    role: string
    krs: number
    tasksDocumented: number
    screenHours: number
    achievements: number
    level: number
  }
  teamStats: {
    avgKRS: number
    avgTasks: number
    avgScreenHours: number
    avgAchievements: number
    totalTwinsActive: number
  }
  highlights: TeamHighlight[]
}

// ─── Next steps ───────────────────────────────────────────────────────────

export interface NextStep {
  action: string
  reason: string
  impact: string
  icon: string
}

// ─── Employee agent data ──────────────────────────────────────────────────

export interface EmployeeAgentData {
  agentId: string
  employeeName: string
  role: string
  department: string
  krs: number
  mode: 'shadow' | 'assisted' | 'autonomous'
  achievements: Achievement[]
  recentLearnings: LearningItem[]
  teamComparison: TeamComparisonData
  nextSteps: NextStep[]
}

// ─── ops-twin data (star case — KRS 91, 9/10 achievements) ───────────────

const opsTwinData: EmployeeAgentData = {
  agentId: 'ops-twin',
  employeeName: 'Carlos Méndez',
  role: 'Operaciones / Logística',
  department: 'Operaciones',
  krs: 91,
  mode: 'assisted',
  achievements: makeAchievements([
    'first-hour',
    'five-tasks',
    'ten-tasks',
    'full-coverage',
    'consistency-king',
    'no-gaps',
    'assisted-mode',
    'marathon',
    'zero-errors',
  ]),
  recentLearnings: [
    {
      time: '14:50',
      type: 'screen',
      icon: '🖥️',
      message: 'Detectó que revisás el tracking de envíos en MercadoLibre Envíos',
      detail: 'Tarea: Seguimiento de envíos pendientes — frecuencia diaria, primera revisión a las 9am',
    },
    {
      time: '14:22',
      type: 'screen',
      icon: '🖥️',
      message: 'Aprendió cómo actualizás el stock en la planilla de inventario',
      detail:
        'Tarea: Actualización de inventario — Google Sheets → filtro por producto → columna stock → guardar con timestamp',
    },
    {
      time: '13:10',
      type: 'screen',
      icon: '🖥️',
      message: 'Identificó tu flujo de coordinación con el operador logístico',
      detail: 'Tarea: Envío de listado diario a OCA por email — antes de las 12pm, CC a depósito',
    },
    {
      time: '11:45',
      type: 'chat',
      icon: '💬',
      message: 'Le contaste cómo gestionás las devoluciones',
      detail:
        'Tarea: Proceso de devolución — recepción → inspección → restock si está OK → descarte si hay daño → notificar al cliente',
    },
    {
      time: '10:30',
      type: 'screen',
      icon: '🖥️',
      message: 'Observó cómo generás la etiqueta de envío en Correo Argentino',
      detail:
        'Tarea: Generación de etiquetas de envío — portal web → datos del pedido → imprimir → adjuntar al paquete',
    },
    {
      time: '09:15',
      type: 'chat',
      icon: '💬',
      message: 'Le explicaste los criterios para elegir operador logístico',
      detail:
        'Decisión: OCA para CABA, Correo Argentino para interior, Andreani para volumen > 10 paquetes/día',
    },
  ],
  teamComparison: {
    myAgent: {
      name: 'Carlos Méndez',
      role: 'Operaciones',
      krs: 91,
      tasksDocumented: 10,
      screenHours: 8.0,
      achievements: 9,
      level: 5,
    },
    teamStats: {
      avgKRS: 79,
      avgTasks: 8.8,
      avgScreenHours: 4.9,
      avgAchievements: 5.6,
      totalTwinsActive: 5,
    },
    highlights: [
      {
        metric: 'KRS',
        myValue: 91,
        teamAvg: 79,
        unit: '',
        badge: 'Líder del equipo',
        isAbove: true,
      },
      {
        metric: 'Horas de observación',
        myValue: 8.0,
        teamAvg: 4.9,
        unit: 'h',
        badge: 'El más dedicado',
        isAbove: true,
      },
      {
        metric: 'Logros desbloqueados',
        myValue: 9,
        teamAvg: 5.6,
        unit: '',
        badge: 'Coleccionista',
        isAbove: true,
      },
    ],
  },
  nextSteps: [
    {
      action: '¡Tu twin tiene cobertura total!',
      reason:
        'No hay gaps pendientes. Seguí trabajando normalmente y tu twin seguirá aprendiendo contigo.',
      impact: 'Mantenimiento',
      icon: '✅',
    },
    {
      action: 'Desbloqueá el último logro: Autónomo',
      reason:
        'Tu twin está muy cerca de alcanzar Autonomous Mode. Solo necesitás mantener la tasa de aprobación alta.',
      impact: '+Nivel 6 próximamente',
      icon: '🤖',
    },
  ],
}

// ─── marketing-twin data (gap case — KRS 72, 2/10 achievements) ──────────

const marketingTwinData: EmployeeAgentData = {
  agentId: 'marketing-twin',
  employeeName: 'Lucía Fernández',
  role: 'Marketing Manager',
  department: 'Marketing',
  krs: 72,
  mode: 'shadow',
  achievements: makeAchievements(['first-hour', 'five-tasks']),
  recentLearnings: [
    {
      time: '15:30',
      type: 'screen',
      icon: '🖥️',
      message: 'Detectó que revisás las métricas de Instagram en Meta Business Suite',
      detail:
        'Tarea: Análisis diario de alcance e interacciones — revisión de 9am, foco en engagement rate y nuevos seguidores',
    },
    {
      time: '14:45',
      type: 'chat',
      icon: '💬',
      message: 'Le contaste cómo planificás el calendario de contenidos',
      detail:
        'Tarea: Planificación mensual — Google Sheets → columnas por canal (IG, LinkedIn, email) → categorías de contenido → fecha de publicación',
    },
    {
      time: '13:20',
      type: 'screen',
      icon: '🖥️',
      message: 'Observó cómo creás los reportes de campaña en Google Analytics',
      detail:
        'Tarea: Reporte semanal de tráfico — GA4 → conversiones → exportar a Google Slides para el equipo',
    },
    {
      time: '11:00',
      type: 'chat',
      icon: '💬',
      message: 'Le explicaste los criterios para aprobar creativos',
      detail:
        'Decisión: Paleta de marca + mensaje on-brand + CTA claro → aprobación en Slack → 24h para revisión del equipo',
    },
  ],
  teamComparison: {
    myAgent: {
      name: 'Lucía Fernández',
      role: 'Marketing',
      krs: 72,
      tasksDocumented: 8,
      screenHours: 4.5,
      achievements: 2,
      level: 4,
    },
    teamStats: {
      avgKRS: 79,
      avgTasks: 8.8,
      avgScreenHours: 4.9,
      avgAchievements: 5.6,
      totalTwinsActive: 5,
    },
    highlights: [
      {
        metric: 'KRS',
        myValue: 72,
        teamAvg: 79,
        unit: '',
        badge: '¡Cada sesión suma — vas muy bien!',
        isAbove: false,
      },
      {
        metric: 'Tareas documentadas',
        myValue: 8,
        teamAvg: 8.8,
        unit: '',
        badge: '¡Casi en el promedio, seguí así!',
        isAbove: false,
      },
      {
        metric: 'Horas de observación',
        myValue: 4.5,
        teamAvg: 4.9,
        unit: 'h',
        badge: 'Con una sesión más lo superás 💪',
        isAbove: false,
      },
    ],
  },
  nextSteps: [
    {
      action: 'Seguí trabajando con la pantalla compartida',
      reason: 'Tu twin todavía no te vio hacer el cierre de campaña mensual',
      impact: '+5 KRS estimado',
      icon: '🖥️',
    },
    {
      action: 'Contale a tu twin sobre tu estrategia de contenidos',
      reason: "Hay un gap en 'planificación de calendario editorial'",
      impact: '+4 KRS estimado',
      icon: '💬',
    },
    {
      action: 'Explicale cómo medís el ROI de campañas',
      reason: 'Falta documentar el proceso de análisis post-campaña',
      impact: '+3 KRS estimado',
      icon: '💬',
    },
  ],
}

// ─── Registry ─────────────────────────────────────────────────────────────

const EMPLOYEE_DATA: Record<string, EmployeeAgentData> = {
  'ops-twin': opsTwinData,
  'marketing-twin': marketingTwinData,
}

export function getEmployeeData(agentId: string): EmployeeAgentData | null {
  return EMPLOYEE_DATA[agentId] ?? null
}
