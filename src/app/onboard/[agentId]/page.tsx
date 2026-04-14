'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import ChatInterface from '@/components/ChatInterface'
import { agentStore } from '@/lib/agent-store'
import { getCurrentUser } from '@/lib/auth'
import { NOVA_AGENCY_DEMO, NOVA_COMMERCE_DEMO } from '@/lib/demo-data'
import type { Agent, Message, KnowledgeBase } from '@/lib/types'

interface Props {
  params: { agentId: string }
}

const CATEGORIES = ['Tasks', 'Tools', 'Team', 'Comms', 'Decisions', 'Knowledge']

function getInitials(name: string) {
  return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
}

const AVATAR_COLORS = ['#0071E3', '#6D28D9', '#059669', '#D97706', '#DB2777', '#4F46E5']
function avatarColor(name: string) {
  const h = name.split('').reduce((a, c) => a + c.charCodeAt(0), 0)
  return AVATAR_COLORS[h % AVATAR_COLORS.length]!
}

function tryLoadDemoAgent(agentId: string): Agent | null {
  // Check if the agent exists in any demo dataset and seed if needed
  const allDemos = [NOVA_AGENCY_DEMO, NOVA_COMMERCE_DEMO]
  for (const demo of allDemos) {
    const found = demo.agents.find(a => a.id === agentId)
    if (found) {
      // Seed the entire demo company so related agents are also available
      if (agentStore.getAllAgents().length === 0) {
        agentStore.seedDemoCompany(demo)
      }
      return agentStore.getAgent(agentId) ?? found
    }
  }
  return null
}

export default function OnboardPage({ params }: Props) {
  const router = useRouter()
  const { agentId } = params

  const [agent, setAgent] = useState<Agent | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [companyName, setCompanyName] = useState('Nova Agency')
  const [startError, setStartError] = useState<string | null>(null)

  useEffect(() => {
    let a = agentStore.getAgent(agentId)
    if (!a) {
      a = tryLoadDemoAgent(agentId)
    }
    if (!a) { router.push('/'); return }
    if (a.onboardingComplete) { router.push(`/agent/${agentId}`); return }
    setAgent(a)
    setMessages(a.onboardingMessages)
    const company = agentStore.getCompanyName()
    setCompanyName(company)
    if (a.onboardingMessages.length === 0) void kickstartInterview(a, company)
  }, [agentId])

  async function kickstartInterview(a: Agent, company: string) {
    setIsLoading(true)
    setStartError(null)
    try {
      const res = await fetch('/api/onboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agentId: a.id, agentName: a.name, agentRole: a.role, companyName: company, messages: [] }),
      })
      const data = await res.json() as { message?: Message; error?: string }
      if (!data.message) throw new Error(data.error ?? 'No message returned')
      agentStore.addOnboardingMessage(a.id, data.message)
      setMessages([data.message])
    } catch (e) {
      setStartError(e instanceof Error ? e.message : 'Failed to start interview. Check your API key.')
    } finally {
      setIsLoading(false)
    }
  }

  async function sendMessage(userContent: string) {
    if (!agent) return
    const userMsg: Message = { role: 'user', content: userContent, timestamp: new Date().toISOString() }
    agentStore.addOnboardingMessage(agentId, userMsg)
    const updated = [...messages, userMsg]
    setMessages(updated)
    setIsLoading(true)
    try {
      const res = await fetch('/api/onboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agentId, agentName: agent.name, agentRole: agent.role, companyName, messages: updated }),
      })
      const { message, isComplete } = await res.json() as { message: Message; isComplete: boolean }
      agentStore.addOnboardingMessage(agentId, message)
      const final = [...updated, message]
      setMessages(final)
      if (isComplete) {
        agentStore.completeOnboarding(agentId, buildKB(final, agent))
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
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
          className="w-8 h-8 border-2 border-organa-accent border-t-transparent rounded-full"
        />
      </div>
    )
  }

  const color = avatarColor(agent.name)

  return (
    <main className="min-h-screen flex flex-col bg-organa-bg">

      {/* ── Header ── */}
      <motion.header
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="sticky top-0 z-10 bg-white/90 backdrop-blur-xl border-b border-organa-border px-5 py-3 flex items-center gap-4"
      >
        {/* Back */}
        <motion.button
          onClick={() => {
            const backTo = getCurrentUser().role === 'employee' ? '/home' : '/'
            router.push(backTo)
          }}
          whileHover={{ x: -2 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-1.5 text-sm text-organa-text-secondary hover:text-organa-text transition-colors flex-shrink-0"
        >
          <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
            <path d="M10 3L5 8L10 13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Back
        </motion.button>

        {/* Agent identity */}
        <div className="flex items-center gap-2.5 flex-1 min-w-0">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[11px] font-bold flex-shrink-0"
            style={{ background: color }}
          >
            {getInitials(agent.name)}
          </div>
          <div className="min-w-0">
            <p className="text-[13px] font-semibold text-organa-text leading-none truncate">{agent.name}</p>
            <p className="text-[11px] text-organa-text-muted mt-0.5 truncate">{agent.role} · {companyName}</p>
          </div>
        </div>

        {/* Category chips */}
        <div className="hidden md:flex items-center gap-1">
          {CATEGORIES.map((cat, i) => (
            <motion.span
              key={cat}
              title={cat}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.04 * i, type: 'spring', stiffness: 400 }}
              className={`px-2 py-0.5 rounded-full text-[10px] font-medium border transition-all duration-300 ${
                i < covered
                  ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                  : i === covered
                  ? 'bg-blue-50 text-organa-accent border-blue-200'
                  : 'bg-gray-50 text-organa-text-muted border-gray-100'
              }`}
            >
              {cat}
            </motion.span>
          ))}
        </div>

        <span className="text-[11px] text-organa-text-muted font-medium bg-organa-bg px-2.5 py-1 rounded-full border border-organa-border flex-shrink-0">
          {covered}/6
        </span>
      </motion.header>

      {/* ── Error banner ── */}
      <AnimatePresence>
        {startError && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mx-5 mt-4 p-3.5 bg-red-50 border border-red-100 rounded-2xl flex items-center justify-between gap-3"
          >
            <p className="text-red-600 text-sm leading-snug">{startError}</p>
            <button
              onClick={() => void kickstartInterview(agent, companyName)}
              className="text-red-600 text-xs font-semibold underline whitespace-nowrap flex-shrink-0"
            >
              Try again
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Intro banner ── */}
      <AnimatePresence>
        {messages.length <= 1 && !isLoading && !startError && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, height: 0, marginTop: 0, marginLeft: 0, marginRight: 0, padding: 0 }}
            transition={{ delay: 0.25, duration: 0.35 }}
            className="mx-5 mt-4 p-4 bg-blue-50 border border-blue-100 rounded-2xl flex items-start gap-3"
          >
            <div className="w-8 h-8 bg-organa-accent rounded-xl flex items-center justify-center flex-shrink-0">
              <svg width="14" height="14" viewBox="0 0 20 20" fill="none">
                <circle cx="10" cy="5" r="2.5" fill="white"/>
                <circle cx="4" cy="14" r="2.5" fill="white" opacity="0.7"/>
                <circle cx="16" cy="14" r="2.5" fill="white" opacity="0.7"/>
                <line x1="10" y1="7.5" x2="4" y2="11.5" stroke="white" strokeWidth="1.2" opacity="0.7"/>
                <line x1="10" y1="7.5" x2="16" y2="11.5" stroke="white" strokeWidth="1.2" opacity="0.7"/>
              </svg>
            </div>
            <div>
              <p className="text-organa-accent font-semibold text-sm">Interview starting</p>
              <p className="text-organa-text-secondary text-[12px] mt-0.5 leading-relaxed">
                Answer as {agent.name}. ARIA will guide you through 6 categories — takes about 10 minutes.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Chat ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.15, duration: 0.4 }}
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
