'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import type { LearningItem } from '@/lib/mock-data-employee'

interface Props {
  item: LearningItem
  isLast?: boolean
}

export default function LearningFeedItem({ item, isLast }: Props) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="relative flex gap-4">
      {/* Timeline vertical line */}
      {!isLast && (
        <div className="absolute left-5 top-10 bottom-0 w-px bg-organa-border" />
      )}

      {/* Icon circle */}
      <div className="relative z-10 flex-shrink-0 w-10 h-10 rounded-full bg-organa-bg border border-organa-border flex items-center justify-center text-lg">
        {item.icon}
      </div>

      {/* Content */}
      <div className="flex-1 pb-6 min-w-0">
        <div className="flex items-start justify-between gap-3">
          <p className="text-sm text-organa-text leading-relaxed">{item.message}</p>
          <span className="text-xs text-organa-text-muted flex-shrink-0 mt-0.5 tabular-nums">
            {item.time}
          </span>
        </div>

        <button
          onClick={() => setExpanded(e => !e)}
          className="mt-1.5 flex items-center gap-1 text-xs text-organa-accent hover:text-organa-accent-hover transition-colors"
        >
          {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          {expanded ? 'Ocultar detalle' : 'Ver detalle'}
        </button>

        {expanded && (
          <div className="mt-2 px-3 py-2.5 bg-organa-bg rounded-xl border border-organa-border">
            <p className="text-xs text-organa-text-secondary leading-relaxed">{item.detail}</p>
          </div>
        )}
      </div>
    </div>
  )
}
