// src/lib/agent-store.ts
// Single source of truth for all persistent state in ORGANA MVP
// Uses localStorage only — no database, no server state
// Import this everywhere you need to read or write agent data
// NOTE: All functions must be called client-side only (not in Server Components or API routes)

import type { Agent, KnowledgeBase, Message, DemoCompany, Automation, AutomationStatus, PointEventType, AgentLevel } from './types'
import { LEVEL_THRESHOLDS, POINT_VALUES } from './types'

const KEYS = {
  AGENTS: 'organa_agents',
  COMPANY_NAME: 'organa_company_name',
} as const

function calculateLevel(points: number): AgentLevel {
  if (points >= LEVEL_THRESHOLDS.elite)  return 'elite'
  if (points >= LEVEL_THRESHOLDS.gold)   return 'gold'
  if (points >= LEVEL_THRESHOLDS.silver) return 'silver'
  return 'bronze'
}

function migrateAgent(agent: Partial<Agent> & Pick<Agent, 'id' | 'name' | 'role' | 'department'>): Agent {
  return {
    reportsTo:          null,
    readinessScore:     0,
    onboardingComplete: false,
    knowledgeBase:      null,
    onboardingMessages: [],
    points:             0,
    level:              'bronze',
    pointHistory:       [],
    automations:        [],
    ...agent,
  } as Agent
}

export const agentStore = {

  // ─── Company ────────────────────────────────────────────────────────────────

  getCompanyName: (): string => {
    return localStorage.getItem(KEYS.COMPANY_NAME) ?? 'Nova Agency'
  },

  setCompanyName: (name: string): void => {
    localStorage.setItem(KEYS.COMPANY_NAME, name)
  },

  // ─── Agents ─────────────────────────────────────────────────────────────────

  getAllAgents: (): Agent[] => {
    const raw = localStorage.getItem(KEYS.AGENTS)
    if (!raw) return []
    return (JSON.parse(raw) as Agent[]).map(a => migrateAgent(a))
  },

  getAgent: (agentId: string): Agent | null => {
    return agentStore.getAllAgents().find(a => a.id === agentId) ?? null
  },

  setAgents: (agents: Agent[]): void => {
    localStorage.setItem(KEYS.AGENTS, JSON.stringify(agents))
  },

  upsertAgent: (agent: Agent): void => {
    const agents = agentStore.getAllAgents()
    const idx = agents.findIndex(a => a.id === agent.id)
    if (idx >= 0) agents[idx] = agent
    else agents.push(agent)
    agentStore.setAgents(agents)
  },

  // ─── Onboarding ─────────────────────────────────────────────────────────────

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
  },

  // ─── Scoring ────────────────────────────────────────────────────────────────

  addPoints: (agentId: string, eventType: PointEventType, description?: string): void => {
    const agent = agentStore.getAgent(agentId)
    if (!agent) throw new Error(`Agent ${agentId} not found`)
    const earned = POINT_VALUES[eventType]
    agent.points = (agent.points ?? 0) + earned
    agent.level = calculateLevel(agent.points)
    ;(agent.pointHistory ??= []).push({ type: eventType, points: earned, timestamp: new Date().toISOString(), description })
    agentStore.upsertAgent(agent)
  },

  getLeaderboard: (): Agent[] =>
    [...agentStore.getAllAgents()].sort((a, b) => (b.points ?? 0) - (a.points ?? 0)),

  // ─── Automations ────────────────────────────────────────────────────────────

  addAutomation: (agentId: string, automation: Automation): void => {
    const agent = agentStore.getAgent(agentId)
    if (!agent) throw new Error(`Agent ${agentId} not found`)
    ;(agent.automations ??= []).push(automation)
    agentStore.upsertAgent(agent)
  },

  updateAutomationStatus: (agentId: string, automationId: string, status: AutomationStatus): void => {
    const agent = agentStore.getAgent(agentId)
    if (!agent) throw new Error(`Agent ${agentId} not found`)
    const auto = (agent.automations ?? []).find(a => a.id === automationId)
    if (!auto) throw new Error(`Automation ${automationId} not found`)
    auto.status = status
    if (status === 'active') {
      const earned = POINT_VALUES.AUTOMATION_APPROVED
      agent.points = (agent.points ?? 0) + earned
      agent.level = calculateLevel(agent.points)
      ;(agent.pointHistory ??= []).push({ type: 'AUTOMATION_APPROVED', points: earned, timestamp: new Date().toISOString(), description: `Automation approved: ${auto.name}` })
    }
    agentStore.upsertAgent(agent)
  },

  getActiveAutomations: (agentId: string): Automation[] => {
    const agent = agentStore.getAgent(agentId)
    return (agent?.automations ?? []).filter(a => a.status === 'active')
  },

  // ─── Demo / Utilities ───────────────────────────────────────────────────────

  seedDemoCompany: (company: DemoCompany): void => {
    agentStore.setCompanyName(company.name)
    agentStore.setAgents(company.agents)
  },

  clearAll: (): void => {
    Object.values(KEYS).forEach(key => localStorage.removeItem(key))
  },
}
