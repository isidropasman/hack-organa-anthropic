'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { TRIBUNAL_CASES, AGENTS } from '@/lib/mock-data-civilization'
import { SCORES } from '@/lib/mock-data-civilization'
import { type CaseSeverity, type CaseStatus } from '@/types/civilization'
import AgentChip from './AgentChip'

const SEVERITY_COLORS: Record<CaseSeverity, string> = {
  warning:     '#F59E0B',
  review:      '#3B82F6',
  critical:    '#EF4444',
  replacement: '#F43F5E',
}

const STATUS_COLORS: Record<CaseStatus, string> = {
  open:          '#EF4444',
  investigating: '#F59E0B',
  resolved:      '#10B981',
  dismissed:     '#64748B',
}

const VERDICT_COLORS: Record<string, string> = {
  warning: '#F59E0B',
  retrain: '#8B5CF6',
  restrict:'#EF4444',
  replace: '#F43F5E',
}

const openCases    = TRIBUNAL_CASES.filter(c => c.status === 'open' || c.status === 'investigating').length
const totalAgents  = AGENTS.length
const verdicts     = TRIBUNAL_CASES.filter(c => c.verdict).length

export default function TribunalPanel() {
  const [expandedId, setExpandedId] = useState<string | null>(TRIBUNAL_CASES[0]?.id ?? null)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Top metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
        {[
          { label: 'Open Cases',       value: openCases,   color: '#EF4444' },
          { label: 'Agents Monitored', value: totalAgents, color: '#3B82F6' },
          { label: 'Verdicts Issued',  value: verdicts,    color: '#8B5CF6' },
        ].map(m => (
          <div
            key={m.label}
            style={{
              background:   '#0F172A',
              border:       '1px solid #1E293B',
              borderRadius: 8,
              padding:      '14px 16px',
              textAlign:    'center',
            }}
          >
            <p style={{ color: m.color, fontSize: 28, fontWeight: 800, margin: 0 }}>{m.value}</p>
            <p style={{ color: '#475569', fontSize: 11, margin: '4px 0 0' }}>{m.label}</p>
          </div>
        ))}
      </div>

      {/* Case list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {TRIBUNAL_CASES.map(c => {
          const isExpanded     = expandedId === c.id
          const severityColor  = SEVERITY_COLORS[c.severity]
          const statusColor    = STATUS_COLORS[c.status]
          const isCritical     = c.severity === 'critical' || c.severity === 'replacement'

          return (
            <div
              key={c.id}
              style={{
                background:   '#0F172A',
                border:       `1px solid ${isCritical ? '#EF444433' : '#1E293B'}`,
                borderRadius: 10,
                overflow:     'hidden',
                boxShadow:    isCritical ? '0 0 12px #EF444418' : 'none',
              }}
            >
              <button
                onClick={() => setExpandedId(isExpanded ? null : c.id)}
                style={{
                  width:      '100%',
                  padding:    '14px 18px',
                  display:    'flex',
                  alignItems: 'center',
                  gap:        12,
                  background: 'transparent',
                  border:     'none',
                  cursor:     'pointer',
                  textAlign:  'left',
                }}
              >
                <span
                  style={{
                    padding:      '2px 8px',
                    borderRadius: 4,
                    fontSize:     11,
                    fontWeight:   600,
                    background:   `${severityColor}22`,
                    color:        severityColor,
                    border:       `1px solid ${severityColor}44`,
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                    whiteSpace:   'nowrap',
                  }}
                >
                  {c.severity}
                </span>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                    <AgentChip agentId={c.agent_id} size="sm" />
                  </div>
                  <p style={{ color: '#64748B', fontSize: 12, margin: 0, lineHeight: 1.4 }}>
                    {c.trigger.length > 90 ? c.trigger.slice(0, 89) + '…' : c.trigger}
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
                    textTransform: 'capitalize',
                  }}
                >
                  {c.status}
                </span>

                <span style={{ color: '#334155', fontSize: 14 }}>
                  {isExpanded ? '▲' : '▼'}
                </span>
              </button>

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
                      {/* Full trigger */}
                      <div style={{ padding: '12px 0' }}>
                        <p style={{ color: '#475569', fontSize: 11, margin: '0 0 6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                          Trigger
                        </p>
                        <p style={{ color: '#94A3B8', fontSize: 13, margin: 0, lineHeight: 1.55 }}>
                          {c.trigger}
                        </p>
                      </div>

                      {/* Chain of responsibility */}
                      <div style={{ marginBottom: 16 }}>
                        <p style={{ color: '#475569', fontSize: 11, margin: '0 0 10px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                          Chain of Responsibility
                        </p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                          {c.chain_of_responsibility.map((entry, i) => {
                            const pct = Math.round(entry.contribution * 100)
                            const score = SCORES[entry.agent_id]
                            const barColor = pct >= 60 ? '#EF4444' : pct >= 30 ? '#F59E0B' : '#64748B'
                            return (
                              <div key={i}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                                  <AgentChip agentId={entry.agent_id} size="sm" />
                                  <span style={{ color: '#64748B', fontSize: 12, flex: 1 }}>{entry.role_in_failure}</span>
                                  <span style={{ color: barColor, fontSize: 13, fontWeight: 700 }}>{pct}%</span>
                                </div>
                                <div style={{ height: 4, background: '#1E293B', borderRadius: 2, overflow: 'hidden' }}>
                                  <div
                                    style={{
                                      width:      `${pct}%`,
                                      height:     '100%',
                                      background: barColor,
                                      borderRadius: 2,
                                    }}
                                  />
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </div>

                      {/* Verdict */}
                      {c.verdict && (
                        <div
                          style={{
                            background:   '#080810',
                            border:       `1px solid ${VERDICT_COLORS[c.verdict.action] ?? '#334155'}44`,
                            borderRadius: 8,
                            padding:      '12px 14px',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                            <p style={{ color: '#475569', fontSize: 11, margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                              Verdict
                            </p>
                            <span
                              style={{
                                padding:      '1px 8px',
                                borderRadius: 4,
                                fontSize:     11,
                                fontWeight:   700,
                                background:   `${VERDICT_COLORS[c.verdict.action]}22`,
                                color:        VERDICT_COLORS[c.verdict.action] ?? '#94A3B8',
                                border:       `1px solid ${VERDICT_COLORS[c.verdict.action] ?? '#334155'}44`,
                                textTransform: 'uppercase',
                              }}
                            >
                              {c.verdict.action}
                            </span>
                          </div>
                          <p style={{ color: '#94A3B8', fontSize: 13, margin: 0, lineHeight: 1.55 }}>
                            {c.verdict.reasoning}
                          </p>
                        </div>
                      )}

                      {/* Dates */}
                      <div style={{ display: 'flex', gap: 16, marginTop: 12 }}>
                        <div>
                          <p style={{ color: '#334155', fontSize: 11, margin: '0 0 2px' }}>Opened</p>
                          <p style={{ color: '#475569', fontSize: 12, margin: 0 }}>{c.created_at}</p>
                        </div>
                        {c.resolved_at && (
                          <div>
                            <p style={{ color: '#334155', fontSize: 11, margin: '0 0 2px' }}>Resolved</p>
                            <p style={{ color: '#475569', fontSize: 12, margin: 0 }}>{c.resolved_at}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )
        })}
      </div>
    </div>
  )
}
