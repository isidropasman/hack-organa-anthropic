import type { MonitoredAgent } from '@/lib/types'
import AlertCard from './AlertCard'

interface Props {
  agents: MonitoredAgent[]
}

export default function AlertsPanel({ agents }: Props) {
  const allAlerts = agents.flatMap(agent =>
    agent.alerts.map(alert => ({ alert, agent }))
  )
  const critical = allAlerts.filter(({ alert }) => alert.type === 'critical')
  const warnings = allAlerts.filter(({ alert }) => alert.type === 'warning')

  return (
    <div className="bg-organa-surface border border-organa-border rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-organa-text">Active alerts</h2>
        {allAlerts.length > 0 && (
          <span className="px-2 py-0.5 rounded-full bg-red-900/30 text-red-400 border border-red-900/50 text-xs font-medium">
            {allAlerts.length}
          </span>
        )}
      </div>

      {allAlerts.length === 0 ? (
        <div className="text-center py-8 text-organa-text-muted text-sm">
          ✓ No active alerts
        </div>
      ) : (
        <div className="space-y-4">
          {critical.length > 0 && (
            <div>
              <div className="text-xs font-medium text-red-400 mb-2">
                🔴 Critical ({critical.length})
              </div>
              <div className="space-y-2">
                {critical.map(({ alert, agent }, i) => (
                  <AlertCard
                    key={i}
                    alert={alert}
                    agentName={agent.name}
                    agentRole={agent.role}
                  />
                ))}
              </div>
            </div>
          )}

          {warnings.length > 0 && (
            <div>
              <div className="text-xs font-medium text-amber-400 mb-2">
                🟡 Warning ({warnings.length})
              </div>
              <div className="space-y-2">
                {warnings.map(({ alert, agent }, i) => (
                  <AlertCard
                    key={i}
                    alert={alert}
                    agentName={agent.name}
                    agentRole={agent.role}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
