import type { MonitoredAgent } from '@/lib/types'
import AgentTableRow from './AgentTableRow'

interface Props {
  agents: MonitoredAgent[]
}

const headers = [
  { label: 'Agent' },
  { label: 'Role' },
  { label: 'Mode' },
  { label: 'Approval Rate' },
  { label: 'Confidence' },
  { label: 'Cost' },
  { label: 'Observation' },
  { label: 'Alerts' },
  { label: '' },
]

export default function AgentTable({ agents }: Props) {
  return (
    <div className="bg-organa-surface border border-organa-border rounded-xl overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="border-b border-organa-border bg-organa-bg/40">
            {headers.map((h, i) => (
              <th
                key={i}
                className="px-4 py-3 text-left text-xs font-medium text-organa-text-muted uppercase tracking-wide"
              >
                {h.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {agents.map(agent => (
            <AgentTableRow key={agent.id} agent={agent} />
          ))}
        </tbody>
      </table>
    </div>
  )
}
