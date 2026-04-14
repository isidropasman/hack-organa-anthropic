'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { X, Send } from 'lucide-react'
import BrainMessage, { TypingIndicator, type Message } from './BrainMessage'
import { getBrainResponse } from '@/lib/brain-docs'

interface Props {
  onClose: () => void
}

const WELCOME: Message = {
  id: 'welcome',
  role: 'bot',
  text: "Hi! I'm Nova Agency's **Organizational Brain**. I have access to all organizational knowledge: suppliers, logistics, finance, marketing, support, and more.\n\nWhat would you like to know?",
  ts: Date.now(),
}

export default function BrainChat({ onClose }: Props) {
  const [messages, setMessages] = useState<Message[]>([WELCOME])
  const [input, setInput] = useState('')
  const [typing, setTyping] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef  = useRef<HTMLInputElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, typing])

  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 120)
  }, [])

  const send = useCallback(() => {
    const text = input.trim()
    if (!text || typing) return

    const userMsg: Message = { id: `u-${Date.now()}`, role: 'user', text, ts: Date.now() }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setTyping(true)

    const delay = 1000 + Math.random() * 800
    setTimeout(() => {
      const response = getBrainResponse(text)
      const botMsg: Message = { id: `b-${Date.now()}`, role: 'bot', text: response, ts: Date.now() }
      setMessages(prev => [...prev, botMsg])
      setTyping(false)
    }, delay)
  }, [input, typing])

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send()
    }
  }

  return (
    <div
      className="fixed bottom-0 right-0 flex flex-col z-50 overflow-hidden"
      style={{
        width: 'min(420px, 40vw)',
        height: '72vh',
        background: '#0D0D1A',
        borderLeft: '1px solid rgba(79,107,237,0.2)',
        borderTop: '1px solid rgba(79,107,237,0.2)',
        borderTopLeftRadius: '20px',
        animation: 'chatSlideUp 0.25s cubic-bezier(0.16,1,0.3,1)',
        boxShadow: '-4px -4px 40px rgba(79,107,237,0.12)',
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3.5 flex-shrink-0"
        style={{ borderBottom: '1px solid rgba(79,107,237,0.15)', background: '#0F0F1E' }}
      >
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center text-base"
            style={{ background: 'rgba(79,107,237,0.15)', border: '1px solid rgba(79,107,237,0.3)' }}
          >
            🧠
          </div>
          <div>
            <p className="text-white text-sm font-semibold leading-tight">Nova Agency Brain</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{ background: '#22C55E', boxShadow: '0 0 4px #22C55E' }}
              />
              <span className="text-[11px]" style={{ color: '#22C55E' }}>Online · all org knowledge</span>
            </div>
          </div>
        </div>
        <button
          onClick={onClose}
          className="text-slate-500 hover:text-slate-300 transition-colors p-1 rounded-lg hover:bg-white/5"
        >
          <X size={16} />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 min-h-0">
        {messages.map(msg => (
          <BrainMessage key={msg.id} message={msg} userInitials="YOU" />
        ))}
        {typing && <TypingIndicator />}
        <div ref={bottomRef} />
      </div>

      {/* Suggested prompts */}
      {messages.length === 1 && !typing && (
        <div className="px-4 pb-3 flex-shrink-0">
          <p className="text-[10px] text-slate-600 mb-2 font-medium uppercase tracking-wider">Quick questions</p>
          <div className="flex flex-wrap gap-1.5">
            {SUGGESTED.map(q => (
              <button
                key={q}
                onClick={() => { setInput(q); setTimeout(() => inputRef.current?.focus(), 0) }}
                className="text-[11px] px-2.5 py-1 rounded-full border transition-all hover:border-organa-accent/50 hover:text-slate-200"
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  borderColor: 'rgba(255,255,255,0.10)',
                  color: '#94A3B8',
                }}
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div
        className="flex items-center gap-2 px-3 py-3 flex-shrink-0"
        style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
      >
        <input
          ref={inputRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Ask Nova Agency anything..."
          disabled={typing}
          className="flex-1 bg-transparent text-sm text-white placeholder-slate-600 outline-none min-w-0"
        />
        <button
          onClick={send}
          disabled={!input.trim() || typing}
          className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-all disabled:opacity-30 hover:opacity-90 active:scale-90"
          style={{ background: '#4F6BED' }}
        >
          <Send size={13} className="text-white" />
        </button>
      </div>

      <style>{`
        @keyframes chatSlideUp {
          from { opacity: 0; transform: translateY(32px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}

const SUGGESTED = [
  'Who is the main supplier?',
  'How do you handle shipping?',
  'How are discounts approved?',
  'Who is on the team?',
]
