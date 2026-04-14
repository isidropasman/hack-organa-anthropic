'use client'

import { useState } from 'react'
import { Lock } from 'lucide-react'
import type { Achievement } from '@/lib/mock-data-employee'

interface Props {
  achievement: Achievement
}

export default function AchievementBadge({ achievement }: Props) {
  const [expanded, setExpanded] = useState(false)

  if (!achievement.unlocked) {
    return (
      <div className="flex-shrink-0 w-36 bg-organa-bg border border-organa-border rounded-2xl p-4 opacity-40 select-none">
        <div className="flex flex-col items-center text-center gap-2">
          <div className="w-12 h-12 rounded-xl bg-organa-border flex items-center justify-center">
            <Lock size={18} className="text-organa-text-muted" />
          </div>
          <p className="text-xs font-semibold text-organa-text-muted leading-snug">
            {achievement.title}
          </p>
        </div>
      </div>
    )
  }

  return (
    <button
      onClick={() => setExpanded(e => !e)}
      className="flex-shrink-0 w-36 bg-white border border-organa-border rounded-2xl p-4 shadow-card hover:shadow-card-hover hover:border-organa-border-strong transition-all text-left"
    >
      <div className="flex flex-col items-center text-center gap-2">
        <div className="w-12 h-12 rounded-xl bg-organa-accent-light flex items-center justify-center text-2xl">
          {achievement.icon}
        </div>
        <p className="text-xs font-semibold text-organa-text leading-snug">
          {achievement.title}
        </p>
        {expanded ? (
          <>
            <p className="text-xs text-organa-text-muted leading-snug">
              {achievement.description}
            </p>
            {achievement.unlockedAt && (
              <p className="text-xs text-organa-success font-medium">{achievement.unlockedAt}</p>
            )}
          </>
        ) : (
          achievement.unlockedAt && (
            <p className="text-xs text-organa-text-muted opacity-70">{achievement.unlockedAt}</p>
          )
        )}
      </div>
    </button>
  )
}
