'use client'

// src/components/ChatInterface.tsx
// Reusable chat UI — used in both /onboard and /agent screens
// Renders messages + text input. Calls onSend when user submits.

import { useState, useRef, useEffect } from 'react'
import type { Message } from '@/lib/types'

interface Props {
  messages: Message[]
  onSend: (content: string) => void
  isLoading: boolean
  placeholder?: string
}

export default function ChatInterface({ messages, onSend, isLoading, placeholder = 'Type a message...' }: Props) {
  const [input, setInput] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  function handleSubmit(e?: React.FormEvent) {
    e?.preventDefault()
    const content = input.trim()
    if (!content || isLoading) return
    setInput('')
    onSend(content)
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    // Send on Enter, newline on Shift+Enter
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Messages list */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-organa-accent text-white rounded-br-sm'
                  : 'bg-organa-surface border border-organa-border text-organa-text rounded-bl-sm'
              }`}
            >
              {/* TODO: Implement markdown rendering for assistant messages (simple nl2br is fine for MVP) */}
              {msg.content.split('\n').map((line, i) => (
                <span key={i}>
                  {line}
                  {i < msg.content.split('\n').length - 1 && <br />}
                </span>
              ))}
            </div>
          </div>
        ))}

        {/* Loading indicator */}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-organa-surface border border-organa-border rounded-2xl rounded-bl-sm px-4 py-3">
              {/* TODO: Replace with animated dots */}
              <span className="text-organa-text-muted text-sm">Thinking...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="border-t border-organa-border p-4">
        <form onSubmit={handleSubmit} className="flex gap-3 items-end">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={isLoading}
            rows={1}
            className="flex-1 bg-organa-surface border border-organa-border rounded-xl px-4 py-3 text-organa-text placeholder-organa-text-muted text-sm resize-none focus:outline-none focus:border-organa-accent transition-colors disabled:opacity-50"
            style={{ minHeight: '48px', maxHeight: '160px' }}
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="px-4 py-3 bg-organa-accent hover:bg-organa-accent-hover disabled:opacity-40 disabled:cursor-not-allowed rounded-xl text-white text-sm font-medium transition-colors"
          >
            Send
          </button>
        </form>
        <p className="text-organa-text-muted text-xs mt-2 text-center">
          Enter to send · Shift+Enter for new line
        </p>
      </div>
    </div>
  )
}
