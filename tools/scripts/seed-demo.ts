// tools/scripts/seed-demo.ts
// Pre-seeds localStorage with Nova Agency demo data
// Run: npx ts-node tools/scripts/seed-demo.ts
//
// Nova Agency: Buenos Aires marketing agency, 13 agents
// 3 fully trained (CEO, Head of Accounts, Head of Creative)
// 10 untrained — shows both states in the demo

import type { DemoCompany, Agent, KnowledgeBase, Message } from '../../src/lib/types'

const NOW = new Date().toISOString()

function msg(role: 'user' | 'assistant', content: string): Message {
  return { role, content, timestamp: NOW }
}

// ─── Trained agents ──────────────────────────────────────────────────────────

const valentinaKB: KnowledgeBase = {
  agentId: 'valentina-torres',
  completedAt: NOW,
  summary:
    'Valentina Torres is the CEO of Nova Agency, responsible for overall strategy, key client relationships, and team leadership. She runs the business from vision to execution and is the final decision-maker on all major accounts and hires.',
  categories: {
    tasks: [
      'Weekly leadership sync with all department heads every Monday at 9am',
      'Final approval on all proposals over $50k USD',
      'Monthly board report with KPIs: revenue, retention, pitch win rate',
      'Active client sponsor for top 3 accounts: Natura, MercadoLibre, YPF',
      'Recruiting final interviews for senior hires',
    ],
    tools: [
      'Slack — primary comms, monitors #leadership, #deals, #incidents channels',
      'Notion — strategic roadmap, board decks, and OKRs',
      'HubSpot — pipeline review every Friday, tracks deal stages and deal value',
      'Google Meet — all external client calls, always recorded',
      'Loom — async updates to team when traveling',
    ],
    team: [
      'Martín Ruiz (Head of Accounts) — daily syncs, first escalation point for client issues',
      'Sofía Chen (Head of Creative) — weekly creative review, approves final campaign decks',
      'Lucas Fernández (CFO) — biweekly finance review, budget approvals',
      'Reports to Board — quarterly in-person reviews in São Paulo',
    ],
    comms: [
      'Direct, data-first communication style — always leads with numbers',
      'For difficult client situations: always takes the call personally, never delegates a crisis',
      'Prefers async (Loom/Notion) for updates; sync (Meet) for decisions',
      'No WhatsApp for work — strict Slack only policy',
    ],
    decisions: [
      'Any hire above $60k/year salary requires her sign-off',
      'Pitches to new clients over $100k ARS monthly budget',
      'Agency partnerships and vendor contracts',
      'Public statements or press mentions about Nova Agency',
      'Does NOT decide: individual campaign creative direction (Sofía), day-to-day client ops (Martín)',
    ],
    knowledge: [
      'Nova Agency wins pitches on speed — if a proposal takes more than 72 hours, we lose',
      'Natura is our anchor client — 40% of revenue. Never miss a Natura deadline.',
      'The Buenos Aires ad market moves in Q1 and Q3 — pipeline dries up in February and August',
      'We have a preferred vendor list for production — always use them before going external',
      'Culture: no meeting before 9am or after 7pm. Remote Fridays are sacred.',
    ],
  },
  rawTranscript: [
    msg('assistant', 'Hi Valentina! I\'m ARIA, your AI interviewer. I\'m here to capture your operational knowledge so your AI twin can help the team even when you\'re not available. Let\'s start simple: what does a typical week look like for you?'),
    msg('user', 'Monday starts with our leadership sync — all department heads for 90 minutes. Rest of the week is split between client calls, pipeline review on Friday with Martín, and catching up on Notion docs. I travel at least one week a month for key accounts.'),
    msg('assistant', 'That Monday leadership sync sounds pivotal. What are the 3 things that only you can do at Nova Agency — things that would genuinely break if you were out for two weeks?'),
    msg('user', 'Final approval on big proposals, being the client sponsor for Natura and MercadoLibre, and recruiting senior people. Everything else has a backup.'),
  ],
}

const martinKB: KnowledgeBase = {
  agentId: 'martin-ruiz',
  completedAt: NOW,
  summary:
    'Martín Ruiz is Head of Accounts at Nova Agency, managing all client relationships and the account management team of 6. He is the operational hub between clients and creative — everything flows through him before reaching Valentina.',
  categories: {
    tasks: [
      'Daily standup with the 6 account managers at 9:30am',
      'Weekly client health check — reviews NPS and last-touch date for each account',
      'Escalation point for all client complaints before they reach Valentina',
      'Manages revenue forecasting in HubSpot — updates pipeline every Friday',
      'Monthly client business reviews (CBRs) with top 5 accounts',
    ],
    tools: [
      'HubSpot — gospel for all account data, pipeline stages, and client notes',
      'Notion — client runbooks, onboarding templates, CBR decks',
      'WhatsApp — clients prefer it for quick questions; Martín keeps a strict no-WhatsApp-after-9pm rule',
      'Google Sheets — manual revenue tracking (cross-referenced with HubSpot)',
      'Zoom — weekly client calls; internal is always Google Meet',
    ],
    team: [
      '6 direct reports: 2 senior AMs, 3 AMs, 1 AM coordinator',
      'Works most closely with Sofía Chen on delivery timelines',
      'Daily Slack thread with Valentina on deal status',
      'Finance (Lucas) for invoice approvals and payment follow-ups',
    ],
    comms: [
      'When a client is unhappy: first call within 2 hours, no email. Always phone.',
      'Sends written recap after every client call within 24h — in Notion and cc\'d in HubSpot',
      'Escalates to Valentina only when: client threatens to leave, contract dispute, or ask outside scope by >30%',
      'Never promises deliverables on a call without checking with creative first',
    ],
    decisions: [
      'Up to 15% scope creep on existing contracts without approval',
      'Which AM is assigned to which client',
      'Client meeting agendas and CBR format',
      'Does NOT decide: final creative output, new client pricing (Valentina), headcount (Valentina)',
    ],
    knowledge: [
      'YPF is our most demanding client — always buffer 20% extra time on their campaigns',
      'The best time to upsell is right after a campaign launch if results are strong — strike in first 48h',
      'Never let a client go 3 weeks without a touch — that\'s when they start shopping around',
      'HubSpot deal stages: Lead → Qualified → Proposal Sent → Negotiation → Won/Lost',
      'Our payment terms are net-30 but most clients pay net-45 — don\'t escalate until day 50',
    ],
  },
  rawTranscript: [
    msg('assistant', 'Hi Martín! I\'m ARIA. Let\'s capture how you run the accounts team. Walk me through a typical week.'),
    msg('user', 'Standup with the team every morning, then I\'m on client calls most of the day. Fridays I do pipeline review with Valentina. Every third week I\'m doing CBRs.'),
  ],
}

const sofiaKB: KnowledgeBase = {
  agentId: 'sofia-chen',
  completedAt: NOW,
  summary:
    'Sofía Chen is Head of Creative at Nova Agency, leading a team of 8 across design, copy, and video. She sets the creative direction for all accounts and is the final sign-off on anything that goes to a client.',
  categories: {
    tasks: [
      'Monday creative kickoff — reviews all active briefs and assigns to team',
      'Wednesday mid-sprint review — checks work in progress, gives direction',
      'Friday creative showcase — presents week\'s output to department heads',
      'Final review of all client-facing decks before Martín sends them',
      'Monthly creative retrospective — what worked, what didn\'t, tools we\'re testing',
    ],
    tools: [
      'Figma — all design work, shared with clients for feedback via Figma comments',
      'Notion — creative briefs, brand guidelines, project status',
      'Frame.io — video review and client approvals for video productions',
      'Adobe Creative Suite — production work (Premiere, After Effects, Photoshop)',
      'Slack #creative channel — daily async with team',
    ],
    team: [
      '8 direct reports: 2 senior designers, 2 designers, 2 copywriters, 1 video editor, 1 creative coordinator',
      'Closest collaborator: Martín (accounts) — daily handoffs on briefs and timelines',
      'Works with external production houses for large video shoots',
    ],
    comms: [
      'Creative feedback is always in writing — no verbal-only feedback, it never sticks',
      'Uses a traffic light system: green (ship it), yellow (one more round), red (restart)',
      'Never says no to a brief — says "here\'s what we can do with this budget and timeline"',
      'Client feedback rounds: max 2 rounds included in contract. Round 3 is a change order.',
    ],
    decisions: [
      'Which team member works on which account',
      'Which external vendors to use for production',
      'Creative direction on all campaigns',
      'Does NOT decide: client budgets, account assignments (Martín), hiring without Valentina',
    ],
    knowledge: [
      'Natura briefs always come in Friday afternoon — protect the team by negotiating Monday start',
      'MercadoLibre has a strict brand guide — download the latest version every time, they update it quarterly',
      'Our strongest output is social-first campaigns — push clients toward this format if budget allows',
      'When a brief is vague, run a 30-min kickoff call before briefing the team — saves 2 rounds of revisions',
      'The creative coordinator owns the Figma master file — never let an AM edit it directly',
    ],
  },
  rawTranscript: [
    msg('assistant', 'Hi Sofía! I\'m ARIA. Let\'s capture the creative process. Walk me through your week.'),
    msg('user', 'Monday is kickoff, Wednesday is review, Friday is showcase. The rest is deep work and client reviews.'),
  ],
}

// ─── Untrained agents (shell only) ───────────────────────────────────────────

function shell(id: string, name: string, role: string, department: string, reportsTo: string | null): Agent {
  return {
    id,
    name,
    role,
    department,
    reportsTo,
    readinessScore: 0,
    onboardingComplete: false,
    knowledgeBase: null,
    onboardingMessages: [],
  }
}

// ─── Full Nova Agency dataset ─────────────────────────────────────────────────

export const NOVA_AGENCY_DEMO: DemoCompany = {
  name: 'Nova Agency',
  description: 'Full-service marketing and creative agency based in Buenos Aires.',
  agents: [
    // Trained
    {
      id: 'valentina-torres',
      name: 'Valentina Torres',
      role: 'CEO',
      department: 'Dirección General',
      reportsTo: null,
      readinessScore: 100,
      onboardingComplete: true,
      knowledgeBase: valentinaKB,
      onboardingMessages: valentinaKB.rawTranscript,
    },
    {
      id: 'martin-ruiz',
      name: 'Martín Ruiz',
      role: 'Head of Accounts',
      department: 'Cuentas',
      reportsTo: 'valentina-torres',
      readinessScore: 100,
      onboardingComplete: true,
      knowledgeBase: martinKB,
      onboardingMessages: martinKB.rawTranscript,
    },
    {
      id: 'sofia-chen',
      name: 'Sofía Chen',
      role: 'Head of Creative',
      department: 'Creatividad',
      reportsTo: 'valentina-torres',
      readinessScore: 100,
      onboardingComplete: true,
      knowledgeBase: sofiaKB,
      onboardingMessages: sofiaKB.rawTranscript,
    },
    // Untrained
    shell('lucas-fernandez', 'Lucas Fernández', 'CFO', 'Finanzas', 'valentina-torres'),
    shell('camila-rios', 'Camila Ríos', 'Senior Account Manager', 'Cuentas', 'martin-ruiz'),
    shell('diego-morales', 'Diego Morales', 'Senior Account Manager', 'Cuentas', 'martin-ruiz'),
    shell('ana-gutierrez', 'Ana Gutiérrez', 'Account Manager', 'Cuentas', 'martin-ruiz'),
    shell('pablo-solis', 'Pablo Solís', 'Account Manager', 'Cuentas', 'martin-ruiz'),
    shell('lucia-mendez', 'Lucía Méndez', 'Account Manager', 'Cuentas', 'martin-ruiz'),
    shell('jose-vera', 'José Vera', 'Senior Designer', 'Creatividad', 'sofia-chen'),
    shell('natalia-lopez', 'Natalia López', 'Senior Designer', 'Creatividad', 'sofia-chen'),
    shell('tomás-white', 'Tomás White', 'Copywriter', 'Creatividad', 'sofia-chen'),
    shell('emilia-suarez', 'Emilia Suárez', 'Video Editor', 'Creatividad', 'sofia-chen'),
  ],
}

// ─── CLI runner ───────────────────────────────────────────────────────────────

// This script is meant to be run in a Node.js context that has access to localStorage.
// For browser seeding, import NOVA_AGENCY_DEMO and call agentStore.seedDemoCompany(NOVA_AGENCY_DEMO).
// For CLI use, this just validates the data shape.

if (require.main === module) {
  console.log('Nova Agency Demo Data:')
  console.log(`  Company: ${NOVA_AGENCY_DEMO.name}`)
  console.log(`  Total agents: ${NOVA_AGENCY_DEMO.agents.length}`)
  console.log(`  Trained: ${NOVA_AGENCY_DEMO.agents.filter(a => a.onboardingComplete).length}`)
  console.log(`  Untrained: ${NOVA_AGENCY_DEMO.agents.filter(a => !a.onboardingComplete).length}`)
  console.log('')
  console.log('To seed in browser: import { NOVA_AGENCY_DEMO } from "tools/scripts/seed-demo" and call agentStore.seedDemoCompany(NOVA_AGENCY_DEMO)')
}
