'use client'

// src/components/AgentCard.tsx
// Displays a single agent's status — readiness score, training state
// Click navigates to /onboard/[agentId] or /agent/[agentId] depending on onboardingComplete

import type { Agent } from '@/lib/types'

interface Props {
  agent: Agent
  onClick: () => void
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map(n => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

export default function AgentCard({ agent, onClick }: Props) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left p-5 bg-organa-surface border border-organa-border rounded-xl hover:border-organa-muted transition-all group"
    >
      {/* TODO: Implement full card UI */}

      {/* Avatar + status badge */}
      <div className="flex items-start justify-between mb-4">
        <div className="w-10 h-10 rounded-full bg-organa-accent/20 flex items-center justify-center text-organa-accent font-semibold text-sm">
          {getInitials(agent.name)}
        </div>
        {/* Trained / Untrained badge */}
        <span className={`text-xs px-2 py-1 rounded-full font-medium ${
          agent.onboardingComplete
            ? 'bg-green-900/40 text-green-400 border border-green-800'
            : 'bg-organa-muted/30 text-organa-text-muted border border-organa-border'
        }`}>
          {agent.onboardingComplete ? 'Trained' : 'Untrained'}
        </span>
      </div>

      {/* Name and role */}
      <div className="mb-4">
        <p className="font-semibold text-organa-text group-hover:text-white transition-colors">
          {agent.name}
        </p>
        <p className="text-organa-text-muted text-sm mt-0.5">{agent.role}</p>
        <p className="text-organa-text-muted text-xs mt-0.5">{agent.department}</p>
      </div>

      {/* Readiness score bar */}
      <div>
        <div className="flex justify-between text-xs text-organa-text-muted mb-1">
          <span>Readiness</span>
          <span>{agent.readinessScore}%</span>
        </div>
        <div className="h-1.5 bg-organa-border rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              agent.onboardingComplete ? 'bg-green-500' : 'bg-organa-accent'
            }`}
            style={{ width: `${agent.readinessScore}%` }}
          />
        </div>
      </div>

      {/* CTA label */}
      <p className="text-xs text-organa-text-muted mt-3 group-hover:text-organa-accent transition-colors">
        {agent.onboardingComplete ? 'Chat with agent →' : 'Start onboarding →'}
      </p>
    </button>
  )
}
