'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp, Monitor } from 'lucide-react'
import type { KRSAgent } from '@/lib/types'
import KRSRadarChart from './KRSRadarChart'
import KRSGapsList from './KRSGapsList'
import SourceBreakdown from './SourceBreakdown'
import AgentInbox from './AgentInbox'
import { getInboxForAgent } from '@/lib/inbox-data'

interface Props {
  agent: KRSAgent
}

function krsColors(score: number) {
  if (score >= 80) return { text: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200' }
  if (score >= 60) return { text: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200' }
  return { text: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' }
}

function modeBadgeClass(mode: KRSAgent['mode']) {
  const map = {
    shadow: 'bg-slate-100 text-slate-600 border-slate-200',
    assisted: 'bg-blue-50 text-blue-600 border-blue-200',
    autonomous: 'bg-green-50 text-green-600 border-green-200',
  }
  return map[mode]
}

function modeLabel(mode: KRSAgent['mode']) {
  return { shadow: 'Shadow', assisted: 'Assisted', autonomous: 'Autonomous' }[mode]
}

type PanelTab = 'details' | 'inbox'

export default function KRSAgentCard({ agent }: Props) {
  const [expanded, setExpanded] = useState(false)
  const [panelTab, setPanelTab] = useState<PanelTab>('details')
  const colors = krsColors(agent.krs)
  const taskFillPct = agent.tasksExpected > 0 ? (agent.tasksDocumented / agent.tasksExpected) * 100 : 0
  const taskBarColor =
    taskFillPct >= 80 ? 'bg-green-500' : taskFillPct >= 50 ? 'bg-amber-500' : 'bg-red-500'

  const { inbound, outbound } = getInboxForAgent(agent.id)
  const inboxCount = inbound.length + outbound.length
  const pendingCount = [...inbound, ...outbound].filter(r => r.status === 'pending').length

  return (
    <div className="bg-organa-surface border border-organa-border rounded-xl overflow-hidden hover:border-organa-muted transition-colors">
      <button
        className="w-full text-left p-5 hover:bg-slate-50 transition-colors"
        onClick={() => setExpanded(e => !e)}
      >
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <div className="w-11 h-11 rounded-full bg-organa-accent/20 flex items-center justify-center text-organa-accent font-bold text-sm flex-shrink-0">
            {agent.avatar}
          </div>

          {/* Name / Role / Progress */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-organa-text">{agent.name}</span>
              <span
                className={`text-xs px-2 py-0.5 rounded-full border font-medium ${modeBadgeClass(agent.mode)}`}
              >
                {modeLabel(agent.mode)}
              </span>
              {inboxCount > 0 && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200 font-medium">
                  📬 {inboxCount}
                </span>
              )}
            </div>
            <p className="text-organa-text-muted text-sm mt-0.5">{agent.role}</p>

            {/* Task progress bar */}
            <div className="mt-3">
              <div className="flex justify-between text-xs text-organa-text-muted mb-1">
                <span>{agent.tasksDocumented}/{agent.tasksExpected} tasks documented</span>
                <div className="flex items-center gap-2">
                  <span title="Screen learning">🖥 {agent.tasksBySource.screenLearning}</span>
                  <span title="Chat">💬 {agent.tasksBySource.chat}</span>
                </div>
              </div>
              <div className="h-1.5 bg-organa-border rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${taskBarColor}`}
                  style={{ width: `${taskFillPct}%` }}
                />
              </div>
            </div>

            <p className="text-xs text-organa-text-muted mt-2 flex items-center gap-1">
              <Monitor size={11} />
              {agent.screenHours}h observation
            </p>
          </div>

          {/* KRS Score badge */}
          <div
            className={`text-right flex-shrink-0 px-3 py-2 rounded-lg ${colors.bg} border ${colors.border}`}
          >
            <div className={`text-3xl font-bold leading-none ${colors.text}`}>{agent.krs}</div>
            <div className="text-organa-text-muted text-xs mt-1">KRS</div>
          </div>

          <div className="text-organa-text-muted self-center flex-shrink-0">
            {expanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
          </div>
        </div>
      </button>

      {/* Expanded panel */}
      {expanded && (
        <div className="border-t border-organa-border">
          {/* Panel tabs */}
          <div className="flex border-b border-organa-border px-5">
            <PanelTabBtn
              active={panelTab === 'details'}
              onClick={() => setPanelTab('details')}
              label="Details"
            />
            <PanelTabBtn
              active={panelTab === 'inbox'}
              onClick={() => setPanelTab('inbox')}
              label={`Inbox${inboxCount > 0 ? ` (${inboxCount})` : ''}`}
              badge={pendingCount > 0 ? pendingCount : undefined}
            />
          </div>

          {/* Panel content */}
          <div className="p-5 bg-slate-50/50 space-y-5">
            {panelTab === 'details' ? (
              <>
                {/* Overlap warning */}
                {agent.overlapWarning && (
                  <div className="flex items-start gap-2 px-3 py-2.5 bg-amber-50 border border-amber-200 rounded-lg">
                    <span className="text-amber-600 text-xs flex-shrink-0 mt-0.5">⚠</span>
                    <span className="text-amber-700 text-xs">{agent.overlapWarning}</span>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-6">
                  {/* Radar chart */}
                  <div>
                    <h4 className="text-xs font-medium text-organa-text-muted uppercase tracking-wide mb-2">
                      KRS Dimensions
                    </h4>
                    <KRSRadarChart dimensions={agent.dimensions} />
                  </div>

                  {/* Gaps + source breakdown */}
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-xs font-medium text-organa-text-muted uppercase tracking-wide mb-2">
                        Detected gaps ({agent.gaps.length})
                      </h4>
                      <KRSGapsList agent={agent} />
                    </div>

                    <SourceBreakdown agent={agent} />

                    <p className="text-xs text-organa-text-muted">{agent.onboardingDuration}</p>
                  </div>
                </div>

                {/* Non-functional action button */}
                <div className="pt-2 border-t border-organa-border">
                  <button
                    disabled
                    className="px-4 py-2 text-sm bg-organa-accent/10 text-organa-accent border border-organa-accent/30 rounded-lg cursor-default opacity-60"
                  >
                    Start additional observation
                  </button>
                </div>
              </>
            ) : (
              <AgentInbox agentId={agent.id} />
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function PanelTabBtn({
  active,
  onClick,
  label,
  badge,
}: {
  active: boolean
  onClick: () => void
  label: string
  badge?: number
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-medium border-b-2 transition-colors ${
        active
          ? 'border-organa-accent text-organa-accent'
          : 'border-transparent text-organa-text-muted hover:text-organa-text'
      }`}
    >
      {label}
      {badge !== undefined && (
        <span className="px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
          {badge}
        </span>
      )}
    </button>
  )
}
