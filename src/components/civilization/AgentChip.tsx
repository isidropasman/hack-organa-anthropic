'use client'

import { AGENTS, SCORES } from '@/lib/mock-data-civilization'
import { getScoreLevel, SCORE_COLORS } from '@/types/civilization'

interface Props {
  agentId: string
  size?: 'sm' | 'md'
  showName?: boolean
}

export default function AgentChip({ agentId, size = 'md', showName = true }: Props) {
  const agent = AGENTS.find(a => a.id === agentId)
  const score = SCORES[agentId]

  if (!agent) return <span className="text-gray-500 text-xs">Unknown</span>

  const level    = score ? getScoreLevel(score.composite) : 'good'
  const color    = SCORE_COLORS[level]
  const avatarSz = size === 'sm' ? 22 : 30
  const fontSize = size === 'sm' ? 9  : 11

  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        style={{
          display:        'inline-flex',
          alignItems:     'center',
          justifyContent: 'center',
          width:          avatarSz,
          height:         avatarSz,
          borderRadius:   '50%',
          border:         `2px solid ${color}`,
          background:     `${color}22`,
          color,
          fontSize,
          fontWeight:     700,
          flexShrink:     0,
          letterSpacing:  '0.03em',
        }}
      >
        {agent.avatar}
      </span>
      {showName && (
        <span
          style={{
            color:      '#CBD5E1',
            fontSize:   size === 'sm' ? 11 : 13,
            fontWeight: 500,
            whiteSpace: 'nowrap',
          }}
        >
          {agent.name.split(' ')[0]}
        </span>
      )}
    </span>
  )
}
