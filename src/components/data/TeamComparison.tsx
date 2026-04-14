import { Users } from 'lucide-react'
import type { TeamComparisonData } from '@/lib/mock-data-employee'
import ComparisonBar from './ComparisonBar'

interface Props {
  data: TeamComparisonData
}

export default function TeamComparison({ data }: Props) {
  return (
    <div className="bg-white border border-organa-border rounded-2xl p-6 shadow-card">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Users size={16} className="text-organa-accent" />
            <h2 className="text-base font-semibold text-organa-text">
              Tu Twin vs. el Equipo
            </h2>
          </div>
          <p className="text-xs text-organa-text-muted">
            Comparación con {data.teamStats.totalTwinsActive} twins activos ·
            Solo se destacan tus fortalezas
          </p>
        </div>

        {/* Team size badge */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-organa-bg border border-organa-border rounded-full">
          <span className="text-sm">👥</span>
          <span className="text-xs font-medium text-organa-text">
            {data.teamStats.totalTwinsActive} twins
          </span>
        </div>
      </div>

      {/* Comparison bars grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {data.highlights.map((h, i) => (
          <ComparisonBar key={i} highlight={h} />
        ))}
      </div>

      {/* Footer note */}
      <p className="text-xs text-organa-text-muted mt-6 pt-4 border-t border-organa-border">
        ORGANA nunca muestra rankings negativos ni datos de otros empleados.
      </p>
    </div>
  )
}
