'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { Message } from '@/lib/types'

interface Props {
  messages: Message[]
  onSend: (content: string) => void
  isLoading: boolean
  placeholder?: string
}

function TypingDots() {
  return (
    <div className="flex items-center gap-1.5 py-0.5">
      {[0, 0.16, 0.32].map((delay, i) => (
        <motion.span
          key={i}
          animate={{ y: [0, -4, 0], opacity: [0.35, 1, 0.35] }}
          transition={{ duration: 0.85, repeat: Infinity, delay, ease: 'easeInOut' }}
          className="w-2 h-2 rounded-full bg-organa-accent/60 block"
        />
      ))}
    </div>
  )
}

function ARIAAvatar() {
  return (
    <div className="w-7 h-7 rounded-full bg-organa-accent flex items-center justify-center flex-shrink-0 shadow-button">
      <svg width="12" height="12" viewBox="0 0 20 20" fill="none">
        <circle cx="10" cy="5" r="2.5" fill="white"/>
        <circle cx="4" cy="14" r="2.5" fill="white" opacity="0.7"/>
        <circle cx="16" cy="14" r="2.5" fill="white" opacity="0.7"/>
        <line x1="10" y1="7.5" x2="4" y2="11.5" stroke="white" strokeWidth="1.2" opacity="0.7"/>
        <line x1="10" y1="7.5" x2="16" y2="11.5" stroke="white" strokeWidth="1.2" opacity="0.7"/>
      </svg>
    </div>
  )
}

export default function ChatInterface({ messages, onSend, isLoading, placeholder = 'Type a message...' }: Props) {
  const [input, setInput] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  useEffect(() => {
    const ta = textareaRef.current
    if (!ta) return
    ta.style.height = 'auto'
    ta.style.height = `${Math.min(ta.scrollHeight, 160)}px`
  }, [input])

  function handleSubmit(e?: React.FormEvent) {
    e?.preventDefault()
    const content = input.trim()
    if (!content || isLoading) return
    setInput('')
    if (textareaRef.current) textareaRef.current.style.height = 'auto'
    onSend(content)
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-2xl mx-auto space-y-5">
          <AnimatePresence initial={false}>
            {messages.map((msg, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start items-end'}`}
              >
                {msg.role === 'assistant' && <ARIAAvatar />}
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 text-[14px] leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-organa-accent text-white rounded-tr-sm'
                      : 'bg-white shadow-card border border-organa-border text-organa-text rounded-tl-sm'
                  }`}
                >
                  {msg.content
                    .replace(/ONBOARDING_COMPLETE\s*/g, '')
                    .trim()
                    .split('\n')
                    .map((line, i, arr) => (
                      <span key={i}>{line}{i < arr.length - 1 && <br />}</span>
                    ))}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Typing indicator */}
          <AnimatePresence>
            {isLoading && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 4 }}
                transition={{ duration: 0.2 }}
                className="flex gap-2.5 items-end"
              >
                <ARIAAvatar />
                <div className="bg-white shadow-card border border-organa-border rounded-2xl rounded-tl-sm px-4 py-3">
                  <TypingDots />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="bg-white border-t border-organa-border px-4 py-4">
        <form onSubmit={handleSubmit} className="max-w-2xl mx-auto">
          <div className="flex gap-2 items-end bg-organa-bg border border-organa-border rounded-2xl px-4 py-2.5 focus-within:border-organa-accent transition-all">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              disabled={isLoading}
              rows={1}
              className="flex-1 bg-transparent text-organa-text placeholder-organa-text-muted text-sm resize-none focus:outline-none disabled:opacity-50 py-0.5"
              style={{ minHeight: '24px' }}
            />
            <motion.button
              type="submit"
              disabled={!input.trim() || isLoading}
              whileTap={{ scale: 0.9 }}
              className="w-8 h-8 bg-organa-accent disabled:opacity-30 rounded-xl flex items-center justify-center flex-shrink-0 transition-opacity shadow-button"
            >
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                <path d="M14 8L2 8M14 8L9 3M14 8L9 13" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </motion.button>
          </div>
          <p className="text-organa-text-muted text-[11px] mt-2 text-center">
            Enter to send · Shift+Enter for new line
          </p>
        </form>
      </div>
    </div>
  )
}
