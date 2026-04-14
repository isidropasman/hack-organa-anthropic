'use client'

// src/app/agent/[agentId]/page.tsx
// Screen 3: Chat with a trained agent
// Guard: if agent.onboardingComplete is false, redirects to /onboard/[agentId]
// Flow: load agent + knowledgeBase → chat loop via POST /api/chat

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import ChatInterface from '@/components/ChatInterface'
import { agentStore } from '@/lib/agent-store'
import type { Agent, Message, AgentChatResponse } from '@/lib/types'

interface Props {
  params: { agentId: string }
}

const SUGGESTED_QUESTIONS = [
  'What does your typical week look like?',
  'What tools do you use daily and how?',
  'What would a new person in your role need to know in week 1?',
]

function getInitials(name: string): string {
  return name
    .split(' ')
    .map(n => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

export default function AgentChatPage({ params }: Props) {
  const router = useRouter()
  const { agentId } = params

  const [agent, setAgent] = useState<Agent | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [companyName, setCompanyName] = useState('Nova Agency')

  useEffect(() => {
    const a = agentStore.getAgent(agentId)
    if (!a) { router.push('/'); return }
    if (!a.onboardingComplete) { router.push(`/onboard/${agentId}`); return }
    setAgent(a)
    setCompanyName(agentStore.getCompanyName())
  }, [agentId])

  async function sendMessage(userContent: string) {
    if (!agent || !agent.knowledgeBase) return

    const userMessage: Message = {
      role: 'user',
      content: userContent,
      timestamp: new Date().toISOString(),
    }

    const updatedMessages = [...messages, userMessage]
    setMessages(updatedMessages)
    setIsLoading(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentId,
          agentName: agent.name,
          agentRole: agent.role,
          companyName,
          knowledgeBase: agent.knowledgeBase,
          messages: updatedMessages,
        }),
      })

      const { message } = (await res.json()) as AgentChatResponse
      setMessages(prev => [...prev, message])
    } catch {
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
        <div className="flex items-center gap-3 flex-1">
          {/* Avatar */}
          <div className="w-10 h-10 rounded-full bg-organa-accent/20 flex items-center justify-center text-organa-accent font-semibold text-sm flex-shrink-0">
            {getInitials(agent.name)}
          </div>
          <div>
            <h1 className="text-xl font-semibold text-organa-text">{agent.name}</h1>
            <p className="text-organa-text-muted text-sm">
              {agent.role} · {companyName}
            </p>
          </div>
        </div>
        {/* Trained badge */}
        {agent.knowledgeBase && (
          <div className="text-right">
            <span className="text-xs px-2 py-1 rounded-full font-medium bg-green-900/40 text-green-400 border border-green-800">
              Trained
            </span>
            <p className="text-organa-text-muted text-xs mt-1">
              {new Date(agent.knowledgeBase.completedAt).toLocaleDateString()}
            </p>
          </div>
        )}
      </header>

      {/* Suggested questions — only when no messages */}
      {messages.length === 0 && (
        <div className="p-6 border-b border-organa-border">
          <p className="text-organa-text-muted text-xs mb-3">
            Ask {agent.name.split(' ')[0]} anything:
          </p>
          <div className="flex flex-wrap gap-2">
            {SUGGESTED_QUESTIONS.map(q => (
              <button
                key={q}
                onClick={() => sendMessage(q)}
                disabled={isLoading}
                className="text-sm px-3 py-2 bg-organa-surface border border-organa-border hover:border-organa-muted rounded-lg text-organa-text-muted hover:text-organa-text transition-all disabled:opacity-50"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Chat area */}
      <div className="flex-1 overflow-hidden">
        <ChatInterface
          messages={messages}
          onSend={sendMessage}
          isLoading={isLoading}
          placeholder={`Ask ${agent.name.split(' ')[0]} anything...`}
        />
      </div>
    </main>
  )
}
