// src/lib/agent-store.ts
// Single source of truth for all persistent state in ORGANA MVP
// Uses localStorage only — no database, no server state
// NOTE: All functions must be called client-side only (not in Server Components or API routes)

import type {
  Agent,
  KnowledgeBase,
  Message,
  DemoCompany,
  AgentLevel,
  PointEventType,
  PointEvent,
  Automation,
  AutomationStatus,
} from './types'
import { LEVEL_THRESHOLDS, POINT_VALUES } from './types'

const KEYS = {
  AGENTS:       'organa_agents',
  COMPANY_NAME: 'organa_company_name',
} as const

// ─── Helpers ────────────────────────────────────────────────────────────────

function calculateLevel(points: number): AgentLevel {
  if (points >= LEVEL_THRESHOLDS.elite)  return 'elite'
  if (points >= LEVEL_THRESHOLDS.gold)   return 'gold'
  if (points >= LEVEL_THRESHOLDS.silver) return 'silver'
  return 'bronze'
}

function pointsToNextLevel(points: number): { next: AgentLevel | null; remaining: number } {
  if (points < LEVEL_THRESHOLDS.silver) return { next: 'silver', remaining: LEVEL_THRESHOLDS.silver - points }
  if (points < LEVEL_THRESHOLDS.gold)   return { next: 'gold',   remaining: LEVEL_THRESHOLDS.gold   - points }
  if (points < LEVEL_THRESHOLDS.elite)  return { next: 'elite',  remaining: LEVEL_THRESHOLDS.elite  - points }
  return { next: null, remaining: 0 }
}

/** Ensure agents parsed before scoring system existed have the new fields */
function migrateAgent(agent: Partial<Agent> & Pick<Agent, 'id' | 'name' | 'role' | 'department'>): Agent {
  return {
    reportsTo: null,
    readinessScore: 0,
    onboardingComplete: false,
    knowledgeBase: null,
    onboardingMessages: [],
    points: 0,
    level: 'bronze',
    pointHistory: [],
    automations: [],
    ...agent,
  } as Agent
}

// ─── Store ──────────────────────────────────────────────────────────────────

export const agentStore = {

  // ── Company ─────────────────────────────────────────────────────────────

  getCompanyName: (): string =>
    localStorage.getItem(KEYS.COMPANY_NAME) ?? 'Nova Agency',

  setCompanyName: (name: string): void =>
    localStorage.setItem(KEYS.COMPANY_NAME, name),

  // ── Agents ──────────────────────────────────────────────────────────────

  getAllAgents: (): Agent[] => {
    const raw = localStorage.getItem(KEYS.AGENTS)
    if (!raw) return []
    const parsed = JSON.parse(raw) as Partial<Agent>[]
    return parsed.map(a => migrateAgent(a as Parameters<typeof migrateAgent>[0]))
  },

  getAgent: (agentId: string): Agent | null =>
    agentStore.getAllAgents().find(a => a.id === agentId) ?? null,

  setAgents: (agents: Agent[]): void =>
    localStorage.setItem(KEYS.AGENTS, JSON.stringify(agents)),

  upsertAgent: (agent: Agent): void => {
    const agents = agentStore.getAllAgents()
    const idx = agents.findIndex(a => a.id === agent.id)
    if (idx >= 0) agents[idx] = agent
    else agents.push(agent)
    agentStore.setAgents(agents)
  },

  // ── Onboarding ──────────────────────────────────────────────────────────

  addOnboardingMessage: (agentId: string, message: Message): void => {
    const agent = agentStore.getAgent(agentId)
    if (!agent) throw new Error(`Agent ${agentId} not found`)
    agent.onboardingMessages.push(message)
    agentStore.upsertAgent(agent)
  },

  completeOnboarding: (agentId: string, knowledgeBase: KnowledgeBase): void => {
    const agent = agentStore.getAgent(agentId)
    if (!agent) throw new Error(`Agent ${agentId} not found`)
    agent.knowledgeBase = knowledgeBase
    agent.onboardingComplete = true
    agent.readinessScore = 100
    agentStore.upsertAgent(agent)
    // Award onboarding points
    agentStore.addPoints(agentId, 'ONBOARDING_COMPLETE', 'Onboarding completed')
  },

  // ── Scoring ─────────────────────────────────────────────────────────────

  addPoints: (agentId: string, eventType: PointEventType, description?: string): void => {
    const agent = agentStore.getAgent(agentId)
    if (!agent) throw new Error(`Agent ${agentId} not found`)
    const earned = POINT_VALUES[eventType]
    const event: PointEvent = {
      type: eventType,
      points: earned,
      timestamp: new Date().toISOString(),
      description,
    }
    agent.points += earned
    agent.level = calculateLevel(agent.points)
    agent.pointHistory.push(event)
    agentStore.upsertAgent(agent)
  },

  getPointsToNextLevel: (agentId: string) => {
    const agent = agentStore.getAgent(agentId)
    if (!agent) return null
    return pointsToNextLevel(agent.points)
  },

  // ── Leaderboard ─────────────────────────────────────────────────────────

  getLeaderboard: (): Agent[] =>
    [...agentStore.getAllAgents()].sort((a, b) => b.points - a.points),

  getDepartmentLeaderboard: (): { department: string; avgPoints: number; totalPoints: number; agentCount: number; topAgent: string }[] => {
    const agents = agentStore.getAllAgents()
    const byDept = agents.reduce<Record<string, Agent[]>>((acc, agent) => {
      const dept = agent.department || 'No department';
      (acc[dept] ??= []).push(agent)
      return acc
    }, {})

    return Object.entries(byDept)
      .map(([department, members]) => ({
        department,
        agentCount:  members.length,
        totalPoints: members.reduce((s, a) => s + a.points, 0),
        avgPoints:   Math.round(members.reduce((s, a) => s + a.points, 0) / members.length),
        topAgent:    [...members].sort((a, b) => b.points - a.points)[0].name,
      }))
      .sort((a, b) => b.avgPoints - a.avgPoints)
  },

  // ── Automations ─────────────────────────────────────────────────────────

  addAutomation: (agentId: string, automation: Automation): void => {
    const agent = agentStore.getAgent(agentId)
    if (!agent) throw new Error(`Agent ${agentId} not found`)
    agent.automations.push(automation)
    agentStore.upsertAgent(agent)
  },

  updateAutomationStatus: (agentId: string, automationId: string, status: AutomationStatus): void => {
    const agent = agentStore.getAgent(agentId)
    if (!agent) throw new Error(`Agent ${agentId} not found`)
    const auto = agent.automations.find(a => a.id === automationId)
    if (!auto) throw new Error(`Automation ${automationId} not found`)

    auto.status = status

    // Award points inline to avoid double-read/write race with upsertAgent
    if (status === 'active') {
      const earned = POINT_VALUES.AUTOMATION_APPROVED
      agent.points += earned
      agent.level = calculateLevel(agent.points)
      agent.pointHistory.push({
        type: 'AUTOMATION_APPROVED',
        points: earned,
        timestamp: new Date().toISOString(),
        description: `Automation approved: ${auto.name}`,
      })
    }

    agentStore.upsertAgent(agent)
  },

  recordAutomationRun: (agentId: string, automationId: string, timeSavedMinutes: number): void => {
    const agent = agentStore.getAgent(agentId)
    if (!agent) throw new Error(`Agent ${agentId} not found`)
    const auto = agent.automations.find(a => a.id === automationId)
    if (!auto) throw new Error(`Automation ${automationId} not found`)

    auto.runsTotal++
    auto.timeSavedMinutes += timeSavedMinutes
    auto.lastRun = new Date().toISOString()

    // Award points inline to avoid double-read/write race with upsertAgent
    const earned = POINT_VALUES.AUTOMATION_RUN
    agent.points += earned
    agent.level = calculateLevel(agent.points)
    agent.pointHistory.push({
      type: 'AUTOMATION_RUN',
      points: earned,
      timestamp: new Date().toISOString(),
      description: `Automation executed: ${auto.name}`,
    })

    agentStore.upsertAgent(agent)
  },

  getActiveAutomations: (agentId: string): Automation[] => {
    const agent = agentStore.getAgent(agentId)
    return agent?.automations.filter(a => a.status === 'active') ?? []
  },

  // ── Demo / Utilities ────────────────────────────────────────────────────

  seedDemoCompany: (company: DemoCompany): void => {
    agentStore.setCompanyName(company.name)
    agentStore.setAgents(company.agents)
  },

  clearAll: (): void => {
    Object.values(KEYS).forEach(key => localStorage.removeItem(key))
  },
}

// ─── Re-exports for convenience ─────────────────────────────────────────────
export { calculateLevel, pointsToNextLevel }
