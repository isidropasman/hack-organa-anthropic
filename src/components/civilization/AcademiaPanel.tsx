'use client'

import { ACADEMIA_SESSIONS, AGENTS } from '@/lib/mock-data-civilization'
import { type AcademiaStatus } from '@/types/civilization'
import AgentChip from './AgentChip'

const STATUS_COLORS: Record<AcademiaStatus, string> = {
  enrolled:    '#3B82F6',
  in_progress: '#F59E0B',
  testing:     '#8B5CF6',
  graduated:   '#10B981',
  failed:      '#EF4444',
}

const CURRICULUM_ICONS: Record<string, string> = {
  passed:      '✓',
  in_progress: '◌',
  pending:     '○',
  failed:      '✗',
}

const CURRICULUM_COLORS: Record<string, string> = {
  passed:      '#10B981',
  in_progress: '#F59E0B',
  pending:     '#94A3B8',
  failed:      '#EF4444',
}

export default function AcademiaPanel() {
  if (ACADEMIA_SESSIONS.length === 0) {
    return (
      <div
        style={{
          background:   '#FFFFFF',
          border:       '1px solid #E2E8F0',
          borderRadius: 10,
          padding:      '40px 20px',
          textAlign:    'center',
        }}
      >
        <p style={{ color: '#64748B', fontSize: 14, marginBottom: 8 }}>No active learning sessions</p>
        <p style={{ color: '#94A3B8', fontSize: 13 }}>
          Academia sessions are initiated when the Tribunal flags an agent for retraining. Sessions draw mentor patterns from top-performing agents and build personalized curricula from failure profiles.
        </p>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {ACADEMIA_SESSIONS.map((session, idx) => {
        const agent        = AGENTS.find(a => a.id === session.agent_id)
        const statusColor  = STATUS_COLORS[session.status]
        const passedCount  = session.curriculum.filter(c => c.status === 'passed').length
        const totalCount   = session.curriculum.length
        const progress     = Math.round((passedCount / totalCount) * 100)

        return (
          <div key={idx}>
            {/* Session card */}
            <div
              style={{
                background:   '#FFFFFF',
                border:       `1px solid ${statusColor}33`,
                borderRadius: 10,
                padding:      20,
                marginBottom: 16,
              }}
            >
              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                <AgentChip agentId={session.agent_id} size="md" />
                <div style={{ flex: 1 }}>
                  <p style={{ color: '#1E293B', fontSize: 14, fontWeight: 600, margin: 0 }}>
                    {agent?.name ?? session.agent_id}
                  </p>
                  <p style={{ color: '#64748B', fontSize: 12, margin: '2px 0 0' }}>
                    Started: {session.started_at}
                  </p>
                </div>
                <span
                  style={{
                    padding:      '3px 10px',
                    borderRadius: 5,
                    fontSize:     11,
                    fontWeight:   600,
                    background:   `${statusColor}22`,
                    color:        statusColor,
                    border:       `1px solid ${statusColor}44`,
                    textTransform: 'capitalize',
                  }}
                >
                  {session.status.replace('_', ' ')}
                </span>
              </div>

              {/* Overall progress bar */}
              <div style={{ marginBottom: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ color: '#64748B', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Curriculum progress
                  </span>
                  <span style={{ color: '#475569', fontSize: 11 }}>{passedCount}/{totalCount} skills</span>
                </div>
                <div style={{ height: 5, background: '#E2E8F0', borderRadius: 3, overflow: 'hidden' }}>
                  <div
                    style={{
                      width:      `${progress}%`,
                      height:     '100%',
                      background: '#8B5CF6',
                      borderRadius: 3,
                      transition: 'width 0.6s ease',
                    }}
                  />
                </div>
              </div>

              {/* Curriculum list */}
              <div style={{ marginBottom: 20 }}>
                <p style={{ color: '#64748B', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 10px' }}>
                  Curriculum
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {session.curriculum.map((item, i) => {
                    const itemColor = CURRICULUM_COLORS[item.status]
                    const icon      = CURRICULUM_ICONS[item.status]
                    return (
                      <div
                        key={i}
                        style={{
                          display:      'flex',
                          alignItems:   'center',
                          gap:          10,
                          padding:      '10px 14px',
                          background:   '#F8FAFC',
                          border:       `1px solid ${item.status === 'passed' ? '#10B98133' : '#E2E8F0'}`,
                          borderRadius: 7,
                        }}
                      >
                        <span
                          style={{
                            width:          20,
                            height:         20,
                            borderRadius:   '50%',
                            background:     `${itemColor}22`,
                            border:         `1px solid ${itemColor}55`,
                            display:        'flex',
                            alignItems:     'center',
                            justifyContent: 'center',
                            fontSize:       11,
                            color:          itemColor,
                            fontWeight:     700,
                            flexShrink:     0,
                          }}
                        >
                          {icon}
                        </span>
                        <span style={{ color: '#334155', fontSize: 13, flex: 1 }}>{item.skill}</span>
                        {item.score !== undefined && (
                          <span
                            style={{
                              padding:      '1px 7px',
                              borderRadius: 4,
                              fontSize:     11,
                              fontWeight:   700,
                              background:   `${itemColor}22`,
                              color:        itemColor,
                            }}
                          >
                            {item.score}
                          </span>
                        )}
                        <span
                          style={{
                            fontSize:      10,
                            fontWeight:    600,
                            color:         itemColor,
                            textTransform: 'capitalize',
                          }}
                        >
                          {item.status.replace('_', ' ')}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Mentor patterns */}
              {session.mentor_patterns.length > 0 && (
                <div style={{ marginBottom: 16 }}>
                  <p style={{ color: '#64748B', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 10px' }}>
                    Patterns from mentor agents
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                    {session.mentor_patterns.map((mp, i) => (
                      <div
                        key={i}
                        style={{
                          display:      'flex',
                          alignItems:   'flex-start',
                          gap:          10,
                          padding:      '8px 12px',
                          background:   '#F8FAFC',
                          border:       '1px solid #E2E8F0',
                          borderRadius: 6,
                        }}
                      >
                        <AgentChip agentId={mp.from_agent_id} size="sm" showName={false} />
                        <div>
                          <AgentChip agentId={mp.from_agent_id} size="sm" showName />
                          <p style={{ color: '#475569', fontSize: 12, margin: '3px 0 0', lineHeight: 1.45 }}>
                            {mp.pattern}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Graduation criteria */}
              <div
                style={{
                  background:   '#F8FAFC',
                  border:       '1px solid #E2E8F0',
                  borderRadius: 7,
                  padding:      '10px 14px',
                }}
              >
                <p style={{ color: '#64748B', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 6px' }}>
                  Graduation criteria
                </p>
                <p style={{ color: '#475569', fontSize: 12, margin: 0, lineHeight: 1.5 }}>
                  Pass all 4 curriculum skills · Minimum composite graduation score of 70 · No failed mandatory modules
                </p>
                {session.graduation_score !== undefined && (
                  <p style={{ color: '#10B981', fontSize: 13, fontWeight: 700, margin: '6px 0 0' }}>
                    Graduation score: {session.graduation_score}
                  </p>
                )}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
