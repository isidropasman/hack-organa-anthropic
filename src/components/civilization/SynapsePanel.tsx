'use client'

import { useState } from 'react'
import { SYNAPSE_MESSAGES, AGENTS } from '@/lib/mock-data-civilization'
import { INTENT_COLORS, type MessageIntent, type MessageUrgency } from '@/types/civilization'
import IntentBadge from './IntentBadge'
import AgentChip from './AgentChip'

const ALL_INTENTS: MessageIntent[] = ['delegate', 'request', 'status_update', 'decision', 'question', 'escalation']

const URGENCY_COLORS: Record<MessageUrgency, string> = {
  low:      '#64748B',
  normal:   '#64748B',
  high:     '#F59E0B',
  critical: '#EF4444',
}

const OUTCOME_COLORS: Record<string, string> = {
  completed:    '#10B981',
  acknowledged: '#3B82F6',
  pending:      '#F59E0B',
  failed:       '#EF4444',
  rejected:     '#F43F5E',
}

export default function SynapsePanel() {
  const [filter, setFilter] = useState<MessageIntent | 'all'>('all')

  const filtered = SYNAPSE_MESSAGES
    .filter(m => filter === 'all' || m.intent === filter)
    .slice()
    .sort((a, b) => b.created_at.localeCompare(a.created_at))

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Filter row */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <button
          onClick={() => setFilter('all')}
          style={{
            padding:      '4px 12px',
            borderRadius: 6,
            fontSize:     12,
            fontWeight:   600,
            border:       filter === 'all' ? '1px solid #6366F1' : '1px solid #334155',
            background:   filter === 'all' ? '#6366F122' : 'transparent',
            color:        filter === 'all' ? '#A5B4FC' : '#64748B',
            cursor:       'pointer',
          }}
        >
          All
        </button>
        {ALL_INTENTS.map(intent => (
          <button
            key={intent}
            onClick={() => setFilter(intent)}
            style={{
              padding:      '4px 12px',
              borderRadius: 6,
              fontSize:     12,
              fontWeight:   600,
              border:       filter === intent
                ? `1px solid ${INTENT_COLORS[intent]}`
                : '1px solid #334155',
              background:   filter === intent ? `${INTENT_COLORS[intent]}22` : 'transparent',
              color:        filter === intent ? INTENT_COLORS[intent] : '#64748B',
              cursor:       'pointer',
              textTransform: 'capitalize',
            }}
          >
            {intent.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Messages */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {filtered.map(msg => {
          const fromAgent = AGENTS.find(a => a.id === msg.from)
          const intentColor = INTENT_COLORS[msg.intent]
          return (
            <div
              key={msg.id}
              style={{
                background:   '#0F172A',
                border:       `1px solid #1E293B`,
                borderLeft:   `3px solid ${intentColor}`,
                borderRadius: 8,
                padding:      '12px 16px',
                display:      'flex',
                flexDirection: 'column',
                gap:          8,
              }}
            >
              {/* Header row */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <AgentChip agentId={msg.from} size="sm" />
                <span style={{ color: '#475569', fontSize: 11 }}>→</span>
                <AgentChip agentId={msg.to} size="sm" />
                <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <IntentBadge intent={msg.intent} />
                  {(msg.urgency === 'high' || msg.urgency === 'critical') && (
                    <span
                      style={{
                        padding:      '1px 6px',
                        borderRadius: 4,
                        fontSize:     10,
                        fontWeight:   600,
                        background:   `${URGENCY_COLORS[msg.urgency]}22`,
                        color:        URGENCY_COLORS[msg.urgency],
                        border:       `1px solid ${URGENCY_COLORS[msg.urgency]}44`,
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em',
                      }}
                    >
                      {msg.urgency}
                    </span>
                  )}
                  <span style={{ color: '#475569', fontSize: 11 }}>{msg.timestamp}</span>
                </div>
              </div>

              {/* Content */}
              <p style={{ color: '#94A3B8', fontSize: 13, lineHeight: 1.5, margin: 0 }}>
                {msg.content}
              </p>

              {/* Footer */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span
                  style={{
                    width:        7,
                    height:       7,
                    borderRadius: '50%',
                    background:   OUTCOME_COLORS[msg.outcome] ?? '#64748B',
                    flexShrink:   0,
                  }}
                />
                <span style={{ color: '#475569', fontSize: 11, textTransform: 'capitalize' }}>
                  {msg.outcome.replace('_', ' ')}
                </span>
                <span style={{ color: '#334155', fontSize: 11, marginLeft: 'auto' }}>
                  {msg.tokens_used.toLocaleString()} tokens
                </span>
              </div>
            </div>
          )
        })}
        {filtered.length === 0 && (
          <p style={{ color: '#475569', textAlign: 'center', padding: '40px 0', fontSize: 14 }}>
            No messages for this filter.
          </p>
        )}
      </div>
    </div>
  )
}
