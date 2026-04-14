'use client'

import { useEffect, useState } from 'react'
import type { TeamHighlight } from '@/lib/mock-data-employee'

interface Props {
  highlight: TeamHighlight
}

export default function ComparisonBar({ highlight }: Props) {
  const [animated, setAnimated] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 150)
    return () => clearTimeout(t)
  }, [])

  const max = Math.max(highlight.myValue, highlight.teamAvg) * 1.2
  const myPct = animated ? (highlight.myValue / max) * 100 : 0
  const avgPct = animated ? (highlight.teamAvg / max) * 100 : 0

  const myLabel = highlight.unit
    ? `${highlight.myValue}${highlight.unit}`
    : String(highlight.myValue)
  const avgLabel = highlight.unit
    ? `${highlight.teamAvg}${highlight.unit}`
    : String(highlight.teamAvg)

  return (
    <div className="space-y-3">
      {/* Metric label + badge */}
      <div className="flex items-start justify-between gap-2">
        <span className="text-sm font-semibold text-organa-text">{highlight.metric}</span>
      </div>

      {/* My bar */}
      <div>
        <div className="flex justify-between text-xs mb-1.5">
          <span className="text-organa-text-muted">Your twin</span>
          <span className="font-semibold text-organa-text">{myLabel}</span>
        </div>
        <div className="h-2.5 bg-organa-bg rounded-full overflow-hidden border border-organa-border">
          <div
            className="h-full rounded-full transition-all duration-700 ease-out"
            style={{
              width: `${myPct}%`,
              background: highlight.isAbove
                ? 'linear-gradient(90deg, #0071E3, #34C759)'
                : '#0071E3',
            }}
          />
        </div>
      </div>

      {/* Team average bar */}
      <div>
        <div className="flex justify-between text-xs mb-1.5">
          <span className="text-organa-text-muted">Team average</span>
          <span className="text-organa-text-muted">{avgLabel}</span>
        </div>
        <div className="h-2.5 bg-organa-bg rounded-full overflow-hidden border border-organa-border">
          <div
            className="h-full bg-organa-border-strong rounded-full transition-all duration-700 ease-out"
            style={{ width: `${avgPct}%` }}
          />
        </div>
      </div>

      {/* Badge or encouragement */}
      {highlight.isAbove ? (
        <div className="inline-flex items-center gap-1 px-2.5 py-1 bg-organa-success-light text-organa-success border border-organa-success/20 rounded-full text-xs font-medium">
          🏅 {highlight.badge}
        </div>
      ) : (
        <p className="text-xs text-organa-text-muted italic">{highlight.badge}</p>
      )}
    </div>
  )
}
