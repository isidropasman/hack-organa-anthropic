'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import ChatInterface from '@/components/ChatInterface'
import { agentStore } from '@/lib/agent-store'
import { getCurrentUser } from '@/lib/auth'
import type { Agent, Message, KnowledgeBase } from '@/lib/types'

interface Props {
  params: { agentId: string }
}

const CATEGORIES = ['Tasks', 'Tools', 'Team', 'Comms', 'Decisions', 'Knowledge']

function getInitials(name: string) {
  return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
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
    if (a.onboardingMessages.length === 0) kickstartInterview(a, company)
  }, [agentId])

  async function kickstartInterview(a: Agent, company: string) {
    setIsLoading(true)
    try {
      const res = await fetch('/api/onboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agentId: a.id, agentName: a.name, agentRole: a.role, companyName: company, messages: [] }),
      })
      const { message } = await res.json() as { message: Message; isComplete: boolean }
      agentStore.addOnboardingMessage(a.id, message)
      setMessages([message])
    } finally {
      setIsLoading(false)
    }
  }

  async function sendMessage(userContent: string) {
    if (!agent) return
    const userMessage: Message = { role: 'user', content: userContent, timestamp: new Date().toISOString() }
    agentStore.addOnboardingMessage(agentId, userMessage)
    const updatedMessages = [...messages, userMessage]
    setMessages(updatedMessages)
    setIsLoading(true)
    try {
      const res = await fetch('/api/onboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agentId, agentName: agent.name, agentRole: agent.role, companyName, messages: updatedMessages }),
      })
      const { message, isComplete } = await res.json() as { message: Message; isComplete: boolean }
      agentStore.addOnboardingMessage(agentId, message)
      const finalMessages = [...updatedMessages, message]
      setMessages(finalMessages)
      if (isComplete) {
        agentStore.completeOnboarding(agentId, buildKB(finalMessages, agent))
        router.push(`/agent/${agentId}`)
      }
    } catch {
      const err: Message = { role: 'assistant', content: 'Something went wrong. Please try again.', timestamp: new Date().toISOString() }
      setMessages(prev => [...prev, err])
    } finally {
      setIsLoading(false)
    }
  }

  function buildKB(msgs: Message[], a: Agent): KnowledgeBase {
    const last = [...msgs].reverse().find(m => m.role === 'assistant')
    const summary = (last?.content ?? '').replace(/ONBOARDING_COMPLETE\s*/g, '').trim()
    return {
      agentId: a.id,
      completedAt: new Date().toISOString(),
      categories: { tasks: [], tools: [], team: [], comms: [], decisions: [], knowledge: [] },
      rawTranscript: msgs,
      summary,
    }
  }

  const userTurns = messages.filter(m => m.role === 'user').length
  const covered = Math.min(6, Math.floor(userTurns / 2) + (userTurns % 2 === 1 ? 1 : 0))

  if (!agent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-organa-bg">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
          className="w-8 h-8 border-2 border-organa-accent border-t-transparent rounded-full"
        />
      </div>
    )
  }

  return (
    <main className="min-h-screen flex flex-col bg-organa-bg">
      {/* Glass header */}
      <motion.header
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className="glass-header sticky top-0 z-10 px-6 py-4 flex items-center gap-4"
      >
        <motion.button
          onClick={() => {
            const backTo = getCurrentUser().role === 'employee' ? '/home' : '/'
            router.push(backTo)
          }}
          whileHover={{ x: -2 }}
          whileTap={{ scale: 0.95 }}
          className="text-organa-text-secondary hover:text-organa-text transition-colors flex items-center gap-1.5 text-sm"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M10 3L5 8L10 13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Back
        </motion.button>

        <div className="flex items-center gap-3 flex-1">
          <div className="w-9 h-9 rounded-full bg-organa-accent flex items-center justify-center text-white text-xs font-bold">
            {getInitials(agent.name)}
          </div>
          <div>
            <h1 className="text-[15px] font-semibold text-organa-text leading-none">{agent.name}</h1>
            <p className="text-organa-text-muted text-xs mt-0.5">{agent.role} · {companyName}</p>
          </div>
        </div>

        {/* Category progress */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-1.5">
            {CATEGORIES.map((cat, i) => (
              <motion.div
                key={cat}
                title={cat}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.1 + i * 0.05, type: 'spring', stiffness: 300 }}
                className={`h-2 rounded-full transition-all duration-500 ${
                  i < covered
                    ? 'bg-organa-success w-6'
                    : i === covered
                    ? 'bg-organa-accent w-4 opacity-60'
                    : 'bg-gray-200 w-2'
                }`}
              />
            ))}
          </div>
          <span className="text-xs text-organa-text-muted font-medium bg-white px-2.5 py-1 rounded-full shadow-card">
            {covered}/6 topics
          </span>
        </div>
      </motion.header>

      {/* Intro banner — shown before first user message */}
      {messages.length <= 1 && !isLoading && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          className="mx-6 mt-4 p-4 bg-organa-accent-light border border-blue-100 rounded-2xl flex items-start gap-3"
        >
          <div className="w-8 h-8 bg-organa-accent rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M7 1.5C4 1.5 1.5 4 1.5 7S4 12.5 7 12.5 12.5 10 12.5 7 10 1.5 7 1.5z" stroke="white" strokeWidth="1.2"/>
              <path d="M7 6v4M7 4.5v.5" stroke="white" strokeWidth="1.4" strokeLinecap="round"/>
            </svg>
          </div>
          <div>
            <p className="text-organa-accent font-semibold text-sm">Interview starting</p>
            <p className="text-organa-text-secondary text-xs mt-0.5 leading-relaxed">
              Answer as {agent.name}. ARIA will guide you through 6 categories — this takes about 10 minutes.
            </p>
          </div>
        </motion.div>
      )}

      {/* Chat */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.4 }}
        className="flex-1 overflow-hidden flex flex-col"
      >
        <ChatInterface
          messages={messages}
          onSend={sendMessage}
          isLoading={isLoading}
          placeholder={`Answer as ${agent.name}...`}
        />
      </motion.div>
    </main>
  )
}
