'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp, CheckCircle2, AlertTriangle } from 'lucide-react'
import type { MonitoredAgent } from '@/lib/types'
import SparkLine from './SparkLine'

interface Props {
  agent: MonitoredAgent
}

function approvalColor(rate: number) {
  if (rate >= 80) return 'text-green-600'
  if (rate >= 70) return 'text-amber-600'
  return 'text-red-600'
}

function approvalBarColor(rate: number) {
  if (rate >= 80) return 'bg-green-500'
  if (rate >= 70) return 'bg-amber-500'
  return 'bg-red-500'
}

function confidenceColor(conf: number) {
  if (conf >= 0.7) return 'text-green-600'
  if (conf >= 0.6) return 'text-amber-600'
  return 'text-red-600'
}

function errorRateColor(rate: number) {
  if (rate === 0) return 'text-green-600'
  if (rate <= 2) return 'text-green-600'
  if (rate <= 5) return 'text-amber-600'
  return 'text-red-600'
}

function modeBadgeClass(mode: MonitoredAgent['mode']) {
  const map = {
    shadow: 'bg-slate-100 text-slate-600 border-slate-200',
    assisted: 'bg-blue-50 text-blue-700 border-blue-200',
    autonomous: 'bg-green-50 text-green-700 border-green-200',
  }
  return map[mode]
}

function modeLabel(mode: MonitoredAgent['mode']) {
  return { shadow: 'Shadow', assisted: 'Assisted', autonomous: 'Autonomous' }[mode]
}

function sparkColor(rate: number) {
  if (rate >= 80) return '#22C55E'
  if (rate >= 70) return '#F59E0B'
  return '#EF4444'
}

export default function AgentTableRow({ agent }: Props) {
  const [expanded, setExpanded] = useState(false)
  const hasCritical = agent.alerts.some(a => a.type === 'critical')
  const hasAlerts = agent.alerts.length > 0
  const initials = agent.name
    .split(' ')
    .map(n => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  const rowBorderClass = hasCritical
    ? 'border-l-2 border-l-red-500'
    : hasAlerts
    ? 'border-l-2 border-l-amber-500'
    : ''

  return (
    <>
      <tr
        className={`border-b border-organa-border hover:bg-organa-border/20 cursor-pointer transition-colors ${rowBorderClass}`}
        onClick={() => setExpanded(e => !e)}
      >
        {/* Agent */}
        <td className="px-4 py-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-organa-accent/20 flex items-center justify-center text-organa-accent font-bold text-xs flex-shrink-0">
              {initials}
            </div>
            <span className="text-organa-text text-sm font-medium">{agent.name}</span>
          </div>
        </td>

        {/* Role */}
        <td className="px-4 py-3 text-organa-text-muted text-sm">{agent.role}</td>

        {/* Mode */}
        <td className="px-4 py-3">
          <span
            className={`text-xs px-2 py-0.5 rounded-full border font-medium ${modeBadgeClass(agent.mode)}`}
          >
            {modeLabel(agent.mode)}
          </span>
        </td>

        {/* Approval Rate */}
        <td className="px-4 py-3">
          <div className="flex items-center gap-2">
            <span className={`text-sm font-semibold tabular-nums ${approvalColor(agent.metrics.approvalRate)}`}>
              {agent.metrics.approvalRate}%
            </span>
            <div className="w-14 h-1.5 bg-organa-border rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${approvalBarColor(agent.metrics.approvalRate)}`}
                style={{ width: `${agent.metrics.approvalRate}%` }}
              />
            </div>
          </div>
        </td>

        {/* Confidence */}
        <td className={`px-4 py-3 text-sm font-semibold tabular-nums ${confidenceColor(agent.metrics.confidenceAvg)}`}>
          {agent.metrics.confidenceAvg.toFixed(2)}
        </td>

        {/* Cost */}
        <td className="px-4 py-3 text-organa-text text-sm tabular-nums">
          ${agent.metrics.totalCost.toFixed(2)}
        </td>

        {/* Observation hours */}
        <td className="px-4 py-3 text-organa-text-muted text-sm tabular-nums">
          {agent.metrics.screenHours}h
        </td>

        {/* Alerts */}
        <td className="px-4 py-3">
          {agent.alerts.length === 0 ? (
            <CheckCircle2 size={15} className="text-green-600" />
          ) : (
            <div
              className={`flex items-center gap-1.5 text-xs font-medium ${
                hasCritical ? 'text-red-600' : 'text-amber-600'
              }`}
            >
              <AlertTriangle size={13} />
              {agent.alerts.length}
            </div>
          )}
        </td>

        {/* Expand toggle */}
        <td className="px-3 py-3 text-organa-text-muted">
          {expanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
        </td>
      </tr>

      {/* Expanded detail row */}
      {expanded && (
        <tr className="bg-slate-50 border-b border-organa-border">
          <td colSpan={9} className="px-4 py-4">
            <div className="grid grid-cols-3 gap-6">
              {/* Sparkline */}
              <div>
                <div className="text-xs text-organa-text-muted mb-2 font-medium">
                  Approval Rate — last 5 weeks
                </div>
                <SparkLine
                  data={agent.weeklyTrend}
                  color={sparkColor(agent.metrics.approvalRate)}
                />
                <div className="flex justify-between text-xs text-organa-text-muted mt-1">
                  <span>Wk 1</span>
                  <span>Wk 5</span>
                </div>
              </div>

              {/* Metrics grid */}
              <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs content-start">
                <span className="text-organa-text-muted">Proposals:</span>
                <span className="text-organa-text">
                  {agent.metrics.proposals} ({agent.metrics.approved} apr / {agent.metrics.rejected} rej)
                </span>
                <span className="text-organa-text-muted">Cost/action:</span>
                <span className="text-organa-text">${agent.metrics.costPerAction.toFixed(2)}</span>
                <span className="text-organa-text-muted">Res. time:</span>
                <span className="text-organa-text">{agent.metrics.timeToResolution}</span>
                <span className="text-organa-text-muted">KB coverage:</span>
                <span className="text-organa-text">{agent.metrics.knowledgeCoverage}%</span>
                <span className="text-organa-text-muted">Automation:</span>
                <span className="text-organa-text">{agent.metrics.automationRate}%</span>
                <span className="text-organa-text-muted">Error rate:</span>
                <span className={errorRateColor(agent.metrics.errorRate)}>
                  {agent.metrics.errorRate}%
                </span>
              </div>

              {/* Alerts in expanded */}
              {agent.alerts.length > 0 && (
                <div>
                  <div className="text-xs text-organa-text-muted mb-2 font-medium">Alerts</div>
                  <div className="space-y-1.5">
                    {agent.alerts.map((alert, i) => (
                      <div
                        key={i}
                        className={`text-xs px-2 py-1.5 rounded border flex items-start gap-1.5 ${
                          alert.type === 'critical'
                            ? 'bg-red-50 border-red-200 text-red-700'
                            : 'bg-amber-50 border-amber-200 text-amber-700'
                        }`}
                      >
                        <span className="flex-shrink-0">{alert.type === 'critical' ? '🔴' : '🟡'}</span>
                        <span className="leading-relaxed">{alert.message}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </td>
        </tr>
      )}
    </>
  )
}
