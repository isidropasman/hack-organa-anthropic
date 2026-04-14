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
    <div className="flex items-center gap-1 px-1 py-0.5">
      <motion.span
        animate={{ y: [0, -5, 0] }}
        transition={{ duration: 0.9, repeat: Infinity, delay: 0 }}
        className="w-1.5 h-1.5 rounded-full bg-organa-text-muted block"
      />
      <motion.span
        animate={{ y: [0, -5, 0] }}
        transition={{ duration: 0.9, repeat: Infinity, delay: 0.15 }}
        className="w-1.5 h-1.5 rounded-full bg-organa-text-muted block"
      />
      <motion.span
        animate={{ y: [0, -5, 0] }}
        transition={{ duration: 0.9, repeat: Infinity, delay: 0.3 }}
        className="w-1.5 h-1.5 rounded-full bg-organa-text-muted block"
      />
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

  // Auto-resize textarea
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
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
        <AnimatePresence initial={false}>
          {messages.map((msg, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[78%] rounded-2xl px-4 py-2.5 text-[14px] leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-organa-accent text-white rounded-br-md'
                    : 'bg-white shadow-card text-organa-text rounded-bl-md border border-organa-border'
                }`}
              >
                {msg.content.split('\n').map((line, i, arr) => (
                  <span key={i}>
                    {line}
                    {i < arr.length - 1 && <br />}
                  </span>
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
              className="flex justify-start"
            >
              <div className="bg-white shadow-card border border-organa-border rounded-2xl rounded-bl-md px-4 py-2.5">
                <TypingDots />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div ref={messagesEndRef} />
      </div>

      {/* Input bar */}
      <div className="border-t border-organa-border bg-white/60 backdrop-blur px-4 py-3">
        <form onSubmit={handleSubmit} className="flex gap-2 items-end">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={isLoading}
            rows={1}
            className="flex-1 bg-organa-bg border border-organa-border rounded-xl px-4 py-2.5 text-organa-text placeholder-organa-text-muted text-sm resize-none focus:outline-none focus:border-organa-accent focus:shadow-input-focus transition-all disabled:opacity-50"
            style={{ minHeight: '44px' }}
          />
          <motion.button
            type="submit"
            disabled={!input.trim() || isLoading}
            whileTap={{ scale: 0.94 }}
            className="px-4 h-[44px] bg-organa-accent hover:bg-organa-accent-hover disabled:opacity-40 disabled:cursor-not-allowed rounded-xl text-white text-sm font-medium transition-colors shadow-button flex-shrink-0"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="mx-auto">
              <path d="M14 8L2 8M14 8L9 3M14 8L9 13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </motion.button>
        </form>
        <p className="text-organa-text-muted text-[11px] mt-1.5 text-center">
          Enter to send · Shift+Enter for new line
        </p>
      </div>
    </div>
  )
}
