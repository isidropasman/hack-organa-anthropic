'use client'

// src/app/agent/[agentId]/page.tsx
// Screen 3: Chat with a trained agent
// Guard: if agent.onboardingComplete is false, redirects to /onboard/[agentId]
// Flow: load agent + knowledgeBase → chat loop via POST /api/chat

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import ChatInterface from '@/components/ChatInterface'
import { agentStore } from '@/lib/agent-store'
import type { Agent, Message } from '@/lib/types'

interface Props {
  params: { agentId: string }
}

export default function AgentChatPage({ params }: Props) {
  const router = useRouter()
  const { agentId } = params

  const [agent, setAgent] = useState<Agent | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [companyName, setCompanyName] = useState('Nova Agency')

  // TODO: Implement hydration + guard
  // useEffect(() => {
  //   const a = agentStore.getAgent(agentId)
  //   if (!a) { router.push('/'); return }
  //   if (!a.onboardingComplete) { router.push(`/onboard/${agentId}`); return }
  //   setAgent(a)
  //   setCompanyName(agentStore.getCompanyName())
  // }, [agentId])

  async function sendMessage(userContent: string) {
    // TODO: Implement
    // 1. Build userMessage: { role: 'user', content: userContent, timestamp: new Date().toISOString() }
    // 2. Append to messages state optimistically
    // 3. setIsLoading(true)
    // 4. POST to /api/chat with:
    //    { agentId, agentName: agent.name, agentRole: agent.role, companyName,
    //      knowledgeBase: agent.knowledgeBase, messages: [...messages, userMessage] }
    // 5. Parse response: const { message } = await res.json()
    // 6. Append assistant message to state
    // 7. setIsLoading(false)
    // Handle errors: show error message in chat if fetch fails
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
      {/* Header with agent identity */}
      <header className="p-6 border-b border-organa-border flex items-center gap-4">
        <button
          onClick={() => router.push('/')}
          className="text-organa-text-muted hover:text-organa-text transition-colors"
        >
          ← Back
        </button>
        <div className="flex items-center gap-3">
          {/* TODO: Add avatar with initials */}
          <div>
            <h1 className="text-xl font-semibold">{agent.name}</h1>
            <p className="text-organa-text-muted text-sm">
              {agent.role} · {companyName}
            </p>
          </div>
        </div>
        {/* TODO: Add "Trained" badge with completedAt date from knowledgeBase */}
      </header>

      {/* Suggested questions — only show when messages is empty */}
      {messages.length === 0 && (
        <div className="p-6 border-b border-organa-border">
          {/* TODO: Render 3 suggested question chips that call sendMessage() on click */}
          {/* Questions should be role-specific, e.g. "What tools do you use daily?" */}
          <p className="text-organa-text-muted text-sm">
            Start a conversation with {agent.name}&apos;s AI twin.
          </p>
        </div>
      )}

      {/* Chat area */}
      <div className="flex-1 overflow-hidden">
        <ChatInterface
          messages={messages}
          onSend={sendMessage}
          isLoading={isLoading}
          placeholder={`Ask ${agent.name} anything...`}
        />
      </div>
    </main>
  )
}
