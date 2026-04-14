'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface Props {
  content: string
  isStreaming: boolean
  thinkingSeconds?: number
}

export default function ThinkingBlock({ content, isStreaming, thinkingSeconds }: Props) {
  const [expanded, setExpanded] = useState(true)
  const scrollRef = useRef<HTMLDivElement>(null)

  // Auto-scroll while streaming
  useEffect(() => {
    if (isStreaming && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [content, isStreaming])

  // Collapse when done
  useEffect(() => {
    if (!isStreaming && content) {
      const t = setTimeout(() => setExpanded(false), 600)
      return () => clearTimeout(t)
    }
  }, [isStreaming, content])

  const label = isStreaming
    ? 'Thinking…'
    : `Thought for ${thinkingSeconds ?? 0}s`

  return (
    <div className="my-2 max-w-[78%]">
      {/* Header row */}
      <button
        onClick={() => setExpanded(v => !v)}
        className="flex items-center gap-2 text-xs text-organa-text-muted hover:text-organa-text-secondary transition-colors w-full text-left group"
      >
        {/* Icon */}
        {isStreaming ? (
          <motion.span
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
            className="text-organa-accent"
          >
            ◆
          </motion.span>
        ) : (
          <span className="text-organa-text-muted">◇</span>
        )}

        <span className={`font-medium ${isStreaming ? 'text-organa-accent' : 'text-organa-text-muted'}`}>
          {label}
        </span>

        {/* Chevron */}
        {!isStreaming && (
          <motion.svg
            animate={{ rotate: expanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
            width="12"
            height="12"
            viewBox="0 0 12 12"
            fill="none"
            className="ml-1 text-organa-text-muted group-hover:text-organa-text-secondary"
          >
            <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
          </motion.svg>
        )}

        {/* Streaming word count indicator */}
        {isStreaming && content && (
          <span className="ml-auto text-[10px] text-organa-text-muted tabular-nums">
            {content.split(/\s+/).filter(Boolean).length} words
          </span>
        )}
      </button>

      {/* Content */}
      <AnimatePresence initial={false}>
        {(expanded || isStreaming) && (
          <motion.div
            key="thinking-content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div
              ref={scrollRef}
              className={`
                mt-1.5 rounded-xl border-l-2 bg-gray-50 px-3.5 py-3
                text-[12.5px] leading-relaxed font-mono text-organa-text-muted
                max-h-56 overflow-y-auto
                ${isStreaming ? 'border-organa-accent' : 'border-gray-200'}
              `}
            >
              {content || (
                <span className="text-organa-text-muted italic">Starting to think…</span>
              )}
              {/* Blinking cursor while streaming */}
              {isStreaming && (
                <motion.span
                  animate={{ opacity: [1, 0, 1] }}
                  transition={{ duration: 0.8, repeat: Infinity }}
                  className="inline-block w-1.5 h-3.5 bg-organa-accent ml-0.5 align-middle"
                />
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
