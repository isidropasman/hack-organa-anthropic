'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp, Monitor } from 'lucide-react'
import type { KRSAgent } from '@/lib/types'
import KRSRadarChart from './KRSRadarChart'
import KRSGapsList from './KRSGapsList'
import SourceBreakdown from './SourceBreakdown'

interface Props {
  agent: KRSAgent
}

function krsColors(score: number) {
  if (score >= 80) return { text: 'text-green-400', bg: 'bg-green-950/40', border: 'border-green-900/50' }
  if (score >= 60) return { text: 'text-amber-400', bg: 'bg-amber-950/40', border: 'border-amber-900/50' }
  return { text: 'text-red-400', bg: 'bg-red-950/40', border: 'border-red-900/50' }
}

function modeBadgeClass(mode: KRSAgent['mode']) {
  const map = {
    shadow: 'bg-organa-muted/30 text-organa-text-muted border-organa-border',
    assisted: 'bg-blue-900/30 text-blue-400 border-blue-800/60',
    autonomous: 'bg-green-900/30 text-green-400 border-green-800/60',
  }
  return map[mode]
}

function modeLabel(mode: KRSAgent['mode']) {
  return { shadow: 'Shadow', assisted: 'Assisted', autonomous: 'Autonomous' }[mode]
}

export default function KRSAgentCard({ agent }: Props) {
  const [expanded, setExpanded] = useState(false)
  const colors = krsColors(agent.krs)
  const taskFillPct = agent.tasksExpected > 0 ? (agent.tasksDocumented / agent.tasksExpected) * 100 : 0
  const taskBarColor =
    taskFillPct >= 80 ? 'bg-green-500' : taskFillPct >= 50 ? 'bg-amber-500' : 'bg-red-500'

  return (
    <div className="bg-organa-surface border border-organa-border rounded-xl overflow-hidden hover:border-organa-muted transition-colors">
      <button
        className="w-full text-left p-5 hover:bg-organa-border/20 transition-colors"
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
            </div>
            <p className="text-organa-text-muted text-sm mt-0.5">{agent.role}</p>

            {/* Task progress bar */}
            <div className="mt-3">
              <div className="flex justify-between text-xs text-organa-text-muted mb-1">
                <span>{agent.tasksDocumented}/{agent.tasksExpected} tareas documentadas</span>
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
              {agent.screenHours}h observación
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
        <div className="border-t border-organa-border p-5 bg-organa-bg/30 space-y-5">
          {/* Overlap warning */}
          {agent.overlapWarning && (
            <div className="flex items-start gap-2 px-3 py-2.5 bg-amber-950/30 border border-amber-900/50 rounded-lg">
              <span className="text-amber-400 text-xs flex-shrink-0 mt-0.5">⚠</span>
              <span className="text-amber-300 text-xs">{agent.overlapWarning}</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-6">
            {/* Radar chart */}
            <div>
              <h4 className="text-xs font-medium text-organa-text-muted uppercase tracking-wide mb-2">
                Dimensiones KRS
              </h4>
              <KRSRadarChart dimensions={agent.dimensions} />
            </div>

            {/* Gaps + source breakdown */}
            <div className="space-y-4">
              <div>
                <h4 className="text-xs font-medium text-organa-text-muted uppercase tracking-wide mb-2">
                  Gaps detectados ({agent.gaps.length})
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
              Iniciar observación adicional
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
