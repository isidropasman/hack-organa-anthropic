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

// ─── Shared helpers ───────────────────────────────────────────────────────────
const PALETTE = [
  { bg: '#EFF6FF', fg: '#1D4ED8', bar: '#1D4ED8' },
  { bg: '#F5F3FF', fg: '#6D28D9', bar: '#6D28D9' },
  { bg: '#ECFDF5', fg: '#065F46', bar: '#059669' },
  { bg: '#FFF7ED', fg: '#C2410C', bar: '#EA580C' },
  { bg: '#FDF2F8', fg: '#9D174D', bar: '#DB2777' },
  { bg: '#EEF2FF', fg: '#3730A3', bar: '#4F46E5' },
] as const

function deptColor(dept: string) {
  const h = dept.split('').reduce((a, c) => a + c.charCodeAt(0), 0)
  return PALETTE[h % PALETTE.length]!
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
}

// ─── Person node (left / human side) ─────────────────────────────────────────
function PersonNode({ data }: NodeProps<NodeData>) {
  const { agent, isRoot, isSelected, editable } = data
  const c = deptColor(agent.department)

  return (
    <div style={{
      width: NODE_W,
      background: '#fff',
      borderRadius: 12,
      border: `1.5px solid ${isSelected ? '#0071E3' : isRoot ? '#c7d9f5' : 'rgba(0,0,0,0.09)'}`,
      boxShadow: isSelected
        ? '0 0 0 3px rgba(0,113,227,0.15), 0 2px 8px rgba(0,0,0,0.07)'
        : '0 1px 6px rgba(0,0,0,0.05)',
      display: 'flex',
      overflow: 'hidden',
      cursor: editable ? 'pointer' : 'default',
      transition: 'border-color 0.15s, box-shadow 0.15s',
    }}>
      <Handle type="target" position={Position.Top} style={handleStyle} />

      {/* Left accent bar */}
      <div style={{ width: 4, flexShrink: 0, background: c.bar, opacity: 0.7 }} />

      {/* Content */}
      <div style={{ flex: 1, padding: '9px 11px', minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
            background: c.bg, color: c.fg,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 10, fontWeight: 700,
          }}>
            {initials(agent.name)}
          </div>
          <div style={{ minWidth: 0 }}>
            <p style={{
              margin: 0, fontSize: 12, fontWeight: 600, color: '#1d1d1f',
              lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
              {agent.name}
            </p>
            <p style={{
              margin: 0, fontSize: 10.5, color: '#6e6e73',
              lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
              {agent.role}
            </p>
          </div>
        </div>
        <p style={{
          margin: '6px 0 0', fontSize: 9.5, color: c.fg,
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          opacity: 0.8,
        }}>
          {agent.department}
        </p>
      </div>

      <Handle type="source" position={Position.Bottom} style={handleStyle} />
    </div>
  )
}

// ─── Agent node (right / AI side) ────────────────────────────────────────────
function AgentNode({ data }: NodeProps<NodeData>) {
  const { agent, isRoot, isSelected, editable } = data
  const c = deptColor(agent.department)
  const trained = agent.onboardingComplete
  const score = agent.readinessScore

  return (
    <div style={{
      width: NODE_W,
      background: isSelected ? '#F0F7FF' : '#fff',
      borderRadius: 16,
      border: `${isSelected || isRoot ? 2 : 1.5}px solid ${isSelected ? '#0071E3' : isRoot ? '#0071E3' : 'rgba(0,0,0,0.08)'}`,
      boxShadow: isSelected
        ? '0 0 0 3px rgba(0,113,227,0.18), 0 4px 16px rgba(0,0,0,0.10)'
        : '0 2px 12px rgba(0,0,0,0.07)',
      padding: '10px 12px 8px',
      cursor: editable ? 'pointer' : 'default',
      transition: 'box-shadow 0.15s, border-color 0.15s, background 0.15s',
      position: 'relative',
    }}>
      <Handle type="target" position={Position.Top} style={handleStyle} />

      {/* Trained dot */}
      {trained && (
        <div style={{
          position: 'absolute', top: 8, right: 8,
          width: 8, height: 8, borderRadius: '50%', background: '#34C759',
        }} />
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 7 }}>
        <div style={{
          width: 34, height: 34, borderRadius: 10, flexShrink: 0,
          background: c.bg, color: c.fg,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 11, fontWeight: 700, letterSpacing: '0.02em',
        }}>
          {initials(agent.name)}
        </div>
        <div style={{ minWidth: 0, flex: 1 }}>
          <p style={{
            margin: 0, fontSize: 12, fontWeight: 600, color: '#1d1d1f',
            lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {agent.name}
          </p>
          <p style={{
            margin: 0, fontSize: 11, color: '#6e6e73',
            lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {agent.role}
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
        <div style={{
          fontSize: 10, background: c.bg, color: c.fg,
          padding: '2px 8px', borderRadius: 6, fontWeight: 500,
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1,
        }}>
          {agent.department}
        </div>
        {trained && (
          <span style={{ fontSize: 10, color: '#34C759', fontWeight: 600, flexShrink: 0 }}>
            {score}%
          </span>
        )}
      </div>

      {/* Readiness bar */}
      {score > 0 && (
        <div style={{
          marginTop: 6, height: 3, borderRadius: 2,
          background: 'rgba(0,0,0,0.07)', overflow: 'hidden',
        }}>
          <div style={{
            height: '100%', width: `${score}%`,
            background: trained ? '#34C759' : '#0071E3',
            borderRadius: 2, transition: 'width 0.6s ease',
          }} />
        </div>
      )}

      <Handle type="source" position={Position.Bottom} style={handleStyle} />
    </div>
  )
}

// ─── Node type registries (must be module-level for ReactFlow stability) ──────
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

  const { nodes, edges } = useMemo(() => {
    const positions = buildLayout(agents)

    const nodes: Node<NodeData>[] = agents.map(agent => ({
      id: agent.id,
      type: 'agentOrg',
      position: positions.get(agent.id) ?? { x: 0, y: 0 },
      data: {
        agent,
        isRoot: agent.id === rootId,
        isSelected: agent.id === selectedAgentId,
        editable,
      },
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
        style: { stroke: 'rgba(0,0,0,0.13)', strokeWidth: 1.5 },
      }))

    return { nodes, edges }
  }, [agents, rootId, selectedAgentId, editable])

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
    >
      <Background variant={BackgroundVariant.Dots} gap={22} size={1} color="rgba(0,0,0,0.05)" />
      <Controls showInteractive={false} style={{ bottom: 16, right: 16, left: 'auto', top: 'auto' }} />
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
