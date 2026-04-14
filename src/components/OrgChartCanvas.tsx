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
  type NodeProps,
  type NodeTypes,
  type NodeMouseHandler,
} from 'reactflow'
import type { Agent } from '@/lib/types'

// ─── Layout constants ────────────────────────────────────────────────────────
const NODE_W = 200
const NODE_H = 90
const H_GAP = 48
const V_GAP = 64

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
    return Math.max(NODE_W, kids.reduce((s, k) => s + subtreeW(k), 0) + H_GAP * (kids.length - 1))
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

// ─── Helpers ──────────────────────────────────────────────────────────────────
const DEPT_COLORS = [
  '#3B82F6', // blue
  '#8B5CF6', // violet
  '#10B981', // emerald
  '#F59E0B', // amber
  '#EC4899', // pink
  '#6366F1', // indigo
]

function deptAccent(dept: string): string {
  const h = dept.split('').reduce((a, c) => a + c.charCodeAt(0), 0)
  return DEPT_COLORS[h % DEPT_COLORS.length]!
}

function initials(name: string) {
  return name.split(' ').slice(0, 2).map(w => w[0] ?? '').join('').toUpperCase()
}

const handleStyle = { opacity: 0, pointerEvents: 'none' as const, width: 1, height: 1 }

// ─── Node data ────────────────────────────────────────────────────────────────
interface NodeData {
  agent: Agent
  isRoot: boolean
  isSelected: boolean
  editable: boolean
  variant: 'person' | 'agent'
}

// ─── Person node — minimal light card ────────────────────────────────────────
function PersonNode({ data }: NodeProps<NodeData>) {
  const { agent, isSelected, editable } = data
  const accent = deptAccent(agent.department)

  return (
    <div style={{
      width: NODE_W,
      background: '#ffffff',
      borderRadius: 12,
      border: `1.5px solid ${isSelected ? '#0071E3' : 'rgba(0,0,0,0.09)'}`,
      boxShadow: isSelected
        ? '0 0 0 3px rgba(0,113,227,0.15), 0 4px 12px rgba(0,0,0,0.08)'
        : '0 1px 6px rgba(0,0,0,0.06)',
      display: 'flex',
      overflow: 'hidden',
      cursor: editable ? 'pointer' : 'default',
      transition: 'border-color 0.15s, box-shadow 0.15s',
    }}>
      <Handle type="target" position={Position.Top} style={handleStyle} />
      <div style={{ width: 4, flexShrink: 0, background: accent, opacity: 0.75 }} />
      <div style={{ flex: 1, padding: '9px 11px', minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 }}>
          <div style={{
            width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
            background: accent + '18', color: accent,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 10, fontWeight: 700,
          }}>
            {initials(agent.name)}
          </div>
          <div style={{ minWidth: 0 }}>
            <p style={{ margin: 0, fontSize: 11.5, fontWeight: 600, color: '#1d1d1f', lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {agent.name}
            </p>
            <p style={{ margin: 0, fontSize: 10.5, color: '#6e6e73', lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {agent.role}
            </p>
          </div>
        </div>
        <p style={{ margin: 0, fontSize: 9.5, color: accent, opacity: 0.8, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {agent.department}
        </p>
      </div>
      <Handle type="source" position={Position.Bottom} style={handleStyle} />
    </div>
  )
}

// ─── Agent node — dark navy card ──────────────────────────────────────────────
function AgentNode({ data }: NodeProps<NodeData>) {
  const { agent, isRoot, isSelected, editable } = data
  const accent = deptAccent(agent.department)
  const trained = agent.onboardingComplete
  const score = agent.readinessScore

  // Dark bg: root = deep navy, trained = dark slate, untrained = medium slate
  const bg = isSelected
    ? '#1a3a5c'
    : isRoot
    ? '#0f1f35'
    : trained
    ? '#1e2d3d'
    : '#243447'

  const borderColor = isSelected ? '#60A5FA' : isRoot ? '#3B82F6' : 'rgba(255,255,255,0.10)'

  return (
    <div style={{
      width: NODE_W,
      background: bg,
      borderRadius: 14,
      border: `1.5px solid ${borderColor}`,
      boxShadow: isSelected
        ? '0 0 0 3px rgba(96,165,250,0.25), 0 8px 24px rgba(0,0,0,0.35)'
        : isRoot
        ? '0 4px 20px rgba(0,0,0,0.4)'
        : '0 2px 12px rgba(0,0,0,0.25)',
      padding: '10px 12px 9px',
      cursor: editable ? 'pointer' : 'default',
      transition: 'box-shadow 0.15s, border-color 0.15s, background 0.15s',
      position: 'relative',
    }}>
      <Handle type="target" position={Position.Top} style={handleStyle} />

      {/* Trained indicator */}
      {trained && (
        <div style={{
          position: 'absolute', top: 8, right: 8,
          width: 7, height: 7, borderRadius: '50%',
          background: '#34D399',
          boxShadow: '0 0 6px rgba(52,211,153,0.7)',
        }} />
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 7 }}>
        <div style={{
          width: 32, height: 32, borderRadius: 9, flexShrink: 0,
          background: accent + '25', color: accent,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 11, fontWeight: 700, letterSpacing: '0.03em',
          border: `1px solid ${accent}40`,
        }}>
          {initials(agent.name)}
        </div>
        <div style={{ minWidth: 0, flex: 1 }}>
          <p style={{ margin: 0, fontSize: 11.5, fontWeight: 600, color: '#F0F6FF', lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {agent.name}
          </p>
          <p style={{ margin: 0, fontSize: 10.5, color: 'rgba(240,246,255,0.55)', lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {agent.role}
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: score > 0 ? 6 : 0 }}>
        <span style={{
          fontSize: 9.5, color: accent, background: accent + '20',
          padding: '2px 7px', borderRadius: 5, fontWeight: 500,
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1,
        }}>
          {agent.department}
        </span>
        {trained && score > 0 && (
          <span style={{ fontSize: 10, color: '#34D399', fontWeight: 600, flexShrink: 0 }}>
            {score}%
          </span>
        )}
      </div>

      {score > 0 && (
        <div style={{ height: 3, borderRadius: 2, background: 'rgba(255,255,255,0.08)' }}>
          <div style={{
            height: '100%', width: `${score}%`, borderRadius: 2,
            background: trained ? '#34D399' : accent,
            transition: 'width 0.6s ease',
          }} />
        </div>
      )}

      <Handle type="source" position={Position.Bottom} style={handleStyle} />
    </div>
  )
}

// ─── Node type registries ─────────────────────────────────────────────────────
const agentNodeTypes: NodeTypes = { agentOrg: AgentNode }
const personNodeTypes: NodeTypes = { agentOrg: PersonNode }

// ─── Inner flow ───────────────────────────────────────────────────────────────
interface OrgFlowProps {
  agents: Agent[]
  variant: 'person' | 'agent'
  editable?: boolean
  onAgentClick?: (agent: Agent) => void
  selectedAgentId?: string
}

function OrgFlow({ agents, variant, editable = false, onAgentClick, selectedAgentId }: OrgFlowProps) {
  const rootId = agents.find(a => a.reportsTo === null)?.id
  const nodeTypes = variant === 'person' ? personNodeTypes : agentNodeTypes
  const isDark = variant === 'agent'

  const { nodes, edges } = useMemo(() => {
    const positions = buildLayout(agents)

    const nodes: Node<NodeData>[] = agents.map(agent => ({
      id: agent.id,
      type: 'agentOrg',
      position: positions.get(agent.id) ?? { x: 0, y: 0 },
      data: { agent, isRoot: agent.id === rootId, isSelected: agent.id === selectedAgentId, editable, variant },
      draggable: false,
      selectable: editable,
    }))

    const edges: Edge[] = agents
      .filter(a => a.reportsTo !== null)
      .map(a => ({
        id: `${a.reportsTo!}-${a.id}`,
        source: a.reportsTo!,
        target: a.id,
        type: 'smoothstep',
        style: { stroke: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.12)', strokeWidth: 1.5 },
      }))

    return { nodes, edges }
  }, [agents, rootId, selectedAgentId, editable, variant, isDark])

  const handleNodeClick: NodeMouseHandler = (_event, node) => {
    if (editable && onAgentClick) onAgentClick((node.data as NodeData).agent)
  }

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      nodeTypes={nodeTypes}
      fitView
      fitViewOptions={{ padding: 0.18, duration: 400 }}
      nodesConnectable={false}
      nodesDraggable={false}
      elementsSelectable={editable}
      zoomOnDoubleClick={false}
      onNodeClick={handleNodeClick}
      proOptions={{ hideAttribution: true }}
      style={{ background: isDark ? '#0d1b2a' : undefined }}
    >
      <Background
        variant={BackgroundVariant.Dots}
        gap={22} size={1}
        color={isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.05)'}
      />
      <Controls
        showInteractive={false}
        style={{ bottom: 16, right: 16, left: 'auto', top: 'auto' }}
      />
    </ReactFlow>
  )
}

// ─── Public export ────────────────────────────────────────────────────────────
interface OrgChartCanvasProps {
  agents: Agent[]
  variant?: 'person' | 'agent'
  editable?: boolean
  onAgentClick?: (agent: Agent) => void
  selectedAgentId?: string
}

export default function OrgChartCanvas({
  agents,
  variant = 'agent',
  editable,
  onAgentClick,
  selectedAgentId,
}: OrgChartCanvasProps) {
  return (
    <ReactFlowProvider>
      <div style={{ width: '100%', height: '100%' }}>
        <OrgFlow
          agents={agents}
          variant={variant}
          editable={editable}
          onAgentClick={onAgentClick}
          selectedAgentId={selectedAgentId}
        />
      </div>
    </ReactFlowProvider>
  )
}
