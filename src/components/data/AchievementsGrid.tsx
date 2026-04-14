import type { Achievement } from '@/lib/mock-data-employee'
import AchievementBadge from './AchievementBadge'

interface Props {
  achievements: Achievement[]
}

export default function AchievementsGrid({ achievements }: Props) {
  const unlocked = achievements.filter(a => a.unlocked).length

  return (
    <div className="bg-white border border-organa-border rounded-2xl p-6 shadow-card">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-base font-semibold text-organa-text">Logros</h2>
          <p className="text-xs text-organa-text-muted mt-0.5">
            Haz click en un logro para ver el detalle
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xl">{unlocked === achievements.length ? '🏆' : '⭐'}</span>
          <span className="text-sm font-semibold text-organa-text">
            {unlocked}
            <span className="font-normal text-organa-text-muted">/{achievements.length} desbloqueados</span>
          </span>
        </div>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-2">
        {achievements.map(a => (
          <AchievementBadge key={a.id} achievement={a} />
        ))}
      </div>
    </div>
  )
}
