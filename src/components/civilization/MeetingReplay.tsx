'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { type MeetingContribution, type ContributionStance } from '@/types/civilization'
import AgentChip from './AgentChip'

const STANCE_ICONS: Record<ContributionStance, { icon: string; color: string }> = {
  agree:               { icon: '✓', color: '#10B981' },
  disagree:            { icon: '✗', color: '#EF4444' },
  neutral:             { icon: '−', color: '#64748B' },
  propose_alternative: { icon: '◈', color: '#8B5CF6' },
}

interface Props {
  contributions: MeetingContribution[]
}

export default function MeetingReplay({ contributions }: Props) {
  const [visibleCount, setVisibleCount] = useState(Math.min(3, contributions.length))
  const [isPlaying, setIsPlaying]       = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (!isPlaying) return
    if (visibleCount >= contributions.length) {
      setIsPlaying(false)
      return
    }
    timerRef.current = setTimeout(() => {
      setVisibleCount(v => v + 1)
    }, 1500)
    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [isPlaying, visibleCount, contributions.length])

  const handlePlay  = () => setIsPlaying(true)
  const handlePause = () => setIsPlaying(false)
  const handleReset = () => {
    setIsPlaying(false)
    setVisibleCount(Math.min(3, contributions.length))
  }

  const progress = contributions.length > 0
    ? Math.round((visibleCount / contributions.length) * 100)
    : 0

  return (
    <div>
      {/* Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
        {!isPlaying ? (
          <button
            onClick={handlePlay}
            disabled={visibleCount >= contributions.length}
            style={{
              padding:      '5px 14px',
              borderRadius: 6,
              fontSize:     12,
              fontWeight:   600,
              background:   visibleCount >= contributions.length ? '#1E293B' : '#6366F122',
              color:        visibleCount >= contributions.length ? '#334155' : '#A5B4FC',
              border:       '1px solid #334155',
              cursor:       visibleCount >= contributions.length ? 'default' : 'pointer',
            }}
          >
            ▶ Play
          </button>
        ) : (
          <button
            onClick={handlePause}
            style={{
              padding:      '5px 14px',
              borderRadius: 6,
              fontSize:     12,
              fontWeight:   600,
              background:   '#F59E0B22',
              color:        '#FCD34D',
              border:       '1px solid #F59E0B44',
              cursor:       'pointer',
            }}
          >
            ⏸ Pause
          </button>
        )}
        <button
          onClick={handleReset}
          style={{
            padding:      '5px 14px',
            borderRadius: 6,
            fontSize:     12,
            fontWeight:   600,
            background:   'transparent',
            color:        '#475569',
            border:       '1px solid #1E293B',
            cursor:       'pointer',
          }}
        >
          ↺ Reset
        </button>

        {/* Progress bar */}
        <div style={{ flex: 1, height: 4, background: '#1E293B', borderRadius: 2, overflow: 'hidden' }}>
          <div
            style={{
              width:        `${progress}%`,
              height:       '100%',
              background:   '#6366F1',
              borderRadius: 2,
              transition:   'width 0.4s ease',
            }}
          />
        </div>
        <span style={{ color: '#475569', fontSize: 11, whiteSpace: 'nowrap' }}>
          {visibleCount}/{contributions.length}
        </span>
      </div>

      {/* Contributions */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <AnimatePresence>
          {contributions.slice(0, visibleCount).map((c, i) => {
            const stance = STANCE_ICONS[c.stance]
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.35 }}
                style={{
                  background:   '#0F172A',
                  border:       '1px solid #1E293B',
                  borderRadius: 8,
                  padding:      '10px 14px',
                  display:      'flex',
                  gap:          12,
                  alignItems:   'flex-start',
                }}
              >
                <AgentChip agentId={c.agent_id} size="sm" showName={false} />
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <AgentChip agentId={c.agent_id} size="sm" showName={true} />
                    <span
                      style={{
                        padding:      '1px 6px',
                        borderRadius: 4,
                        fontSize:     10,
                        fontWeight:   700,
                        background:   `${stance.color}22`,
                        color:        stance.color,
                        border:       `1px solid ${stance.color}44`,
                      }}
                    >
                      {stance.icon} {c.role === 'facilitator' ? 'Facilitador' : c.stance.replace('_', ' ')}
                    </span>
                    <span style={{ color: '#334155', fontSize: 10, marginLeft: 'auto' }}>{c.timestamp}</span>
                  </div>
                  <p style={{ color: '#94A3B8', fontSize: 13, lineHeight: 1.55, margin: 0 }}>
                    {c.content}
                  </p>
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>
    </div>
  )
}
