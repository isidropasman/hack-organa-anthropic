'use client'

import { useEffect, useState } from 'react'
import type { EmployeeAgentData } from '@/lib/mock-data-employee'
import { getLevelForKRS } from '@/lib/mock-data-employee'

interface Props {
  data: EmployeeAgentData
}

const modeConfig = {
  shadow: { emoji: '🔍', label: 'Observando', cls: 'bg-gray-100 text-gray-500 border-gray-200' },
  assisted: { emoji: '⚡', label: 'Asistiendo', cls: 'bg-blue-50 text-blue-600 border-blue-200' },
  autonomous: { emoji: '🤖', label: 'Autónomo', cls: 'bg-green-50 text-green-600 border-green-200' },
}

const levelColors = [
  '',
  'from-gray-400 to-gray-500',         // Nivel 1
  'from-amber-400 to-amber-500',       // Nivel 2
  'from-orange-400 to-yellow-400',     // Nivel 3
  'from-blue-400 to-indigo-500',       // Nivel 4
  'from-organa-accent to-organa-success', // Nivel 5
]

export default function TwinHero({ data }: Props) {
  const [xpWidth, setXpWidth] = useState(0)

  const level = getLevelForKRS(data.krs)
  const mode = modeConfig[data.mode]
  const gradientClass = levelColors[level.level]
  const isMax = level.max === null
  const unlockedCount = data.achievements.filter(a => a.unlocked).length

  // Animate XP bar after mount
  useEffect(() => {
    const t = setTimeout(() => setXpWidth(data.krs), 120)
    return () => clearTimeout(t)
  }, [data.krs])

  return (
    <div className="bg-white border border-organa-border rounded-2xl p-8 shadow-card">
      <div className="flex items-start gap-8">
        {/* Avatar + level badge */}
        <div className="relative flex-shrink-0">
          <div className="w-24 h-24 rounded-2xl bg-organa-accent-light flex items-center justify-center shadow-card">
            <span className="text-5xl">🤖</span>
          </div>
          <div
            className={`absolute -bottom-2 -right-2 w-9 h-9 rounded-full flex items-center justify-center shadow-button bg-gradient-to-br ${gradientClass}`}
          >
            <span className="text-white text-sm font-bold">{level.level}</span>
          </div>
        </div>

        {/* Main info */}
        <div className="flex-1 min-w-0">
          {/* Name + mode badge */}
          <div className="flex items-center gap-3 flex-wrap mb-1">
            <h1 className="text-2xl font-bold text-organa-text">
              Twin de {data.employeeName}
            </h1>
            <span
              className={`text-xs px-2.5 py-1 rounded-full border font-medium ${mode.cls}`}
            >
              {mode.emoji} {mode.label}
            </span>
          </div>

          <p className="text-organa-text-muted text-sm mb-5">
            {data.role} · {data.department}
          </p>

          {/* Level + XP bar */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-organa-text">
                Nivel {level.level} — {level.name}
              </span>
              <span className="text-sm text-organa-text-muted">
                {isMax ? 'Nivel Máximo ✨' : `${data.krs} / 100 XP`}
              </span>
            </div>
            <div className="h-3 bg-organa-bg rounded-full overflow-hidden border border-organa-border">
              <div
                className={`h-full rounded-full bg-gradient-to-r ${gradientClass} transition-all duration-1000 ease-out`}
                style={{ width: `${xpWidth}%` }}
              />
            </div>
            {!isMax && (
              <p className="text-xs text-organa-text-muted mt-1.5">
                {100 - data.krs} XP hasta el siguiente nivel
              </p>
            )}
          </div>

          {/* Motivation */}
          <p className="text-organa-text-secondary text-sm leading-relaxed">
            {level.motivation}
          </p>
        </div>

        {/* Stats block */}
        <div className="flex-shrink-0 flex flex-col items-end gap-4">
          {/* KRS */}
          <div className="text-right">
            <div className="text-5xl font-bold text-organa-accent leading-none">{data.krs}</div>
            <div className="text-organa-text-muted text-xs mt-1 uppercase tracking-wide">KRS</div>
          </div>

          {/* Mini stats */}
          <div className="flex gap-4 text-right">
            <div>
              <div className="text-xl font-bold text-organa-text">{unlockedCount}</div>
              <div className="text-organa-text-muted text-xs">Logros</div>
            </div>
            <div>
              <div className="text-xl font-bold text-organa-text">
                {data.achievements.filter(a => a.unlocked).length}/{data.achievements.length}
              </div>
              <div className="text-organa-text-muted text-xs">Completado</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
