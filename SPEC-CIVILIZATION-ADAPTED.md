# SPEC-CIVILIZATION: Agent Civilization Layer — UI + Mock Data

Read CLAUDE.md before touching any file. Scan `src/` to understand the existing patterns — pay special attention to how `/brain`, `/krs`, and `/monitoring` pages work, how `src/lib/mock-data.ts` and `src/lib/mock-data-employee.ts` are structured, and the Tailwind design tokens (look for `organa-*` custom classes in `tailwind.config.ts` and `globals.css`).

## WHAT WE'RE BUILDING

A new `/civilization` page (linked from the main nav) that demonstrates ORGANA's "Agent Civilization Layer" — 5 interconnected systems for inter-agent communication, meetings, reputation scoring, audit, and learning. Everything runs on seeded mock data, no database required. Same architectural pattern as `/brain` and `/monitoring`.

The 5 pillars:
1. **SYNAPSE** — Agent-to-agent communication protocol (structured messages with intent classification)
2. **NEXUS** — Meeting simulation engine (structured meetings with rounds, facilitators, action items)
3. **SCORE** — Agent reputation system (multi-dimensional scoring with trajectory analysis)
4. **TRIBUNAL** — Audit court (anomaly detection, chain of responsibility, replacement proceedings)
5. **ACADEMIA** — Agent learning faculty (retraining pipeline using failure profiles)

## PHASE 1: Types

Create `src/types/civilization.ts` with all the types for the civilization layer. Export everything.

```typescript
// Message types
export type MessageIntent = 'request' | 'delegate' | 'status_update' | 'decision' | 'question' | 'escalation';
export type MessageUrgency = 'low' | 'normal' | 'high' | 'critical';
export type OutcomeStatus = 'pending' | 'acknowledged' | 'completed' | 'failed' | 'rejected';

// Meeting types
export type MeetingType = 'standup' | 'planning' | 'review' | 'incident' | 'brainstorm' | '1on1';
export type MeetingStatus = 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
export type ContributionStance = 'agree' | 'disagree' | 'neutral' | 'propose_alternative';

// Tribunal types
export type CaseSeverity = 'warning' | 'review' | 'critical' | 'replacement';
export type CaseStatus = 'open' | 'investigating' | 'resolved' | 'dismissed';

// Academia types
export type AcademiaStatus = 'enrolled' | 'in_progress' | 'testing' | 'graduated' | 'failed';

// Score types
export type ScoreLevel = 'excellent' | 'good' | 'warning' | 'critical' | 'terminal';

export interface CivAgent {
  id: string;
  name: string;
  role: string;
  department: string;
  avatar: string; // 2-letter initials
  mode: 'autonomous' | 'assisted' | 'shadow';
}

export interface SynapseMessage {
  id: string;
  from: string; // agent id
  to: string; // agent id
  intent: MessageIntent;
  urgency: MessageUrgency;
  content: string;
  outcome: OutcomeStatus;
  tokens_used: number;
  timestamp: string; // display time like "09:14"
  created_at: string; // ISO date
}

export interface SynapseChannel {
  id: string;
  type: 'direct' | 'group';
  name?: string;
  participant_ids: string[];
  messages: SynapseMessage[];
}

export interface MeetingContribution {
  agent_id: string;
  role: 'facilitator' | 'participant';
  content: string;
  stance: ContributionStance;
  timestamp: string;
}

export interface MeetingActionItem {
  assigned_to: string; // agent id
  description: string;
  priority: 'low' | 'medium' | 'high';
}

export interface NexusMeeting {
  id: string;
  type: MeetingType;
  title: string;
  facilitator_id: string;
  participant_ids: string[];
  status: MeetingStatus;
  contributions: MeetingContribution[];
  action_items: MeetingActionItem[];
  minutes_summary?: string;
  total_tokens: number;
  started_at: string;
  ended_at?: string;
}

export interface AgentScore {
  agent_id: string;
  execution: number; // 0-100
  communication: number;
  collaboration: number;
  efficiency: number;
  composite: number; // weighted average
  trajectory_slope: number; // positive = improving
}

export interface ScoreSnapshot {
  date: string;
  composite: number;
  execution: number;
  communication: number;
  collaboration: number;
  efficiency: number;
}

export interface TribunalCase {
  id: string;
  agent_id: string;
  severity: CaseSeverity;
  status: CaseStatus;
  trigger: string;
  chain_of_responsibility: {
    agent_id: string;
    role_in_failure: string;
    contribution: number; // 0-1
  }[];
  verdict?: {
    action: 'warning' | 'retrain' | 'restrict' | 'replace';
    reasoning: string;
  };
  created_at: string;
  resolved_at?: string;
}

export interface AcademiaSession {
  agent_id: string;
  status: AcademiaStatus;
  started_at: string;
  curriculum: {
    skill: string;
    status: 'pending' | 'in_progress' | 'passed' | 'failed';
    score?: number;
  }[];
  mentor_patterns: {
    from_agent_id: string;
    pattern: string;
  }[];
  graduation_score?: number;
}

export interface CommLink {
  from: string;
  to: string;
  weight: number; // message count
}

// Utility functions
export function getScoreLevel(composite: number): ScoreLevel {
  if (composite >= 85) return 'excellent';
  if (composite >= 70) return 'good';
  if (composite >= 50) return 'warning';
  if (composite >= 30) return 'critical';
  return 'terminal';
}

export function computeComposite(s: { execution: number; communication: number; collaboration: number; efficiency: number }): number {
  return Number((s.execution * 0.35 + s.communication * 0.20 + s.collaboration * 0.25 + s.efficiency * 0.20).toFixed(1));
}
```

## PHASE 2: Mock Data

Create `src/lib/mock-data-civilization.ts`. This is the heart of the demo — all data is hardcoded here and tells a coherent STORY.

The file exports:
- `AGENTS: CivAgent[]` — 8 agents representing a company (CEO, CTO, CFO, PM, Dev, Marketing, Ops, HR). Each has a memorable name prefix (like ARIA-CEO, NOVA-CTO, etc.)
- `SCORES: Record<string, AgentScore>` — one per agent. Most are good (70-95), one PM agent is in "warning" (54), one Marketing agent is in "critical" (39). Include trajectory_slope per agent.
- `SCORE_HISTORY: Record<string, ScoreSnapshot[]>` — 14 daily snapshots per agent showing trajectory. The critical agent should show steady decline. The excellent agents show growth.
- `SYNAPSE_MESSAGES: SynapseMessage[]` — 15-20 messages that tell a story:
  - CEO delegates technical analysis to CTO (delegate, high urgency)
  - CTO delegates to Dev (delegate, high)
  - Dev completes and reports back (status_update, normal)
  - CTO reports to CEO (status_update, high)
  - CEO asks CFO to validate numbers (request, normal)
  - Marketing asks PM for timeline (question, normal)
  - PM doesn't have it, escalates (escalation, high)
  - Ops asks HR to review underperforming agent (request, normal)
  - Write ALL content in Spanish — this is a LatAm product demo
- `COMM_LINKS: CommLink[]` — 10-12 links showing who talks to who and how much (derived from message patterns)
- `MEETINGS: NexusMeeting[]` — 2 meetings:
  1. A completed daily standup with 10 contributions showing each agent reporting. Include a moment where the facilitator (CEO) calls out the PM for having no tasks assigned and the CTO admits they forgot to include PM in planning. Write in Spanish.
  2. An in-progress planning meeting with 5 contributions so far.
- `TRIBUNAL_CASES: TribunalCase[]` — 2 cases:
  1. Critical open case against the Marketing agent — score dropped to 39, 3 weeks declining. Chain of responsibility: Marketing 70% (doesn't read shared docs, doesn't escalate), PM 20% (didn't provide timeline), CTO 10% (didn't include PM in planning). Verdict: retrain. Reasoning in Spanish.
  2. Warning case against PM — monitoring, no verdict yet.
- `ACADEMIA_SESSIONS: AcademiaSession[]` — 1 session:
  The Marketing agent in retraining. Status: in_progress. Curriculum: 4 skills (proactive doc reading — passed 78, escalation — testing, specific communication — pending, cross-dept collaboration — pending). Mentor patterns from top-performing agents.

ALL content (message text, verdicts, meeting contributions, curriculum skills, trigger descriptions) should be in **Spanish**.

## PHASE 3: The Page and Components

### Page: `src/app/civilization/page.tsx`

The main page with tab navigation. 6 tabs: Control Room, Synapse, Nexus, Tribunal, Score, Academia. Use URL search params for active tab (`?tab=synapse`).

Import all data from mock-data-civilization.ts. No API calls needed — everything renders from the imported mock data.

### Navigation
Add a "Civilization" link to whatever navigation exists in the app (check the layout files and any nav/sidebar components). If there's a sidebar, add it there. If there's a top nav, add it there. Just make sure it's reachable.

### Components directory: `src/components/civilization/`

Create these components. Follow the exact same patterns used in other pages of the app (check `/brain`, `/monitoring`, `/krs` for reference on component structure, imports, and Tailwind usage).

#### `CivilizationLayout.tsx`
Tab wrapper. Horizontal tab bar at top with 6 tabs. Active tab has accent styling. Uses `useSearchParams` and `useRouter` to manage tab state via URL. Renders the active panel below.

#### `ControlRoom.tsx`
Overview dashboard. Contains:
- **Metric cards row** (4-6 cards): Total messages, Active meetings, Open tribunal cases, Average composite score, Agents at risk, Academia sessions. Derive all numbers from the mock data.
- **Communication graph** (`CommGraph.tsx`): Canvas or SVG visualization showing agents as nodes and communication links as edges. D3 is installed — use it for a force-directed graph. Nodes colored by score level (green/blue/amber/red). Edge thickness = message weight. On hover: highlight that agent's connections. On click: could use `sendPrompt` or just show a tooltip. This is the hero visual.
- **Recent messages feed**: Last 8 synapse messages in compact cards. Each shows: sender → receiver, intent badge, time, first line of content.
- **Agent status grid**: All 8 agents in a grid, each mini-card showing: avatar initials, name, composite score (colored), trajectory arrow (↑↓→), mode badge.

#### `CommGraph.tsx`
The communication network visualization. Use D3 force simulation (`d3-force`).
- Nodes: circles with agent initials, ring color = score level, size = message count
- Links: lines with thickness proportional to `weight`
- Force layout: center force + many-body repulsion + link force
- On hover: dim all non-connected nodes/edges, highlight connected ones
- Animate on mount with a fade-in
- Canvas-based for performance (draw with `d3` on a `<canvas>` element), or SVG if simpler

#### `SynapsePanel.tsx`
Full message feed:
- Filter row: buttons for each intent type (all, delegate, request, status_update, question, escalation). Active filter is highlighted.
- Message cards: left border colored by intent. Shows sender chip → receiver chip, intent badge, urgency badge (if high/critical), full content, outcome status dot, timestamp.
- Sort newest first.

#### `NexusPanel.tsx`
Meeting list and detail:
- Meeting cards: type badge, title, facilitator, participant count, status badge, date
- Expanded meeting shows: header info, contributions list (agent avatar, name, content, stance icon), action items section
- **Meeting replay**: A "Play" button that reveals contributions one-by-one with ~1.5s delay using `setTimeout` + state. Shows a progress indicator. "Pause" stops, "Reset" goes back to showing first 3. This is the demo showstopper.

#### `MeetingReplay.tsx`
The replay engine. Props: `contributions: MeetingContribution[]`. State: `visibleCount`, `isPlaying`. Effect that increments visibleCount when playing. Each new contribution fades in with Framer Motion `AnimatePresence`.

#### `TribunalPanel.tsx`
Audit case viewer:
- Top metrics: open cases count, agents monitored, verdicts this week
- Case cards with severity badge (colored), status badge, agent chip, trigger text
- Expandable: click shows chain of responsibility (each agent with % bar), evidence summary, verdict if exists
- Critical cases have a subtle red border/glow

#### `ScorePanel.tsx`
Agent reputation dashboard:
- Agent selector row: buttons per agent with colored dot + name + score number
- Selected agent detail: big composite number (colored), trajectory value with arrow, mode badge
- Score breakdown: 4 horizontal progress bars (execution 35%, communication 20%, collaboration 25%, efficiency 20%)
- Threshold legend (excellent ≥85, good ≥70, warning ≥50, critical ≥30, terminal <30)
- **Trajectory chart** (`ScoreChart.tsx`): line chart of composite over 14 days. Use Recharts (already installed) — `LineChart` with `Line`, `XAxis`, `YAxis`, `Tooltip`. Area fill under the line.

#### `ScoreChart.tsx`
Recharts line chart component. Props: `history: ScoreSnapshot[]`, `agentName: string`. Shows composite score over time. Green if trending up, red if trending down. Responsive container.

#### `AcademiaPanel.tsx`
Learning faculty view:
- Active session card: agent info, status badge, start date
- Curriculum list: each skill with status indicator (checkmark/spinner/number), progress bar, score if passed
- Mentor patterns: extracted from top performers with source agent chip
- Graduation criteria section
- If no sessions: empty state explaining what Academia does

#### `AgentChip.tsx`
Reusable component. Props: `agentId: string`, optional `size: 'sm' | 'md'`. Looks up agent from AGENTS array. Shows: circular avatar with initials (border colored by score), agent name. Used everywhere.

#### `IntentBadge.tsx`
Small colored badge for message intent. Each intent has a color: delegate=purple, request=blue, status_update=green, question=amber, escalation=red.

#### `ScoreBadge.tsx`
Colored badge showing a composite score number. Color based on `getScoreLevel()`.

### Design

**Dark theme** — this page should use a dark control-room aesthetic. Deep backgrounds, bright data colors. Look at how the existing dark pages work in the app (check `/org` or any dark-themed page) and follow the same pattern.

**Color mapping** (use Tailwind classes or CSS variables from the existing design system where possible):
- Score excellent = emerald/green
- Score good = blue
- Score warning = amber
- Score critical = red
- Score terminal = rose
- Intent colors: delegate=violet, request=blue, status_update=emerald, question=amber, escalation=red
- Mode colors: autonomous=emerald, assisted=violet, shadow=amber

Use Framer Motion for: tab transitions, meeting replay fade-ins, card expansions in Tribunal, list stagger animations.

## PHASE 4: SQL Migration File (for future DB integration)

Create `src/lib/migrations/003_civilization_layer.sql` with the complete SQL from the original spec (all 10 tables: synapse_channels, synapse_messages, nexus_meetings, meeting_rounds, round_contributions, agent_scores, score_snapshots, tribunal_cases, case_evidence, academia_sessions). Include indexes, RLS policies, and foreign keys to `organizations(id)` and `ai_agents(id)` even though those tables don't exist yet in this repo — this is a reference file for when we wire up Supabase.

Add a comment at the top: `-- ORGANA Civilization Layer Schema. To be applied when Supabase is connected. References organizations and ai_agents tables from the production schema.`

## EXECUTION ORDER

1. Types (Phase 1)
2. Mock data (Phase 2) 
3. Components + Page (Phase 3) — build AgentChip, IntentBadge, ScoreBadge first (dependencies), then panels, then the page
4. SQL file (Phase 4)
5. Add nav link
6. `npm run build` or `pnpm build` — verify it compiles
7. Fix any errors

## CRITICAL RULES
- Scan existing code FIRST. Match the patterns you find (imports, component structure, Tailwind usage, file naming).
- Use the design tokens and Tailwind classes already defined in the project — don't invent new ones unless necessary.
- Keep components under 300 lines. Split if larger.
- All mock data content (messages, verdicts, meeting transcripts, curriculum) in SPANISH.
- The dark theme on /civilization should be scoped to that page — don't break other pages.
- D3 and Recharts are already installed — use them, don't install alternatives.
- Framer Motion is already installed — use it for animations.
- No external API calls, no database calls. Everything from mock-data-civilization.ts.
- TypeScript strict — no `any`, proper types everywhere.

Commit: `feat(civilization): add agent civilization layer with 5 pillar demo`
