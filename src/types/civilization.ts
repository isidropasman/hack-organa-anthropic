// src/types/civilization.ts — Agent Civilization Layer types

// ─── Message types ────────────────────────────────────────────────────────────
export type MessageIntent    = 'request' | 'delegate' | 'status_update' | 'decision' | 'question' | 'escalation'
export type MessageUrgency   = 'low' | 'normal' | 'high' | 'critical'
export type OutcomeStatus    = 'pending' | 'acknowledged' | 'completed' | 'failed' | 'rejected'

// ─── Meeting types ────────────────────────────────────────────────────────────
export type MeetingType      = 'standup' | 'planning' | 'review' | 'incident' | 'brainstorm' | '1on1'
export type MeetingStatus    = 'scheduled' | 'in_progress' | 'completed' | 'cancelled'
export type ContributionStance = 'agree' | 'disagree' | 'neutral' | 'propose_alternative'

// ─── Tribunal types ───────────────────────────────────────────────────────────
export type CaseSeverity     = 'warning' | 'review' | 'critical' | 'replacement'
export type CaseStatus       = 'open' | 'investigating' | 'resolved' | 'dismissed'

// ─── Academia types ───────────────────────────────────────────────────────────
export type AcademiaStatus   = 'enrolled' | 'in_progress' | 'testing' | 'graduated' | 'failed'

// ─── Score types ──────────────────────────────────────────────────────────────
export type ScoreLevel       = 'excellent' | 'good' | 'warning' | 'critical' | 'terminal'

// ─── Core interfaces ──────────────────────────────────────────────────────────

export interface CivAgent {
  id:         string
  name:       string
  role:       string
  department: string
  avatar:     string  // 2-letter initials
  mode:       'autonomous' | 'assisted' | 'shadow'
}

export interface SynapseMessage {
  id:         string
  from:       string  // agent id
  to:         string  // agent id
  intent:     MessageIntent
  urgency:    MessageUrgency
  content:    string
  outcome:    OutcomeStatus
  tokens_used: number
  timestamp:  string  // display time "09:14"
  created_at: string  // ISO date
}

export interface SynapseChannel {
  id:             string
  type:           'direct' | 'group'
  name?:          string
  participant_ids: string[]
  messages:       SynapseMessage[]
}

export interface MeetingContribution {
  agent_id:  string
  role:      'facilitator' | 'participant'
  content:   string
  stance:    ContributionStance
  timestamp: string
}

export interface MeetingActionItem {
  assigned_to: string  // agent id
  description: string
  priority:    'low' | 'medium' | 'high'
}

export interface NexusMeeting {
  id:              string
  type:            MeetingType
  title:           string
  facilitator_id:  string
  participant_ids: string[]
  status:          MeetingStatus
  contributions:   MeetingContribution[]
  action_items:    MeetingActionItem[]
  minutes_summary?: string
  total_tokens:    number
  started_at:      string
  ended_at?:       string
}

export interface AgentScore {
  agent_id:        string
  execution:       number  // 0-100
  communication:   number
  collaboration:   number
  efficiency:      number
  composite:       number
  trajectory_slope: number  // positive = improving
}

export interface ScoreSnapshot {
  date:          string
  composite:     number
  execution:     number
  communication: number
  collaboration: number
  efficiency:    number
}

export interface TribunalCase {
  id:         string
  agent_id:   string
  severity:   CaseSeverity
  status:     CaseStatus
  trigger:    string
  chain_of_responsibility: {
    agent_id:        string
    role_in_failure: string
    contribution:    number  // 0-1
  }[]
  verdict?: {
    action:    'warning' | 'retrain' | 'restrict' | 'replace'
    reasoning: string
  }
  created_at:   string
  resolved_at?: string
}

export interface AcademiaSession {
  agent_id:   string
  status:     AcademiaStatus
  started_at: string
  curriculum: {
    skill:   string
    status:  'pending' | 'in_progress' | 'passed' | 'failed'
    score?:  number
  }[]
  mentor_patterns: {
    from_agent_id: string
    pattern:       string
  }[]
  graduation_score?: number
}

export interface CommLink {
  from:   string
  to:     string
  weight: number  // message count
}

// ─── Utility functions ────────────────────────────────────────────────────────

export function getScoreLevel(composite: number): ScoreLevel {
  if (composite >= 85) return 'excellent'
  if (composite >= 70) return 'good'
  if (composite >= 50) return 'warning'
  if (composite >= 30) return 'critical'
  return 'terminal'
}

export function computeComposite(s: {
  execution: number; communication: number; collaboration: number; efficiency: number
}): number {
  return Number((s.execution * 0.35 + s.communication * 0.20 + s.collaboration * 0.25 + s.efficiency * 0.20).toFixed(1))
}

export const SCORE_COLORS: Record<ScoreLevel, string> = {
  excellent: '#10B981',
  good:      '#3B82F6',
  warning:   '#F59E0B',
  critical:  '#EF4444',
  terminal:  '#F43F5E',
}

export const INTENT_COLORS: Record<MessageIntent, string> = {
  delegate:      '#8B5CF6',
  request:       '#3B82F6',
  status_update: '#10B981',
  decision:      '#6366F1',
  question:      '#F59E0B',
  escalation:    '#EF4444',
}
