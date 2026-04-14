'use client'

import { useMemo } from 'react'
import ReactFlow, {
  Background,
  BackgroundVariant,
  Controls,
  Handle,
  Position,
  ReactFlowProvider,
  type Edge,
  type Node,
  type NodeTypes,
} from 'reactflow'
import type { Agent } from '@/lib/types'

// ─── Layout constants ────────────────────────────────────────────────────────
const NODE_W = 210
const NODE_H = 86
const H_GAP = 52
const V_GAP = 68

// ─── Tree layout algorithm ───────────────────────────────────────────────────
function buildLayout(agents: Agent[]): Map<string, { x: number; y: number }> {
  const root = agents.find(a => a.reportsTo === null) ?? agents[0]
  if (!root) return new Map()

  const childMap = new Map<string, string[]>()
  for (const a of agents) {
    if (a.reportsTo) {
      if (!childMap.has(a.reportsTo)) childMap.set(a.reportsTo, [])
      childMap.get(a.reportsTo)!.push(a.id)
    }
  }

  function subtreeW(id: string): number {
    const kids = childMap.get(id) ?? []
    if (!kids.length) return NODE_W
    const sum = kids.reduce((s, k) => s + subtreeW(k), 0)
    return Math.max(NODE_W, sum + H_GAP * (kids.length - 1))
  }

  const pos = new Map<string, { x: number; y: number }>()

  function place(id: string, cx: number, y: number) {
    pos.set(id, { x: cx - NODE_W / 2, y })
    const kids = childMap.get(id) ?? []
    if (!kids.length) return
    const tw = kids.reduce((s, k) => s + subtreeW(k), 0) + H_GAP * (kids.length - 1)
    let cur = cx - tw / 2
    for (const kid of kids) {
      const w = subtreeW(kid)
      place(kid, cur + w / 2, y + NODE_H + V_GAP)
      cur += w + H_GAP
    }
  }

  place(root.id, 0, 0)
  return pos
}

// ─── Department color palette ─────────────────────────────────────────────────
const PALETTE = [
  { bg: '#EFF6FF', fg: '#1D4ED8' },
  { bg: '#F5F3FF', fg: '#6D28D9' },
  { bg: '#ECFDF5', fg: '#065F46' },
  { bg: '#FFF7ED', fg: '#C2410C' },
  { bg: '#FDF2F8', fg: '#9D174D' },
  { bg: '#EEF2FF', fg: '#3730A3' },
] as const

function deptColor(dept: string) {
  const h = dept.split('').reduce((a, c) => a + c.charCodeAt(0), 0)
  return PALETTE[h % PALETTE.length]!
}

function initials(name: string) {
  return name
    .split(' ')
    .slice(0, 2)
    .map(w => w[0] ?? '')
    .join('')
    .toUpperCase()
}

// ─── Custom node ──────────────────────────────────────────────────────────────
interface NodeData {
  agent: Agent
  isRoot: boolean
}

function AgentNode({ data }: { data: NodeData }) {
  const { agent, isRoot } = data
  const c = deptColor(agent.department)
  const handleStyle = { opacity: 0, pointerEvents: 'none' as const, width: 1, height: 1 }

  return (
    <div
      style={{
        width: NODE_W,
        background: '#fff',
        borderRadius: 16,
        border: isRoot ? '2px solid #0071E3' : '1.5px solid rgba(0,0,0,0.08)',
        boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
        padding: '10px 12px',
      }}
    >
      <Handle type="target" position={Position.Top} style={handleStyle} />

      {/* Avatar + name row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
        <div
          style={{
            width: 34, height: 34, borderRadius: 10,
            background: c.bg, color: c.fg,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 11, fontWeight: 700, flexShrink: 0, letterSpacing: '0.02em',
          }}
        >
          {initials(agent.name)}
        </div>
        <div style={{ minWidth: 0, flex: 1 }}>
          <p style={{
            margin: 0, fontSize: 12, fontWeight: 600, color: '#1d1d1f',
            lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {agent.name || '(Unknown)'}
          </p>
          <p style={{
            margin: 0, fontSize: 11, color: '#6e6e73',
            lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {agent.role}
          </p>
        </div>
      </div>

      {/* Department badge */}
      <div style={{
        fontSize: 10, background: c.bg, color: c.fg,
        padding: '2px 8px', borderRadius: 6, fontWeight: 500,
        display: 'inline-block', maxWidth: '100%',
        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
      }}>
        {agent.department}
      </div>

      <Handle type="source" position={Position.Bottom} style={handleStyle} />
    </div>
  )
}

const nodeTypes: NodeTypes = { agentOrg: AgentNode }

// ─── Inner flow ───────────────────────────────────────────────────────────────
function OrgFlow({ agents }: { agents: Agent[] }) {
  const rootId = agents.find(a => a.reportsTo === null)?.id

  const { nodes, edges } = useMemo(() => {
    const positions = buildLayout(agents)

    const nodes: Node<NodeData>[] = agents.map(agent => ({
      id: agent.id,
      type: 'agentOrg',
      position: positions.get(agent.id) ?? { x: 0, y: 0 },
      data: { agent, isRoot: agent.id === rootId },
      draggable: false,
    }))

    const edges: Edge[] = agents
      .filter(a => a.reportsTo !== null)
      .map(a => ({
        id: `${a.reportsTo!}-${a.id}`,
        source: a.reportsTo!,
        target: a.id,
        type: 'smoothstep',
        style: { stroke: 'rgba(0,0,0,0.15)', strokeWidth: 1.5 },
      }))

    return { nodes, edges }
  }, [agents, rootId])

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      nodeTypes={nodeTypes}
      fitView
      fitViewOptions={{ padding: 0.18, duration: 400 }}
      nodesConnectable={false}
      nodesDraggable={false}
      elementsSelectable={false}
      zoomOnDoubleClick={false}
      proOptions={{ hideAttribution: true }}
    >
      <Background variant={BackgroundVariant.Dots} gap={22} size={1} color="rgba(0,0,0,0.05)" />
      <Controls showInteractive={false} style={{ bottom: 16, right: 16, left: 'auto', top: 'auto' }} />
    </ReactFlow>
  )
}

// ─── Public export (wrapped in provider) ─────────────────────────────────────
export default function OrgChartCanvas({ agents }: { agents: Agent[] }) {
  return (
    <ReactFlowProvider>
      <OrgFlow agents={agents} />
    </ReactFlowProvider>
  )
}
