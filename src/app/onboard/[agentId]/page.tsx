'use client'

// src/app/onboard/[agentId]/page.tsx
// Screen 2: 10-minute onboarding interview to train an agent
// Flow: load agent → stream interview turns via POST /api/onboard → on complete → /agent/[agentId]

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import ChatInterface from '@/components/ChatInterface'
import { agentStore } from '@/lib/agent-store'
import type { Agent, Message, KnowledgeBase } from '@/lib/types'

interface Props {
  params: { agentId: string }
}

export default function OnboardPage({ params }: Props) {
  const router = useRouter()
  const { agentId } = params

  const [agent, setAgent] = useState<Agent | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [companyName, setCompanyName] = useState('Nova Agency')

  // TODO: Implement hydration
  // useEffect(() => {
  //   const a = agentStore.getAgent(agentId)
  //   if (!a) { router.push('/'); return }
  //   if (a.onboardingComplete) { router.push(`/agent/${agentId}`); return }
  //   setAgent(a)
  //   setMessages(a.onboardingMessages)
  //   setCompanyName(agentStore.getCompanyName())
  //   // If no messages yet, trigger the first ARIA message automatically
  //   if (a.onboardingMessages.length === 0) sendMessage('')
  // }, [agentId])

  async function sendMessage(userContent: string) {
    // TODO: Implement
    // 1. If userContent is non-empty, create userMessage and add to messages + agentStore
    // 2. setIsLoading(true)
    // 3. Build messages array to send (include new user message if any)
    // 4. POST to /api/onboard with { agentId, agentName: agent.name, agentRole: agent.role, companyName, messages }
    // 5. Parse response: const { message, isComplete } = await res.json()
    // 6. Add assistant message to state + agentStore.addOnboardingMessage(agentId, message)
    // 7. If isComplete:
    //    a. Build KnowledgeBase from the full conversation (extract categories from messages via simple pattern matching or just store raw)
    //    b. Call agentStore.completeOnboarding(agentId, knowledgeBase)
    //    c. router.push(`/agent/${agentId}`)
    // 8. setIsLoading(false)
  }

  function buildKnowledgeBaseFromMessages(msgs: Message[]): KnowledgeBase {
    // TODO: Implement
    // Simple approach: store all messages as rawTranscript
    // Extract summary from the last assistant message (it contains the 3-sentence summary after ONBOARDING_COMPLETE)
    // Leave categories empty — the TRAINED_AGENT prompt uses rawTranscript anyway
    // Return a valid KnowledgeBase object
    throw new Error('Not implemented')
  }

  if (!agent) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-organa-text-muted">Loading agent...</p>
      </div>
    )
  }

  return (
    <main className="min-h-screen flex flex-col">
      {/* TODO: Implement full UI */}
      {/* Header with agent info */}
      <header className="p-6 border-b border-organa-border flex items-center gap-4">
        <button
          onClick={() => router.push('/')}
          className="text-organa-text-muted hover:text-organa-text transition-colors"
        >
          ← Back
        </button>
        <div>
          <h1 className="text-xl font-semibold">{agent.name}</h1>
          <p className="text-organa-text-muted text-sm">{agent.role} · Onboarding Interview</p>
        </div>
        {/* TODO: Add progress indicator showing categories covered (1-6) */}
      </header>

      {/* Chat area */}
      <div className="flex-1 overflow-hidden">
        <ChatInterface
          messages={messages}
          onSend={sendMessage}
          isLoading={isLoading}
          placeholder={`Answer as ${agent.name}...`}
        />
      </div>
    </main>
  )
}
