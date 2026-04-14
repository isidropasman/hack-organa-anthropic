// src/lib/inbox-data.ts
// Mock inbox data for agent-to-agent communication.

export interface AgentRequest {
  id: string
  type: 'inbound' | 'outbound'
  from: { name: string; role: string; agentId: string }
  to: { name: string; role: string; agentId: string }
  subject: string
  status: 'pending' | 'completed' | 'in-progress'
  createdAt: string
  completedAt?: string
  priority: 'high' | 'medium' | 'low'
}

// Using real agent IDs from demo-data.ts
const AGENTS = {
  valentina: { name: 'Valentina Torres', role: 'CEO', agentId: 'valentina-torres' },
  martin:    { name: 'Martín Ruiz', role: 'Head of Accounts', agentId: 'martin-ruiz' },
  sofia:     { name: 'Sofía Chen', role: 'Head of Creative', agentId: 'sofia-chen' },
  carlos:    { name: 'Carlos Méndez', role: 'Operations Manager', agentId: 'carlos-operations' },
  lucas:     { name: 'Lucas Fernández', role: 'CFO', agentId: 'lucas-fernandez' },
  camila:    { name: 'Camila Ríos', role: 'Senior Account Manager', agentId: 'camila-rios' },
  jose:      { name: 'José Vera', role: 'Senior Designer', agentId: 'jose-vera' },
}

export const INBOX_DATA: AgentRequest[] = [
  // ── CEO (valentina-torres) ───────────────────────────────────────────────────
  {
    id: 'req-001',
    type: 'inbound',
    from: AGENTS.carlos,
    to: AGENTS.valentina,
    subject: 'Approve restock order — Product #SKU-2847 below minimum (3 units)',
    status: 'pending',
    createdAt: '2026-04-14T09:15:00',
    priority: 'high',
  },
  {
    id: 'req-002',
    type: 'inbound',
    from: AGENTS.martin,
    to: AGENTS.valentina,
    subject: 'Approve budget increase for FashionCo campaign — $2,500',
    status: 'pending',
    createdAt: '2026-04-14T10:30:00',
    priority: 'medium',
  },
  {
    id: 'req-003',
    type: 'inbound',
    from: AGENTS.lucas,
    to: AGENTS.valentina,
    subject: 'Monthly P&L ready for review — margins down 2%',
    status: 'completed',
    createdAt: '2026-04-12T08:00:00',
    completedAt: '2026-04-12T15:30:00',
    priority: 'high',
  },
  {
    id: 'req-004',
    type: 'outbound',
    from: AGENTS.valentina,
    to: AGENTS.lucas,
    subject: 'Need weekly cash flow report before Wednesday 1:1',
    status: 'completed',
    createdAt: '2026-04-11T14:00:00',
    completedAt: '2026-04-12T08:00:00',
    priority: 'medium',
  },

  // ── Operations (carlos-operations) ──────────────────────────────────────────
  {
    id: 'req-005',
    type: 'outbound',
    from: AGENTS.carlos,
    to: AGENTS.valentina,
    subject: 'Approve restock order — Product #SKU-2847 below minimum (3 units)',
    status: 'pending',
    createdAt: '2026-04-14T09:15:00',
    priority: 'high',
  },
  {
    id: 'req-006',
    type: 'inbound',
    from: AGENTS.camila,
    to: AGENTS.carlos,
    subject: 'Urgent delivery needed — Client event in 3 days',
    status: 'in-progress',
    createdAt: '2026-04-14T08:00:00',
    priority: 'high',
  },
  {
    id: 'req-007',
    type: 'inbound',
    from: AGENTS.lucas,
    to: AGENTS.carlos,
    subject: 'Confirm shipping costs for March reconciliation',
    status: 'completed',
    createdAt: '2026-04-10T11:00:00',
    completedAt: '2026-04-11T09:30:00',
    priority: 'low',
  },

  // ── Head of Accounts (martin-ruiz) ──────────────────────────────────────────
  {
    id: 'req-008',
    type: 'outbound',
    from: AGENTS.martin,
    to: AGENTS.valentina,
    subject: 'Approve budget increase for FashionCo campaign — $2,500',
    status: 'pending',
    createdAt: '2026-04-14T10:30:00',
    priority: 'medium',
  },
  {
    id: 'req-009',
    type: 'inbound',
    from: AGENTS.camila,
    to: AGENTS.martin,
    subject: 'Client requesting scope expansion — needs decision',
    status: 'pending',
    createdAt: '2026-04-14T11:00:00',
    priority: 'medium',
  },
  {
    id: 'req-010',
    type: 'outbound',
    from: AGENTS.martin,
    to: AGENTS.sofia,
    subject: 'Priority creative brief for rebranding — due Friday',
    status: 'in-progress',
    createdAt: '2026-04-13T16:00:00',
    priority: 'high',
  },

  // ── Head of Creative (sofia-chen) ───────────────────────────────────────────
  {
    id: 'req-011',
    type: 'inbound',
    from: AGENTS.martin,
    to: AGENTS.sofia,
    subject: 'Priority creative brief for rebranding — due Friday',
    status: 'in-progress',
    createdAt: '2026-04-13T16:00:00',
    priority: 'high',
  },
  {
    id: 'req-012',
    type: 'outbound',
    from: AGENTS.sofia,
    to: AGENTS.jose,
    subject: 'Assign rebranding — need 3 concepts by Thursday',
    status: 'pending',
    createdAt: '2026-04-14T09:00:00',
    priority: 'high',
  },

  // ── CFO (lucas-fernandez) ────────────────────────────────────────────────────
  {
    id: 'req-013',
    type: 'inbound',
    from: AGENTS.valentina,
    to: AGENTS.lucas,
    subject: 'Need weekly cash flow report before Wednesday 1:1',
    status: 'completed',
    createdAt: '2026-04-11T14:00:00',
    completedAt: '2026-04-12T08:00:00',
    priority: 'medium',
  },
  {
    id: 'req-014',
    type: 'outbound',
    from: AGENTS.lucas,
    to: AGENTS.carlos,
    subject: 'Confirm shipping costs for March reconciliation',
    status: 'completed',
    createdAt: '2026-04-10T11:00:00',
    completedAt: '2026-04-11T09:30:00',
    priority: 'low',
  },

  // ── Senior Designer (jose-vera) ──────────────────────────────────────────────
  {
    id: 'req-015',
    type: 'inbound',
    from: AGENTS.sofia,
    to: AGENTS.jose,
    subject: 'Assign rebranding — need 3 concepts by Thursday',
    status: 'pending',
    createdAt: '2026-04-14T09:00:00',
    priority: 'high',
  },
]

export function getInboxForAgent(agentId: string): {
  inbound: AgentRequest[]
  outbound: AgentRequest[]
} {
  return {
    inbound:  INBOX_DATA.filter(r => r.to.agentId === agentId),
    outbound: INBOX_DATA.filter(r => r.from.agentId === agentId),
  }
}
