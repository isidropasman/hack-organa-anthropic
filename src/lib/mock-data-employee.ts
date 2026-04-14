// src/lib/mock-data-employee.ts
// Mock data for the employee "My Twin" dashboard
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
    name: 'Novice',
    min: 0,
    max: 30,
    motivation: 'Your twin is taking its first steps. Keep working so it can learn!',
  },
  {
    level: 2,
    name: 'Apprentice',
    min: 31,
    max: 50,
    motivation: 'It is starting to understand your day-to-day. Every observation hour counts.',
  },
  {
    level: 3,
    name: 'Proficient',
    min: 51,
    max: 70,
    motivation: 'Your twin can already help you with several tasks. Great work!',
  },
  {
    level: 4,
    name: 'Expert',
    min: 71,
    max: 85,
    motivation: 'Impressive — your twin knows almost your entire operation.',
  },
  {
    level: 5,
    name: 'Master',
    min: 86,
    max: null,
    motivation: 'Your twin is an expert in your role. Your role knowledge is fully preserved.',
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
    title: 'First Hour',
    description: 'Your twin observed you for the first time',
    unlocked: false,
  },
  {
    id: 'five-tasks',
    icon: '📋',
    title: 'Five Tasks',
    description: 'Your twin identified 5 tasks from your role',
    unlocked: false,
  },
  {
    id: 'ten-tasks',
    icon: '🎯',
    title: 'Ten Tasks',
    description: '10 tasks documented — great progress!',
    unlocked: false,
  },
  {
    id: 'full-coverage',
    icon: '🏆',
    title: 'Full Coverage',
    description: 'All tasks in your role are documented',
    unlocked: false,
  },
  {
    id: 'consistency-king',
    icon: '💎',
    title: 'Consistency',
    description: 'Consistency > 90% between what you said and what was observed',
    unlocked: false,
  },
  {
    id: 'no-gaps',
    icon: '✨',
    title: 'No Gaps',
    description: 'No missing knowledge in your role',
    unlocked: false,
  },
  {
    id: 'assisted-mode',
    icon: '⚡',
    title: 'Assisted Mode',
    description: 'Your twin switched to Assisted Mode — it can now act on its own!',
    unlocked: false,
  },
  {
    id: 'marathon',
    icon: '🏃',
    title: 'Marathon',
    description: '8+ hours of accumulated observation',
    unlocked: false,
  },
  {
    id: 'zero-errors',
    icon: '🎖️',
    title: 'Flawless',
    description: '0% error rate — your twin never makes mistakes',
    unlocked: false,
  },
  {
    id: 'autonomous',
    icon: '🤖',
    title: 'Autonomous',
    description: 'Your twin reached Autonomous Mode',
    unlocked: false,
  },
]

function makeAchievements(unlockedIds: string[]): Achievement[] {
  return ALL_ACHIEVEMENTS.map(a =>
    unlockedIds.includes(a.id)
      ? { ...a, unlocked: true, unlockedAt: '14 Apr 2026' }
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
  role: 'Operations / Logistics',
  department: 'Operations',
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
      message: 'Detected that you check shipment tracking in MercadoLibre Envíos',
      detail: 'Task: Pending shipment tracking — daily frequency, first check at 9am',
    },
    {
      time: '14:22',
      type: 'screen',
      icon: '🖥️',
      message: 'Learned how you update stock in the inventory spreadsheet',
      detail:
        'Task: Inventory update — Google Sheets → filter by product → stock column → save with timestamp',
    },
    {
      time: '13:10',
      type: 'screen',
      icon: '🖥️',
      message: 'Identified your coordination workflow with the logistics operator',
      detail: 'Task: Send daily OCA shipment list by email — before 12pm, CC to warehouse',
    },
    {
      time: '11:45',
      type: 'chat',
      icon: '💬',
      message: 'You explained how you handle returns',
      detail:
        'Task: Returns process — receipt → inspection → restock if OK → discard if damaged → notify customer',
    },
    {
      time: '10:30',
      type: 'screen',
      icon: '🖥️',
      message: 'Observed how you generate shipping labels at Correo Argentino',
      detail:
        'Task: Shipping label generation — web portal → order data → print → attach to package',
    },
    {
      time: '09:15',
      type: 'chat',
      icon: '💬',
      message: 'You explained the criteria for choosing a logistics operator',
      detail:
        'Decision: OCA for Buenos Aires city, Correo Argentino for inland, Andreani for volume > 10 packages/day',
    },
  ],
  teamComparison: {
    myAgent: {
      name: 'Carlos Méndez',
      role: 'Operations',
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
        badge: 'Team leader',
        isAbove: true,
      },
      {
        metric: 'Observation hours',
        myValue: 8.0,
        teamAvg: 4.9,
        unit: 'h',
        badge: 'Most dedicated',
        isAbove: true,
      },
      {
        metric: 'Achievements unlocked',
        myValue: 9,
        teamAvg: 5.6,
        unit: '',
        badge: 'Collector',
        isAbove: true,
      },
    ],
  },
  nextSteps: [
    {
      action: 'Your twin has full coverage!',
      reason:
        'No pending gaps. Keep working normally and your twin will keep learning with you.',
      impact: 'Maintenance',
      icon: '✅',
    },
    {
      action: 'Unlock the last achievement: Autonomous',
      reason:
        'Your twin is very close to Autonomous Mode. Just keep the approval rate high.',
      impact: '+Level 6 coming soon',
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
      message: 'Detected that you check Instagram metrics in Meta Business Suite',
      detail:
        'Task: Daily reach and engagement analysis — 9am review, focus on engagement rate and new followers',
    },
    {
      time: '14:45',
      type: 'chat',
      icon: '💬',
      message: 'You explained how you plan the content calendar',
      detail:
        'Task: Monthly planning — Google Sheets → columns by channel (IG, LinkedIn, email) → content categories → publish date',
    },
    {
      time: '13:20',
      type: 'screen',
      icon: '🖥️',
      message: 'Observed how you create campaign reports in Google Analytics',
      detail:
        'Task: Weekly traffic report — GA4 → conversions → export to Google Slides for the team',
    },
    {
      time: '11:00',
      type: 'chat',
      icon: '💬',
      message: 'You explained the criteria for approving creatives',
      detail:
        'Decision: Brand palette + on-brand message + clear CTA → Slack approval → 24h for team review',
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
        badge: 'Every session counts — you\'re doing great!',
        isAbove: false,
      },
      {
        metric: 'Tasks documented',
        myValue: 8,
        teamAvg: 8.8,
        unit: '',
        badge: 'Almost at average, keep it up!',
        isAbove: false,
      },
      {
        metric: 'Observation hours',
        myValue: 4.5,
        teamAvg: 4.9,
        unit: 'h',
        badge: 'One more session and you\'ll beat the average 💪',
        isAbove: false,
      },
    ],
  },
  nextSteps: [
    {
      action: 'Keep working with screen sharing',
      reason: 'Your twin hasn\'t seen you do the monthly campaign close yet',
      impact: '+5 KRS estimated',
      icon: '🖥️',
    },
    {
      action: 'Tell your twin about your content strategy',
      reason: 'There\'s a gap in \'editorial calendar planning\'',
      impact: '+4 KRS estimated',
      icon: '💬',
    },
    {
      action: 'Explain how you measure campaign ROI',
      reason: 'The post-campaign analysis process is not yet documented',
      impact: '+3 KRS estimated',
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
