import type { AgentAlert } from '@/lib/types'

interface Props {
  alert: AgentAlert
  agentName: string
  agentRole: string
}

export default function AlertCard({ alert, agentName, agentRole }: Props) {
  const isCritical = alert.type === 'critical'
  return (
    <div
      className={`flex items-start gap-3 p-3 rounded-lg border ${
        isCritical
          ? 'bg-red-950/30 border-red-900/50'
          : 'bg-amber-950/20 border-amber-900/40'
      }`}
    >
      <span className="flex-shrink-0 text-sm">{isCritical ? '🔴' : '🟡'}</span>
      <div className="min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-semibold text-organa-text">{agentName}</span>
          <span className="text-xs text-organa-text-muted">{agentRole}</span>
        </div>
        <p className={`text-xs mt-0.5 leading-relaxed ${isCritical ? 'text-red-300' : 'text-amber-300'}`}>
          {alert.message}
        </p>
      </div>
    </div>
  )
}
