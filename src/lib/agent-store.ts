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
    // TODO: Implement
    // return localStorage.getItem(KEYS.COMPANY_NAME) ?? 'Nova Agency'
    throw new Error('Not implemented')
  },

  setCompanyName: (name: string): void => {
    // TODO: Implement
    // localStorage.setItem(KEYS.COMPANY_NAME, name)
    throw new Error('Not implemented')
  },

  // ─── Agents ─────────────────────────────────────────────────────────────────

  getAllAgents: (): Agent[] => {
    // TODO: Implement
    // const raw = localStorage.getItem(KEYS.AGENTS)
    // if (!raw) return []
    // return JSON.parse(raw) as Agent[]
    throw new Error('Not implemented')
  },

  getAgent: (agentId: string): Agent | null => {
    // TODO: Implement
    // return agentStore.getAllAgents().find(a => a.id === agentId) ?? null
    throw new Error('Not implemented')
  },

  setAgents: (agents: Agent[]): void => {
    // TODO: Implement
    // localStorage.setItem(KEYS.AGENTS, JSON.stringify(agents))
    throw new Error('Not implemented')
  },

  upsertAgent: (agent: Agent): void => {
    // TODO: Implement
    // const agents = agentStore.getAllAgents()
    // const idx = agents.findIndex(a => a.id === agent.id)
    // if (idx >= 0) agents[idx] = agent
    // else agents.push(agent)
    // agentStore.setAgents(agents)
    throw new Error('Not implemented')
  },

  // ─── Onboarding ─────────────────────────────────────────────────────────────

  addOnboardingMessage: (agentId: string, message: Message): void => {
    // TODO: Implement
    // const agent = agentStore.getAgent(agentId)
    // if (!agent) throw new Error(`Agent ${agentId} not found`)
    // agent.onboardingMessages.push(message)
    // agentStore.upsertAgent(agent)
    throw new Error('Not implemented')
  },

  completeOnboarding: (agentId: string, knowledgeBase: KnowledgeBase): void => {
    // TODO: Implement
    // const agent = agentStore.getAgent(agentId)
    // if (!agent) throw new Error(`Agent ${agentId} not found`)
    // agent.knowledgeBase = knowledgeBase
    // agent.onboardingComplete = true
    // agent.readinessScore = 100
    // agentStore.upsertAgent(agent)
    throw new Error('Not implemented')
  },

  // ─── Demo / Utilities ───────────────────────────────────────────────────────

  seedDemoCompany: (company: DemoCompany): void => {
    // TODO: Implement
    // agentStore.setCompanyName(company.name)
    // agentStore.setAgents(company.agents)
    throw new Error('Not implemented')
  },

  clearAll: (): void => {
    // TODO: Implement
    // Object.values(KEYS).forEach(key => localStorage.removeItem(key))
    throw new Error('Not implemented')
  },
}
