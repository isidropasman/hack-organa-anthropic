'use client'

import { useState } from 'react'
import { AGENTS, SCORES, SCORE_HISTORY } from '@/lib/mock-data-civilization'
import { getScoreLevel, SCORE_COLORS } from '@/types/civilization'
import ScoreChart from './ScoreChart'
import ScoreBadge from './ScoreBadge'

const DIMENSIONS: { key: keyof typeof SCORES[string]; label: string; weight: string }[] = [
  { key: 'execution',    label: 'Execution',    weight: '35%' },
  { key: 'communication', label: 'Communication', weight: '20%' },
  { key: 'collaboration', label: 'Collaboration', weight: '25%' },
  { key: 'efficiency',   label: 'Efficiency',   weight: '20%' },
]

const MODE_COLORS: Record<string, string> = {
  autonomous: '#10B981',
  assisted:   '#8B5CF6',
  shadow:     '#F59E0B',
}

export default function ScorePanel() {
  const [selectedId, setSelectedId] = useState<string>(AGENTS[0].id)

  const agent   = AGENTS.find(a => a.id === selectedId)!
  const score   = SCORES[selectedId]
  const history = SCORE_HISTORY[selectedId] ?? []
  const level   = getScoreLevel(score.composite)
  const color   = SCORE_COLORS[level]

  const trending = score.trajectory_slope > 0.3
    ? 'up'
    : score.trajectory_slope < -0.3
    ? 'down'
    : 'flat'

  const trendIcon  = trending === 'up' ? '↑' : trending === 'down' ? '↓' : '→'
  const trendColor = trending === 'up' ? '#10B981' : trending === 'down' ? '#EF4444' : '#64748B'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Agent selector */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {AGENTS.map(a => {
          const s = SCORES[a.id]
          const l = getScoreLevel(s.composite)
          const c = SCORE_COLORS[l]
          const active = a.id === selectedId
          return (
            <button
              key={a.id}
              onClick={() => setSelectedId(a.id)}
              style={{
                padding:      '5px 12px',
                borderRadius: 6,
                fontSize:     12,
                fontWeight:   600,
                background:   active ? `${c}22` : 'transparent',
                color:        active ? c : '#64748B',
                border:       active ? `1px solid ${c}55` : '1px solid #E2E8F0',
                cursor:       'pointer',
                display:      'flex',
                alignItems:   'center',
                gap:          5,
              }}
            >
              <span
                style={{
                  width:        8,
                  height:       8,
                  borderRadius: '50%',
                  background:   c,
                  flexShrink:   0,
                }}
              />
              {a.name.split(' ')[0]}
              <span style={{ color: active ? c : '#94A3B8', fontSize: 11 }}>{s.composite}</span>
            </button>
          )
        })}
      </div>

      {/* Detail card */}
      <div
        style={{
          background:   '#FFFFFF',
          border:       `1px solid ${color}33`,
          borderRadius: 10,
          padding:      20,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, marginBottom: 20, flexWrap: 'wrap' }}>
          {/* Avatar + name */}
          <div
            style={{
              width:          52,
              height:         52,
              borderRadius:   '50%',
              border:         `2px solid ${color}`,
              background:     `${color}22`,
              display:        'flex',
              alignItems:     'center',
              justifyContent: 'center',
              fontSize:       18,
              fontWeight:     700,
              color,
            }}
          >
            {agent.avatar}
          </div>

          <div style={{ flex: 1 }}>
            <p style={{ color: '#1E293B', fontSize: 16, fontWeight: 700, margin: 0 }}>{agent.name}</p>
            <p style={{ color: '#64748B', fontSize: 12, margin: '2px 0' }}>{agent.role}</p>
            <span
              style={{
                padding:      '1px 7px',
                borderRadius: 4,
                fontSize:     10,
                fontWeight:   600,
                background:   `${MODE_COLORS[agent.mode] ?? '#64748B'}22`,
                color:        MODE_COLORS[agent.mode] ?? '#64748B',
                border:       `1px solid ${MODE_COLORS[agent.mode] ?? '#64748B'}44`,
                textTransform: 'capitalize',
              }}
            >
              {agent.mode}
            </span>
          </div>

          <div style={{ textAlign: 'right' }}>
            <ScoreBadge score={score.composite} size="lg" />
            <p style={{ color: trendColor, fontSize: 13, margin: '4px 0 0', fontWeight: 600 }}>
              {trendIcon} {Math.abs(score.trajectory_slope).toFixed(1)} pts/day
            </p>
          </div>
        </div>

        {/* Score bars */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
          {DIMENSIONS.map(dim => {
            const val = score[dim.key as keyof typeof score] as number
            const barColor = val >= 85 ? '#10B981' : val >= 70 ? '#3B82F6' : val >= 50 ? '#F59E0B' : '#EF4444'
            return (
              <div key={dim.key}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ color: '#475569', fontSize: 12 }}>
                    {dim.label} <span style={{ color: '#94A3B8' }}>({dim.weight})</span>
                  </span>
                  <span style={{ color: barColor, fontSize: 12, fontWeight: 700 }}>{val}</span>
                </div>
                <div style={{ height: 5, background: '#E2E8F0', borderRadius: 3, overflow: 'hidden' }}>
                  <div
                    style={{
                      width:      `${val}%`,
                      height:     '100%',
                      background: barColor,
                      borderRadius: 3,
                      transition: 'width 0.5s ease',
                    }}
                  />
                </div>
              </div>
            )
          })}
        </div>

        {/* Chart */}
        <div>
          <p style={{ color: '#64748B', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 8px' }}>
            14-day composite trajectory
          </p>
          <ScoreChart history={history} agentName={agent.name} trending={trending} />
        </div>
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
        {[
          { label: 'Excellent', threshold: '≥85', color: '#10B981' },
          { label: 'Good',      threshold: '≥70', color: '#3B82F6' },
          { label: 'Warning',   threshold: '≥50', color: '#F59E0B' },
          { label: 'Critical',  threshold: '≥30', color: '#EF4444' },
          { label: 'Terminal',  threshold: '<30',  color: '#F43F5E' },
        ].map(l => (
          <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: l.color, flexShrink: 0 }} />
            <span style={{ color: '#64748B', fontSize: 11 }}>{l.label}</span>
            <span style={{ color: '#94A3B8', fontSize: 10 }}>{l.threshold}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
