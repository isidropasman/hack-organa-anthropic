'use client'

// src/app/page.tsx
// Screen 1: Org chart upload → agent grid
// Flow: upload image → POST /api/parse-org → display AgentCard[] → click to /onboard/[agentId]

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import OrgUpload from '@/components/OrgUpload'
import AgentCard from '@/components/AgentCard'
import { agentStore } from '@/lib/agent-store'
import type { Agent } from '@/lib/types'

export default function HomePage() {
  const router = useRouter()
  const [agents, setAgents] = useState<Agent[]>([])
  const [companyName, setCompanyName] = useState('Nova Agency')
  const [isLoading] = useState(false)

  useEffect(() => {
    setAgents(agentStore.getAllAgents())
    setCompanyName(agentStore.getCompanyName())
  }, [])

  function handleAgentsGenerated(newAgents: Agent[], name?: string) {
    agentStore.setAgents(newAgents)
    setAgents(newAgents)
    if (name) {
      agentStore.setCompanyName(name)
      setCompanyName(name)
    }
  }

  function handleAgentClick(agent: Agent) {
    if (agent.onboardingComplete) {
      router.push(`/agent/${agent.id}`)
    } else {
      router.push(`/onboard/${agent.id}`)
    }
  }

  function handleReset() {
    agentStore.clearAll()
    setAgents([])
    setCompanyName('Nova Agency')
  }

  return (
    <main className="min-h-screen p-8">
      {/* Header */}
      <header className="mb-12">
        <h1 className="text-4xl font-bold text-organa-text">ORGANA</h1>
        <p className="text-organa-text-muted mt-2">
          Upload your org chart to generate AI agents for every team member.
        </p>
      </header>

      {agents.length === 0 ? (
        <div className="max-w-2xl mx-auto">
          <OrgUpload onAgentsGenerated={handleAgentsGenerated} isLoading={isLoading} />
        </div>
      ) : (
        <div>
          {/* Company header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-semibold text-organa-text">{companyName}</h2>
              <p className="text-organa-text-muted">
                {agents.filter(a => a.onboardingComplete).length} / {agents.length} agents trained
              </p>
            </div>
            <button
              onClick={handleReset}
              className="px-4 py-2 text-sm text-organa-text-muted hover:text-organa-text border border-organa-border hover:border-organa-muted rounded-lg transition-all"
            >
              Upload new chart
            </button>
          </div>

          {/* Agent grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {agents.map(agent => (
              <AgentCard
                key={agent.id}
                agent={agent}
                onClick={() => handleAgentClick(agent)}
              />
            ))}
          </div>
        </div>
      )}
    </main>
  )
}
