'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MEETINGS, AGENTS } from '@/lib/mock-data-civilization'
import { type MeetingType, type MeetingStatus } from '@/types/civilization'
import AgentChip from './AgentChip'
import MeetingReplay from './MeetingReplay'

const TYPE_COLORS: Record<MeetingType, string> = {
  standup:   '#3B82F6',
  planning:  '#8B5CF6',
  review:    '#10B981',
  incident:  '#EF4444',
  brainstorm:'#F59E0B',
  '1on1':    '#6366F1',
}

const STATUS_COLORS: Record<MeetingStatus, string> = {
  scheduled:   '#64748B',
  in_progress: '#F59E0B',
  completed:   '#10B981',
  cancelled:   '#EF4444',
}

const STATUS_LABELS: Record<MeetingStatus, string> = {
  scheduled:   'Scheduled',
  in_progress: 'In Progress',
  completed:   'Completed',
  cancelled:   'Cancelled',
}

export default function NexusPanel() {
  const [expandedId, setExpandedId] = useState<string | null>(MEETINGS[0]?.id ?? null)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {MEETINGS.map(meeting => {
        const isExpanded  = expandedId === meeting.id
        const typeColor   = TYPE_COLORS[meeting.type]
        const statusColor = STATUS_COLORS[meeting.status]
        const facilitator = AGENTS.find(a => a.id === meeting.facilitator_id)

        return (
          <div
            key={meeting.id}
            style={{
              background:   '#0F172A',
              border:       `1px solid ${isExpanded ? '#334155' : '#1E293B'}`,
              borderRadius: 10,
              overflow:     'hidden',
            }}
          >
            {/* Card header */}
            <button
              onClick={() => setExpandedId(isExpanded ? null : meeting.id)}
              style={{
                width:        '100%',
                padding:      '14px 18px',
                display:      'flex',
                alignItems:   'center',
                gap:          12,
                background:   'transparent',
                border:       'none',
                cursor:       'pointer',
                textAlign:    'left',
              }}
            >
              <span
                style={{
                  padding:      '2px 9px',
                  borderRadius: 5,
                  fontSize:     11,
                  fontWeight:   600,
                  background:   `${typeColor}22`,
                  color:        typeColor,
                  border:       `1px solid ${typeColor}44`,
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  whiteSpace:   'nowrap',
                }}
              >
                {meeting.type}
              </span>

              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ color: '#E2E8F0', fontSize: 14, fontWeight: 600, margin: 0, lineHeight: 1.3 }}>
                  {meeting.title}
                </p>
                <p style={{ color: '#475569', fontSize: 11, margin: '2px 0 0', lineHeight: 1 }}>
                  Facilitated by {facilitator?.name ?? meeting.facilitator_id} · {meeting.participant_ids.length} participants
                </p>
              </div>

              <span
                style={{
                  padding:      '2px 8px',
                  borderRadius: 4,
                  fontSize:     11,
                  fontWeight:   600,
                  background:   `${statusColor}22`,
                  color:        statusColor,
                  border:       `1px solid ${statusColor}44`,
                  whiteSpace:   'nowrap',
                }}
              >
                {STATUS_LABELS[meeting.status]}
              </span>

              <span style={{ color: '#334155', fontSize: 16, userSelect: 'none' }}>
                {isExpanded ? '▲' : '▼'}
              </span>
            </button>

            {/* Expanded content */}
            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  style={{ overflow: 'hidden' }}
                >
                  <div style={{ padding: '0 18px 18px', borderTop: '1px solid #1E293B' }}>
                    {/* Meta row */}
                    <div style={{ display: 'flex', gap: 16, padding: '12px 0', flexWrap: 'wrap' }}>
                      <div>
                        <p style={{ color: '#475569', fontSize: 11, margin: '0 0 2px' }}>Started</p>
                        <p style={{ color: '#94A3B8', fontSize: 12, margin: 0 }}>{meeting.started_at}</p>
                      </div>
                      {meeting.ended_at && (
                        <div>
                          <p style={{ color: '#475569', fontSize: 11, margin: '0 0 2px' }}>Ended</p>
                          <p style={{ color: '#94A3B8', fontSize: 12, margin: 0 }}>{meeting.ended_at}</p>
                        </div>
                      )}
                      <div>
                        <p style={{ color: '#475569', fontSize: 11, margin: '0 0 2px' }}>Total tokens</p>
                        <p style={{ color: '#94A3B8', fontSize: 12, margin: 0 }}>{meeting.total_tokens.toLocaleString()}</p>
                      </div>
                    </div>

                    {/* Minutes summary */}
                    {meeting.minutes_summary && (
                      <div
                        style={{
                          background:   '#080810',
                          border:       '1px solid #1E293B',
                          borderRadius: 6,
                          padding:      '10px 14px',
                          marginBottom: 16,
                        }}
                      >
                        <p style={{ color: '#475569', fontSize: 11, margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Summary</p>
                        <p style={{ color: '#94A3B8', fontSize: 13, margin: 0, lineHeight: 1.55 }}>
                          {meeting.minutes_summary}
                        </p>
                      </div>
                    )}

                    {/* Meeting replay */}
                    <div style={{ marginBottom: 16 }}>
                      <p style={{ color: '#64748B', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 10px' }}>
                        Contributions replay
                      </p>
                      <MeetingReplay contributions={meeting.contributions} />
                    </div>

                    {/* Action items */}
                    {meeting.action_items.length > 0 && (
                      <div>
                        <p style={{ color: '#64748B', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 10px' }}>
                          Action items
                        </p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                          {meeting.action_items.map((item, i) => {
                            const priorityColor = item.priority === 'high' ? '#EF4444' : item.priority === 'medium' ? '#F59E0B' : '#64748B'
                            return (
                              <div
                                key={i}
                                style={{
                                  display:      'flex',
                                  alignItems:   'center',
                                  gap:          10,
                                  padding:      '8px 12px',
                                  background:   '#080810',
                                  border:       '1px solid #1E293B',
                                  borderRadius: 6,
                                }}
                              >
                                <span
                                  style={{
                                    width:        8,
                                    height:       8,
                                    borderRadius: '50%',
                                    background:   priorityColor,
                                    flexShrink:   0,
                                  }}
                                />
                                <p style={{ color: '#CBD5E1', fontSize: 13, margin: 0, flex: 1 }}>
                                  {item.description}
                                </p>
                                <AgentChip agentId={item.assigned_to} size="sm" />
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )
      })}
    </div>
  )
}
