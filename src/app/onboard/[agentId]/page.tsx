'use client'

// src/app/onboard/[agentId]/page.tsx
// Screen 2: 10-minute onboarding interview to train an agent
// Flow: load agent → interview turns via POST /api/onboard → on complete → /agent/[agentId]

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

  useEffect(() => {
    const a = agentStore.getAgent(agentId)
    if (!a) { router.push('/'); return }
    if (a.onboardingComplete) { router.push(`/agent/${agentId}`); return }

    setAgent(a)
    setMessages(a.onboardingMessages)
    const company = agentStore.getCompanyName()
    setCompanyName(company)

    // Kick off first ARIA question if no messages yet
    if (a.onboardingMessages.length === 0) {
      kickstartInterview(a, company)
    }
  }, [agentId])

  async function kickstartInterview(a: Agent, company: string) {
    setIsLoading(true)
    try {
      const res = await fetch('/api/onboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentId: a.id,
          agentName: a.name,
          agentRole: a.role,
          companyName: company,
          messages: [],
        }),
      })
      const { message } = (await res.json()) as { message: Message; isComplete: boolean }
      agentStore.addOnboardingMessage(a.id, message)
      setMessages([message])
    } catch {
      // Show error inline without crashing
    } finally {
      setIsLoading(false)
    }
  }

  async function sendMessage(userContent: string) {
    if (!agent) return

    const userMessage: Message = {
      role: 'user',
      content: userContent,
      timestamp: new Date().toISOString(),
    }

    agentStore.addOnboardingMessage(agentId, userMessage)
    const updatedMessages = [...messages, userMessage]
    setMessages(updatedMessages)
    setIsLoading(true)

    try {
      const res = await fetch('/api/onboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentId,
          agentName: agent.name,
          agentRole: agent.role,
          companyName,
          messages: updatedMessages,
        }),
      })

      const { message, isComplete } = (await res.json()) as {
        message: Message
        isComplete: boolean
      }

      agentStore.addOnboardingMessage(agentId, message)
      const finalMessages = [...updatedMessages, message]
      setMessages(finalMessages)

      if (isComplete) {
        const kb = buildKnowledgeBaseFromMessages(finalMessages, agent)
        agentStore.completeOnboarding(agentId, kb)
        router.push(`/agent/${agentId}`)
      }
    } catch {
      // Show error in chat
      const errMessage: Message = {
        role: 'assistant',
        content: 'Sorry, something went wrong. Please try again.',
        timestamp: new Date().toISOString(),
      }
      setMessages(prev => [...prev, errMessage])
    } finally {
      setIsLoading(false)
    }
  }

  function buildKnowledgeBaseFromMessages(msgs: Message[], currentAgent: Agent): KnowledgeBase {
    // Extract the summary from the last assistant message (after ONBOARDING_COMPLETE marker)
    const lastAssistant = [...msgs].reverse().find(m => m.role === 'assistant')
    const rawSummary = lastAssistant?.content ?? ''
    const summary = rawSummary
      .replace(/ONBOARDING_COMPLETE\s*/g, '')
      .trim()

    return {
      agentId: currentAgent.id,
      completedAt: new Date().toISOString(),
      categories: {
        tasks: [],
        tools: [],
        team: [],
        comms: [],
        decisions: [],
        knowledge: [],
      },
      rawTranscript: msgs,
      summary,
    }
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
      {/* Header */}
      <header className="p-6 border-b border-organa-border flex items-center gap-4">
        <button
          onClick={() => router.push('/')}
          className="text-organa-text-muted hover:text-organa-text transition-colors"
        >
          ← Back
        </button>
        <div className="flex-1">
          <h1 className="text-xl font-semibold text-organa-text">{agent.name}</h1>
          <p className="text-organa-text-muted text-sm">{agent.role} · Onboarding Interview</p>
        </div>
        {/* Category progress indicator */}
        <div className="flex items-center gap-1.5">
          {Array.from({ length: 6 }, (_, i) => {
            const covered = Math.min(6, Math.floor(messages.filter(m => m.role === 'user').length / 2))
            return (
              <div
                key={i}
                className={`w-2 h-2 rounded-full transition-colors ${
                  i < covered ? 'bg-organa-accent' : 'bg-organa-border'
                }`}
              />
            )
          })}
          <span className="text-organa-text-muted text-xs ml-1">
            {Math.min(6, Math.floor(messages.filter(m => m.role === 'user').length / 2))}/6
          </span>
        </div>
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
