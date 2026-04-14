'use client'

import { AGENTS, SCORES, SYNAPSE_MESSAGES, MEETINGS, TRIBUNAL_CASES, ACADEMIA_SESSIONS, COMM_LINKS } from '@/lib/mock-data-civilization'
import { getScoreLevel, SCORE_COLORS, INTENT_COLORS } from '@/types/civilization'
import CommGraph from './CommGraph'
import AgentChip from './AgentChip'
import IntentBadge from './IntentBadge'
import ScoreBadge from './ScoreBadge'

// Derived metrics
const totalMessages   = SYNAPSE_MESSAGES.length
const activeMeetings  = MEETINGS.filter(m => m.status === 'in_progress').length
const openCases       = TRIBUNAL_CASES.filter(c => c.status === 'open' || c.status === 'investigating').length
const avgScore        = Math.round(Object.values(SCORES).reduce((a, s) => a + s.composite, 0) / Object.values(SCORES).length * 10) / 10
const agentsAtRisk    = Object.values(SCORES).filter(s => s.composite < 50).length
const academiaSessions= ACADEMIA_SESSIONS.length

const METRICS = [
  { label: 'Total Messages',   value: totalMessages,    color: '#3B82F6' },
  { label: 'Active Meetings',  value: activeMeetings,   color: '#10B981' },
  { label: 'Open Cases',       value: openCases,        color: '#EF4444' },
  { label: 'Avg Score',        value: avgScore,         color: '#8B5CF6' },
  { label: 'Agents at Risk',   value: agentsAtRisk,     color: '#F59E0B' },
  { label: 'Learning Sessions',value: academiaSessions, color: '#6366F1' },
]

const recentMessages = SYNAPSE_MESSAGES
  .slice()
  .sort((a, b) => b.created_at.localeCompare(a.created_at))
  .slice(0, 8)

const MODE_COLORS: Record<string, string> = {
  autonomous: '#10B981',
  assisted:   '#8B5CF6',
  shadow:     '#F59E0B',
}

export default function ControlRoom() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Metric cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12 }}>
        {METRICS.map(m => (
          <div
            key={m.label}
            style={{
              background:   '#FFFFFF',
              border:       `1px solid ${m.color}33`,
              borderRadius: 8,
              padding:      '14px 16px',
            }}
          >
            <p style={{ color: m.color, fontSize: 28, fontWeight: 800, margin: 0, fontVariantNumeric: 'tabular-nums' }}>
              {m.value}
            </p>
            <p style={{ color: '#64748B', fontSize: 11, margin: '4px 0 0' }}>{m.label}</p>
          </div>
        ))}
      </div>

      {/* Graph + recent messages row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 380px)', gap: 16, flexWrap: 'wrap' }}>
        {/* CommGraph */}
        <div
          style={{
            background:   '#FFFFFF',
            border:       '1px solid #E2E8F0',
            borderRadius: 10,
            overflow:     'hidden',
          }}
        >
          <div style={{ padding: '12px 16px', borderBottom: '1px solid #E2E8F0' }}>
            <p style={{ color: '#1E293B', fontSize: 13, fontWeight: 600, margin: 0 }}>
              Communication Network
            </p>
            <p style={{ color: '#64748B', fontSize: 11, margin: '2px 0 0' }}>
              Node size = message volume · Edge thickness = channel weight · Color = score level
            </p>
          </div>
          <div style={{ height: 420, minHeight: 420 }}>
            <CommGraph links={COMM_LINKS} />
          </div>
        </div>

        {/* Recent messages */}
        <div
          style={{
            background:   '#FFFFFF',
            border:       '1px solid #E2E8F0',
            borderRadius: 10,
            overflow:     'hidden',
            display:      'flex',
            flexDirection:'column',
            maxHeight:    460,
          }}
        >
          <div style={{ padding: '12px 16px', borderBottom: '1px solid #E2E8F0', flexShrink: 0 }}>
            <p style={{ color: '#1E293B', fontSize: 13, fontWeight: 600, margin: 0 }}>
              Recent Messages
            </p>
          </div>
          <div style={{ overflowY: 'auto', padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 6 }}>
            {recentMessages.map(msg => (
              <div
                key={msg.id}
                style={{
                  padding:      '8px 10px',
                  background:   '#F8FAFC',
                  border:       `1px solid #E2E8F0`,
                  borderLeft:   `2px solid ${INTENT_COLORS[msg.intent]}`,
                  borderRadius: 6,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                  <AgentChip agentId={msg.from} size="sm" showName={false} />
                  <span style={{ color: '#94A3B8', fontSize: 10 }}>→</span>
                  <AgentChip agentId={msg.to} size="sm" showName={false} />
                  <IntentBadge intent={msg.intent} />
                  <span style={{ color: '#94A3B8', fontSize: 10, marginLeft: 'auto' }}>{msg.timestamp}</span>
                </div>
                <p style={{ color: '#475569', fontSize: 11, margin: 0, lineHeight: 1.4 }}>
                  {msg.content.length > 80 ? msg.content.slice(0, 79) + '…' : msg.content}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Agent status grid */}
      <div>
        <p style={{ color: '#64748B', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 12px' }}>
          Agent Status Grid
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 10 }}>
          {AGENTS.map(agent => {
            const score  = SCORES[agent.id]
            const level  = getScoreLevel(score.composite)
            const color  = SCORE_COLORS[level]
            const slope  = score.trajectory_slope
            const arrow  = slope > 0.3 ? '↑' : slope < -0.3 ? '↓' : '→'
            const arrowC = slope > 0.3 ? '#10B981' : slope < -0.3 ? '#EF4444' : '#64748B'

            return (
              <div
                key={agent.id}
                style={{
                  background:   '#FFFFFF',
                  border:       `1px solid ${color}33`,
                  borderRadius: 8,
                  padding:      '12px 14px',
                  display:      'flex',
                  alignItems:   'center',
                  gap:          10,
                }}
              >
                <div
                  style={{
                    width:          36,
                    height:         36,
                    borderRadius:   '50%',
                    border:         `2px solid ${color}`,
                    background:     `${color}18`,
                    display:        'flex',
                    alignItems:     'center',
                    justifyContent: 'center',
                    fontSize:       12,
                    fontWeight:     700,
                    color,
                    flexShrink:     0,
                  }}
                >
                  {agent.avatar}
                </div>
                <div style={{ minWidth: 0 }}>
                  <p style={{ color: '#1E293B', fontSize: 12, fontWeight: 600, margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {agent.name.split(' ')[0]}
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 3 }}>
                    <ScoreBadge score={score.composite} size="sm" />
                    <span style={{ color: arrowC, fontSize: 13, fontWeight: 700 }}>{arrow}</span>
                    <span
                      style={{
                        padding:      '0 5px',
                        borderRadius: 3,
                        fontSize:     9,
                        fontWeight:   600,
                        background:   `${MODE_COLORS[agent.mode] ?? '#64748B'}22`,
                        color:        MODE_COLORS[agent.mode] ?? '#64748B',
                        textTransform: 'capitalize',
                      }}
                    >
                      {agent.mode}
                    </span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
