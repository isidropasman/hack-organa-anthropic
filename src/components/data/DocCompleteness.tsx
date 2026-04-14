'use client'

import { useState } from 'react'
import { ClipboardList, ChevronDown } from 'lucide-react'
import DocCompletenessHeader from './DocCompletenessHeader'
import MissingDocCard from './MissingDocCard'
import OwnerDocGroup from './OwnerDocGroup'
import { getMissingByPriority, getMissingByOwner, type ExpectedDoc } from '@/lib/doc-analysis'

type View = 'priority' | 'owner'
type PriorityKey = 'critical' | 'important' | 'niceToHave'

const { critical, important, niceToHave } = getMissingByPriority()
const byOwner = getMissingByOwner()

function PriorityGroup({
  title,
  color,
  docs,
  expanded,
  onToggle,
}: {
  title: string
  color: string
  docs: ExpectedDoc[]
  expanded: boolean
  onToggle: () => void
}) {
  if (docs.length === 0) return null

  return (
    <div>
      <button
        onClick={onToggle}
        className="flex items-center justify-between w-full py-2.5 px-3.5 rounded-xl transition-colors bg-white border border-slate-200 hover:bg-slate-50"
      >
        <div className="flex items-center gap-2.5">
          <span
            className="w-2 h-2 rounded-full flex-shrink-0"
            style={{ background: color }}
          />
          <span className="text-slate-800 text-sm font-medium">{title}</span>
          <span className="text-slate-500 text-xs">
            {docs.length} missing
          </span>
        </div>
        <ChevronDown
          size={14}
          className="text-slate-400"
          style={{
            transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s ease',
          }}
        />
      </button>

      {expanded && (
        <div className="mt-2 space-y-2">
          {docs.map(doc => (
            <MissingDocCard key={doc.id} doc={doc} />
          ))}
        </div>
      )}
    </div>
  )
}

function ToggleBtn({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      className="px-3 py-1.5 rounded-md text-xs font-medium transition-all"
      style={{
        background: active ? 'rgba(79,107,237,0.08)' : 'transparent',
        color:      active ? '#4F6BED' : '#64748B',
        border:     active ? '1px solid rgba(79,107,237,0.25)' : '1px solid transparent',
      }}
    >
      {children}
    </button>
  )
}

export default function DocCompleteness() {
  const [view, setView] = useState<View>('priority')
  const [expanded, setExpanded] = useState<PriorityKey | null>('critical')

  function toggle(key: PriorityKey) {
    setExpanded(prev => (prev === key ? null : key))
  }

  return (
    <div className="px-8 py-6 bg-white border-t border-slate-200">
      {/* Section header */}
      <div className="flex items-center justify-between gap-4 mb-5">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-cyan-50 border border-cyan-200">
            <ClipboardList size={13} className="text-cyan-600" />
          </div>
          <div>
            <h2 className="text-organa-text text-sm font-semibold">Document Completeness</h2>
            <p className="text-organa-text-muted text-xs">Knowledge base gap analysis</p>
          </div>
        </div>

        {/* View toggle */}
        <div className="flex items-center gap-1 rounded-lg p-1 bg-slate-100 border border-slate-200">
          <ToggleBtn active={view === 'priority'} onClick={() => setView('priority')}>
            By Priority
          </ToggleBtn>
          <ToggleBtn active={view === 'owner'} onClick={() => setView('owner')}>
            By Owner
          </ToggleBtn>
        </div>
      </div>

      <div style={{ maxWidth: '760px' }}>
        {/* Score + progress */}
        <DocCompletenessHeader />

        {/* Document lists */}
        <div className="mt-5">
          {view === 'priority' ? (
            <div className="space-y-2">
              <PriorityGroup
                title="Critical"
                color="#EF4444"
                docs={critical}
                expanded={expanded === 'critical'}
                onToggle={() => toggle('critical')}
              />
              <PriorityGroup
                title="Important"
                color="#F59E0B"
                docs={important}
                expanded={expanded === 'important'}
                onToggle={() => toggle('important')}
              />
              <PriorityGroup
                title="Nice to have"
                color="#64748B"
                docs={niceToHave}
                expanded={expanded === 'niceToHave'}
                onToggle={() => toggle('niceToHave')}
              />
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(byOwner).map(([ownerName, docs]) => (
                <OwnerDocGroup key={ownerName} ownerName={ownerName} docs={docs} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
