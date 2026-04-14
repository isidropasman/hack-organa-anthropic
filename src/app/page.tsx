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
  const [isLoading, setIsLoading] = useState(false)

  // TODO: Implement hydration from localStorage
  // useEffect(() => {
  //   setAgents(agentStore.getAllAgents())
  //   setCompanyName(agentStore.getCompanyName())
  // }, [])

  function handleAgentsGenerated(newAgents: Agent[]) {
    // TODO: Implement
    // 1. agentStore.setAgents(newAgents)
    // 2. setAgents(newAgents)
    // 3. If newAgents[0] exists and has a name, try to infer company name or use default
  }

  function handleAgentClick(agent: Agent) {
    // TODO: Implement
    // if (agent.onboardingComplete) {
    //   router.push(`/agent/${agent.id}`)
    // } else {
    //   router.push(`/onboard/${agent.id}`)
    // }
  }

  return (
    <main className="min-h-screen p-8">
      {/* TODO: Implement full UI */}
      {/* Header */}
      <header className="mb-12">
        <h1 className="text-4xl font-bold text-organa-text">ORGANA</h1>
        <p className="text-organa-text-muted mt-2">
          Upload your org chart to generate AI agents for every team member.
        </p>
      </header>

      {/* Upload zone — always visible if no agents, or as secondary action */}
      {agents.length === 0 ? (
        <div className="max-w-2xl mx-auto">
          <OrgUpload onAgentsGenerated={handleAgentsGenerated} isLoading={isLoading} />
        </div>
      ) : (
        <div>
          {/* Company header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-semibold">{companyName}</h2>
              <p className="text-organa-text-muted">
                {agents.filter(a => a.onboardingComplete).length} / {agents.length} agents trained
              </p>
            </div>
            {/* TODO: Add "Upload new chart" button that calls agentStore.clearAll() then resets state */}
          </div>

          {/* Agent grid */}
          {/* TODO: Implement grid layout with AgentCard for each agent */}
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
