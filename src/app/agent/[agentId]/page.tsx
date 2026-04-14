'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import ThinkingBlock from '@/components/ThinkingBlock'
import MarkdownMessage from '@/components/MarkdownMessage'
import { agentStore } from '@/lib/agent-store'
import { getCurrentUser } from '@/lib/auth'
import type { Agent } from '@/lib/types'
import type { AgentStreamEvent } from '@/lib/claude'

interface Props {
  params: { agentId: string }
}

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  timestamp: string
  thinking?: string
  thinkingSeconds?: number
}

const SUGGESTED = [
  'What does your typical week look like?',
  'What tools do you use daily and how?',
  'What should a new person in your role know in week 1?',
]

function getInitials(name: string) {
  return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
}

function getAvatarColor(name: string): string {
  const colors = ['#0071E3','#34C759','#FF9F0A','#FF375F','#BF5AF2','#32ADE6','#FF6961','#30D158']
  let hash = 0
  for (const c of name) hash = (hash * 31 + c.charCodeAt(0)) & 0xFFFF
  return colors[hash % colors.length]
}

export default function AgentChatPage({ params }: Props) {
  const router = useRouter()
  const { agentId } = params

  const [agent, setAgent] = useState<Agent | null>(null)
  const [companyName, setCompanyName] = useState('Nova Agency')
  const [messages, setMessages] = useState<ChatMessage[]>([])

  // Streaming state
  const [streamPhase, setStreamPhase] = useState<'idle' | 'thinking' | 'responding'>('idle')
  const [streamingThinking, setStreamingThinking] = useState('')
  const [streamingText, setStreamingText] = useState('')
  const [thinkingSeconds, setThinkingSeconds] = useState(0)

  const [input, setInput] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const a = agentStore.getAgent(agentId)
    if (!a) { router.push('/'); return }
    if (!a.onboardingComplete) { router.push(`/onboard/${agentId}`); return }
    setAgent(a)
    setCompanyName(agentStore.getCompanyName())
  }, [agentId])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, streamingThinking, streamingText])

  // Auto-resize textarea
  useEffect(() => {
    const ta = textareaRef.current
    if (!ta) return
    ta.style.height = 'auto'
    ta.style.height = `${Math.min(ta.scrollHeight, 160)}px`
  }, [input])

  const isLoading = streamPhase !== 'idle'

  async function sendMessage(userContent: string) {
    if (!agent?.knowledgeBase || isLoading) return

    const userMsg: ChatMessage = {
      role: 'user',
      content: userContent,
      timestamp: new Date().toISOString(),
    }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setStreamingThinking('')
    setStreamingText('')
    setStreamPhase('thinking')

    const allMessages = [...messages, userMsg].map(m => ({
      role: m.role,
      content: m.content,
      timestamp: m.timestamp,
    }))

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
          messages: allMessages,
        }),
      })

      if (!res.body) throw new Error('No response body')

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let thinkingAcc = ''
      let textAcc = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        const lines = chunk.split('\n')

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          const raw = line.slice(6).trim()
          if (!raw) continue

          let event: AgentStreamEvent
          try {
            event = JSON.parse(raw) as AgentStreamEvent
          } catch {
            continue
          }

          if (event.type === 'thinking') {
            thinkingAcc += event.text
            setStreamingThinking(thinkingAcc)
            setStreamPhase('thinking')
          } else if (event.type === 'text') {
            textAcc += event.text
            setStreamingText(textAcc)
            setStreamPhase('responding')
          } else if (event.type === 'done') {
            setThinkingSeconds(event.thinkingSeconds)
            const assistantMsg: ChatMessage = {
              role: 'assistant',
              content: textAcc || 'No response generated.',
              timestamp: new Date().toISOString(),
              thinking: thinkingAcc || undefined,
              thinkingSeconds: event.thinkingSeconds,
            }
            setMessages(prev => [...prev, assistantMsg])
            setStreamPhase('idle')
            setStreamingThinking('')
            setStreamingText('')
            // Award points for completed chat message
            agentStore.addPoints(agentId, 'CHAT_MESSAGE', `Chat con ${agent.name}`)
          } else if (event.type === 'error') {
            const errMsg: ChatMessage = {
              role: 'assistant',
              content: `Error: ${event.message}`,
              timestamp: new Date().toISOString(),
            }
            setMessages(prev => [...prev, errMsg])
            setStreamPhase('idle')
          }
        }
      }
    } catch (err) {
      const errMsg: ChatMessage = {
        role: 'assistant',
        content: err instanceof Error ? `Error: ${err.message}` : 'Something went wrong.',
        timestamp: new Date().toISOString(),
      }
      setMessages(prev => [...prev, errMsg])
      setStreamPhase('idle')
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      if (input.trim()) sendMessage(input.trim())
    }
  }

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

  const avatarColor = getAvatarColor(agent.name)
  const firstName = agent.name.split(' ')[0]
  const trainedDate = agent.knowledgeBase
    ? new Date(agent.knowledgeBase.completedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    : null

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
          <div className="relative flex-shrink-0">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold"
              style={{ backgroundColor: avatarColor }}
            >
              {getInitials(agent.name)}
            </div>
            <motion.div
              animate={{ scale: [1, 1.5], opacity: [0.4, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeOut' }}
              className="absolute inset-0 rounded-full"
              style={{ backgroundColor: avatarColor }}
            />
            <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-organa-success rounded-full border-2 border-white" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-[15px] font-semibold text-organa-text leading-none">{agent.name}</h1>
              <span className="text-xs bg-organa-success-light text-organa-success px-2 py-0.5 rounded-full font-medium">
                AI Twin
              </span>
              {streamPhase === 'thinking' && (
                <motion.span
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-xs bg-organa-accent-light text-organa-accent px-2 py-0.5 rounded-full font-medium flex items-center gap-1"
                >
                  <motion.span
                    animate={{ opacity: [1, 0.4, 1] }}
                    transition={{ duration: 1.2, repeat: Infinity }}
                  >
                    ◆
                  </motion.span>
                  Thinking
                </motion.span>
              )}
              {streamPhase === 'responding' && (
                <motion.span
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-xs bg-green-50 text-organa-success px-2 py-0.5 rounded-full font-medium"
                >
                  Responding
                </motion.span>
              )}
            </div>
            <p className="text-organa-text-muted text-xs mt-0.5">
              {agent.role} · {companyName}
              {trainedDate && <span className="ml-1.5">· Trained {trainedDate}</span>}
            </p>
          </div>
        </div>
      </motion.header>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-6 py-4">

        {/* Welcome + suggested — only when no messages yet */}
        <AnimatePresence>
          {messages.length === 0 && streamPhase === 'idle' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8, transition: { duration: 0.2 } }}
              transition={{ delay: 0.2, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="bg-white rounded-2xl shadow-card p-5 mb-5 flex items-start gap-4">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                  style={{ backgroundColor: avatarColor }}
                >
                  {getInitials(agent.name)}
                </div>
                <div>
                  <p className="font-semibold text-organa-text text-[15px]">
                    Hi, I&apos;m {firstName}&apos;s AI twin.
                  </p>
                  <p className="text-organa-text-secondary text-sm mt-1 leading-relaxed">
                    I reason through your question using everything I learned in my training interview before responding. Ask me anything about my role.
                  </p>
                </div>
              </div>

              <p className="text-organa-text-muted text-xs mb-2.5 font-medium uppercase tracking-wide">
                Try asking
              </p>
              <div className="flex flex-col gap-2 mb-4">
                {SUGGESTED.map((q, i) => (
                  <motion.button
                    key={q}
                    onClick={() => sendMessage(q)}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + i * 0.07, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                    whileHover={{ x: 4 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full text-left p-3.5 bg-white rounded-xl shadow-card text-organa-text-secondary text-sm hover:text-organa-accent hover:border-organa-accent border border-organa-border transition-colors flex items-center justify-between group"
                  >
                    <span>{q}</span>
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                      <path d="M3 7h8M8 4l3 3-3 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Message history */}
        <div className="space-y-4">
          <AnimatePresence initial={false}>
            {messages.map((msg, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
              >
                {/* Thinking block for assistant messages */}
                {msg.role === 'assistant' && msg.thinking && (
                  <ThinkingBlock
                    content={msg.thinking}
                    isStreaming={false}
                    thinkingSeconds={msg.thinkingSeconds}
                  />
                )}

                {/* Message bubble */}
                <div
                  className={`max-w-[78%] rounded-2xl px-4 py-2.5 ${
                    msg.role === 'user'
                      ? 'bg-organa-accent text-white rounded-br-md text-[14px] leading-relaxed'
                      : 'bg-white shadow-card text-organa-text rounded-bl-md border border-organa-border'
                  }`}
                >
                  {msg.role === 'user' ? (
                    msg.content.split('\n').map((line, i, arr) => (
                      <span key={i}>{line}{i < arr.length - 1 && <br />}</span>
                    ))
                  ) : (
                    <MarkdownMessage content={msg.content} />
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Live streaming area */}
          {streamPhase !== 'idle' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-start"
            >
              {/* Live ThinkingBlock */}
              {(streamingThinking || streamPhase === 'thinking') && (
                <ThinkingBlock
                  content={streamingThinking}
                  isStreaming={streamPhase === 'thinking'}
                  thinkingSeconds={thinkingSeconds}
                />
              )}

              {/* Streaming response text — markdown rendered live */}
              {streamPhase === 'responding' && (
                <div className="max-w-[78%] rounded-2xl rounded-bl-md px-4 py-2.5 bg-white shadow-card border border-organa-border">
                  {streamingText ? (
                    <MarkdownMessage content={streamingText} streaming />
                  ) : (
                    <motion.span
                      animate={{ opacity: [0.4, 1, 0.4] }}
                      transition={{ duration: 1, repeat: Infinity }}
                      className="text-organa-text-muted text-sm"
                    >
                      …
                    </motion.span>
                  )}
                </div>
              )}
            </motion.div>
          )}
        </div>

        <div ref={messagesEndRef} />
      </div>

      {/* Input bar */}
      <div className="border-t border-organa-border bg-white/70 backdrop-blur px-4 py-3 sticky bottom-0">
        <div className="flex gap-2 items-end max-w-4xl mx-auto">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isLoading ? `${firstName} is thinking…` : `Ask ${firstName} anything…`}
            disabled={isLoading}
            rows={1}
            className="flex-1 bg-organa-bg border border-organa-border rounded-xl px-4 py-2.5 text-organa-text placeholder-organa-text-muted text-sm resize-none focus:outline-none focus:border-organa-accent focus:shadow-input-focus transition-all disabled:opacity-50"
            style={{ minHeight: '44px' }}
          />
          <motion.button
            onClick={() => { if (input.trim()) sendMessage(input.trim()) }}
            disabled={!input.trim() || isLoading}
            whileTap={{ scale: 0.94 }}
            className="px-4 h-[44px] bg-organa-accent hover:bg-organa-accent-hover disabled:opacity-40 disabled:cursor-not-allowed rounded-xl text-white text-sm font-medium transition-colors shadow-button flex-shrink-0"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="mx-auto">
              <path d="M14 8L2 8M14 8L9 3M14 8L9 13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </motion.button>
        </div>
        <p className="text-organa-text-muted text-[11px] mt-1.5 text-center">
          Extended thinking enabled · Enter to send
        </p>
      </div>
    </main>
  )
}
