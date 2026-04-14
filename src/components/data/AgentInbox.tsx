'use client'

import { useState } from 'react'
import { getInboxForAgent } from '@/lib/inbox-data'
import RequestRow from './RequestRow'

interface Props {
  agentId: string
}

export default function AgentInbox({ agentId }: Props) {
  const [tab, setTab] = useState<'inbound' | 'outbound'>('inbound')
  const { inbound, outbound } = getInboxForAgent(agentId)
  const items = tab === 'inbound' ? inbound : outbound

  if (inbound.length === 0 && outbound.length === 0) {
    return (
      <div className="py-6 text-center text-organa-text-muted text-sm">
        No communications yet
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {/* Sub-tabs */}
      <div className="flex gap-1 border-b border-organa-border">
        <TabBtn
          active={tab === 'inbound'}
          onClick={() => setTab('inbound')}
          label="Inbound"
          count={inbound.length}
        />
        <TabBtn
          active={tab === 'outbound'}
          onClick={() => setTab('outbound')}
          label="Outbound"
          count={outbound.length}
        />
      </div>

      {/* Request list */}
      <div className="space-y-0.5">
        {items.length === 0 ? (
          <p className="py-4 text-center text-organa-text-muted text-xs">
            No {tab} requests
          </p>
        ) : (
          items.map(req => <RequestRow key={req.id} request={req} />)
        )}
      </div>
    </div>
  )
}

function TabBtn({
  active,
  onClick,
  label,
  count,
}: {
  active: boolean
  onClick: () => void
  label: string
  count: number
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium border-b-2 transition-colors ${
        active
          ? 'border-organa-accent text-organa-accent'
          : 'border-transparent text-organa-text-muted hover:text-organa-text'
      }`}
    >
      {label}
      {count > 0 && (
        <span
          className={`px-1.5 py-0.5 rounded-full text-[10px] font-semibold ${
            active
              ? 'bg-blue-50 text-blue-700'
              : 'bg-slate-100 text-slate-600'
          }`}
        >
          {count}
        </span>
      )}
    </button>
  )
}
