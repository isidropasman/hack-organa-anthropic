import type { KRSAgent } from '@/lib/types'

interface Props {
  agent: KRSAgent
}

export default function SourceBreakdown({ agent }: Props) {
  const total = agent.tasksBySource.screenLearning + agent.tasksBySource.chat
  const screenPct = total > 0 ? (agent.tasksBySource.screenLearning / total) * 100 : 0
  const chatPct = 100 - screenPct

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs text-organa-text-muted">
        <span>Fuente de tareas</span>
        <div className="flex gap-3">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-organa-accent inline-block" />
            Screen {agent.tasksBySource.screenLearning}
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-organa-muted inline-block" />
            Chat {agent.tasksBySource.chat}
          </span>
        </div>
      </div>
      <div className="h-2 bg-organa-border rounded-full overflow-hidden flex">
        <div
          className="h-full bg-organa-accent transition-all duration-500"
          style={{ width: `${screenPct}%` }}
        />
        <div
          className="h-full bg-organa-muted transition-all duration-500"
          style={{ width: `${chatPct}%` }}
        />
      </div>
    </div>
  )
}
