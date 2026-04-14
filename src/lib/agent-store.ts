// src/lib/agent-store.ts
// Single source of truth for all persistent state in ORGANA MVP
// Uses localStorage only — no database, no server state
// Import this everywhere you need to read or write agent data
// NOTE: All functions must be called client-side only (not in Server Components or API routes)

import type { Agent, KnowledgeBase, Message, DemoCompany } from './types'

const KEYS = {
  AGENTS: 'organa_agents',
  COMPANY_NAME: 'organa_company_name',
} as const

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
    return JSON.parse(raw) as Agent[]
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

  // ─── Demo / Utilities ───────────────────────────────────────────────────────

  seedDemoCompany: (company: DemoCompany): void => {
    agentStore.setCompanyName(company.name)
    agentStore.setAgents(company.agents)
  },

  clearAll: (): void => {
    Object.values(KEYS).forEach(key => localStorage.removeItem(key))
  },
}
