'use client'

import { useMemo, useRef, useState, useEffect, useCallback } from 'react'
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

// ─── Helpers ─────────────────────────────────────────────────────────────────
const DEPT_COLORS = ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EC4899', '#6366F1']

function deptAccent(dept: string): string {
  const h = dept.split('').reduce((a, c) => a + c.charCodeAt(0), 0)
  return DEPT_COLORS[h % DEPT_COLORS.length]!
}

function initials(name: string) {
  return name.split(' ').slice(0, 2).map(w => w[0] ?? '').join('').toUpperCase()
}

// ─── Props ────────────────────────────────────────────────────────────────────
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
  editable = false,
  onAgentClick,
  selectedAgentId,
}: OrgChartCanvasProps) {
  const isDark = variant === 'agent'
  const containerRef = useRef<HTMLDivElement>(null)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [dragging, setDragging] = useState(false)
  const dragStart = useRef<{ mx: number; my: number; px: number; py: number } | null>(null)
  const [containerSize, setContainerSize] = useState({ w: 800, h: 600 })

  // Measure container
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const obs = new ResizeObserver(entries => {
      const e = entries[0]
      if (e) setContainerSize({ w: e.contentRect.width, h: e.contentRect.height })
    })
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  const positions = useMemo(() => buildLayout(agents), [agents])

  // Compute bounding box of all nodes
  const bounds = useMemo(() => {
    if (!positions.size) return { minX: 0, minY: 0, maxX: NODE_W, maxY: NODE_H }
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
    for (const { x, y } of positions.values()) {
      minX = Math.min(minX, x)
      minY = Math.min(minY, y)
      maxX = Math.max(maxX, x + NODE_W)
      maxY = Math.max(maxY, y + NODE_H)
    }
    return { minX, minY, maxX, maxY }
  }, [positions])

  // Center the graph on first render / when agents change
  useEffect(() => {
    if (!positions.size) return
    const treeW = bounds.maxX - bounds.minX
    const treeH = bounds.maxY - bounds.minY
    const scale = Math.min(1, containerSize.w / (treeW + 80), containerSize.h / (treeH + 80))
    const tx = (containerSize.w - treeW * scale) / 2 - bounds.minX * scale
    const ty = (containerSize.h - treeH * scale) / 2 - bounds.minY * scale
    setZoom(scale)
    setPan({ x: tx, y: ty })
  }, [agents, containerSize]) // eslint-disable-line react-hooks/exhaustive-deps

  // Pan via mouse drag
  const onMouseDown = useCallback((e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('[data-node]')) return
    dragStart.current = { mx: e.clientX, my: e.clientY, px: pan.x, py: pan.y }
    setDragging(true)
  }, [pan])

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    if (!dragStart.current) return
    setPan({
      x: dragStart.current.px + e.clientX - dragStart.current.mx,
      y: dragStart.current.py + e.clientY - dragStart.current.my,
    })
  }, [])

  const onMouseUp = useCallback(() => {
    dragStart.current = null
    setDragging(false)
  }, [])

  // Zoom via scroll
  const onWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault()
    const delta = e.deltaY > 0 ? 0.9 : 1.1
    setZoom(z => Math.max(0.1, Math.min(2.5, z * delta)))
  }, [])

  const agentMap = useMemo(() => new Map(agents.map(a => [a.id, a])), [agents])

  const edges = useMemo(() => agents
    .filter(a => a.reportsTo && positions.has(a.id) && positions.has(a.reportsTo))
    .map(a => {
      const src = positions.get(a.reportsTo!)!
      const tgt = positions.get(a.id)!
      return {
        id: `${a.reportsTo}-${a.id}`,
        x1: src.x + NODE_W / 2,
        y1: src.y + NODE_H,
        x2: tgt.x + NODE_W / 2,
        y2: tgt.y,
      }
    }), [agents, positions])

  const rootId = agents.find(a => a.reportsTo === null)?.id

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%', height: '100%',
        background: isDark ? '#0d1b2a' : '#f5f5f7',
        overflow: 'hidden',
        cursor: dragging ? 'grabbing' : 'grab',
        userSelect: 'none',
      }}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseUp}
      onWheel={onWheel}
    >
      {/* SVG for edges */}
      <svg
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
      >
        <g transform={`translate(${pan.x},${pan.y}) scale(${zoom})`}>
          {/* Dot grid background */}
          <defs>
            <pattern id="dots" x="0" y="0" width="22" height="22" patternUnits="userSpaceOnUse">
              <circle cx="1" cy="1" r="0.8" fill={isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.06)'} />
            </pattern>
          </defs>
          <rect
            x={bounds.minX - 500}
            y={bounds.minY - 500}
            width={bounds.maxX - bounds.minX + 1000}
            height={bounds.maxY - bounds.minY + 1000}
            fill="url(#dots)"
          />

          {/* Edges */}
          {edges.map(e => {
            const midY = (e.y1 + e.y2) / 2
            return (
              <path
                key={e.id}
                d={`M${e.x1},${e.y1} C${e.x1},${midY} ${e.x2},${midY} ${e.x2},${e.y2}`}
                fill="none"
                stroke={isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.12)'}
                strokeWidth={1.5}
              />
            )
          })}
        </g>
      </svg>

      {/* HTML nodes via absolute positioning */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        {agents.map(agent => {
          const pos = positions.get(agent.id)
          if (!pos) return null
          const x = pan.x + pos.x * zoom
          const y = pan.y + pos.y * zoom
          const w = NODE_W * zoom
          const h = NODE_H * zoom
          const isRoot = agent.id === rootId
          const isSelected = agent.id === selectedAgentId
          const accent = deptAccent(agent.department)
          const trained = agent.onboardingComplete
          const score = agent.readinessScore

          return (
            <div
              key={agent.id}
              data-node="true"
              onClick={() => editable && onAgentClick?.(agent)}
              style={{
                position: 'absolute',
                left: x, top: y,
                width: w, height: h,
                pointerEvents: editable ? 'auto' : 'none',
                cursor: editable ? 'pointer' : 'default',
                transform: 'none',
              }}
            >
              {isDark ? (
                // ── Dark / Agent node ──
                <div style={{
                  width: '100%', height: '100%',
                  background: isSelected ? '#1a3a5c' : isRoot ? '#0f1f35' : trained ? '#1e2d3d' : '#243447',
                  borderRadius: 14 * zoom,
                  border: `${1.5 * zoom}px solid ${isSelected ? '#60A5FA' : isRoot ? '#3B82F6' : 'rgba(255,255,255,0.10)'}`,
                  boxShadow: isSelected
                    ? '0 0 0 3px rgba(96,165,250,0.25), 0 8px 24px rgba(0,0,0,0.35)'
                    : isRoot ? '0 4px 20px rgba(0,0,0,0.4)' : '0 2px 12px rgba(0,0,0,0.25)',
                  padding: `${10 * zoom}px ${12 * zoom}px ${9 * zoom}px`,
                  position: 'relative',
                  overflow: 'hidden',
                  boxSizing: 'border-box',
                }}>
                  {trained && (
                    <div style={{
                      position: 'absolute', top: 8 * zoom, right: 8 * zoom,
                      width: 7 * zoom, height: 7 * zoom, borderRadius: '50%',
                      background: '#34D399',
                      boxShadow: '0 0 6px rgba(52,211,153,0.7)',
                    }} />
                  )}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 9 * zoom, marginBottom: 7 * zoom }}>
                    <div style={{
                      width: 32 * zoom, height: 32 * zoom, borderRadius: 9 * zoom, flexShrink: 0,
                      background: accent + '25', color: accent,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 11 * zoom, fontWeight: 700,
                      border: `${zoom}px solid ${accent}40`,
                    }}>
                      {initials(agent.name)}
                    </div>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <p style={{ margin: 0, fontSize: 11.5 * zoom, fontWeight: 600, color: '#F0F6FF', lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {agent.name}
                      </p>
                      <p style={{ margin: 0, fontSize: 10.5 * zoom, color: 'rgba(240,246,255,0.55)', lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {agent.role}
                      </p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 * zoom, marginBottom: score > 0 ? 6 * zoom : 0 }}>
                    <span style={{
                      fontSize: 9.5 * zoom, color: accent, background: accent + '20',
                      padding: `${2 * zoom}px ${7 * zoom}px`, borderRadius: 5 * zoom, fontWeight: 500,
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1,
                    }}>
                      {agent.department}
                    </span>
                    {trained && score > 0 && (
                      <span style={{ fontSize: 10 * zoom, color: '#34D399', fontWeight: 600, flexShrink: 0 }}>
                        {score}%
                      </span>
                    )}
                  </div>
                  {score > 0 && (
                    <div style={{ height: 3 * zoom, borderRadius: 2 * zoom, background: 'rgba(255,255,255,0.08)' }}>
                      <div style={{ height: '100%', width: `${score}%`, borderRadius: 2 * zoom, background: trained ? '#34D399' : accent }} />
                    </div>
                  )}
                </div>
              ) : (
                // ── Light / Person node ──
                <div style={{
                  width: '100%', height: '100%',
                  background: '#ffffff',
                  borderRadius: 12 * zoom,
                  border: `${1.5 * zoom}px solid ${isSelected ? '#0071E3' : 'rgba(0,0,0,0.09)'}`,
                  boxShadow: isSelected
                    ? '0 0 0 3px rgba(0,113,227,0.15), 0 4px 12px rgba(0,0,0,0.08)'
                    : '0 1px 6px rgba(0,0,0,0.06)',
                  display: 'flex',
                  overflow: 'hidden',
                  boxSizing: 'border-box',
                }}>
                  <div style={{ width: 4 * zoom, flexShrink: 0, background: accent, opacity: 0.75 }} />
                  <div style={{ flex: 1, padding: `${9 * zoom}px ${11 * zoom}px`, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 * zoom, marginBottom: 5 * zoom }}>
                      <div style={{
                        width: 28 * zoom, height: 28 * zoom, borderRadius: '50%', flexShrink: 0,
                        background: accent + '18', color: accent,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 10 * zoom, fontWeight: 700,
                      }}>
                        {initials(agent.name)}
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <p style={{ margin: 0, fontSize: 11.5 * zoom, fontWeight: 600, color: '#1d1d1f', lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {agent.name}
                        </p>
                        <p style={{ margin: 0, fontSize: 10.5 * zoom, color: '#6e6e73', lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {agent.role}
                        </p>
                      </div>
                    </div>
                    <p style={{ margin: 0, fontSize: 9.5 * zoom, color: accent, opacity: 0.8, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {agent.department}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Zoom controls */}
      <div style={{
        position: 'absolute', bottom: 16, right: 16,
        display: 'flex', flexDirection: 'column', gap: 4,
      }}>
        {[{ label: '+', delta: 1.2 }, { label: '−', delta: 0.85 }].map(({ label, delta }) => (
          <button
            key={label}
            onClick={() => setZoom(z => Math.max(0.1, Math.min(2.5, z * delta)))}
            style={{
              width: 28, height: 28, borderRadius: 7, border: 'none',
              background: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.08)',
              color: isDark ? '#F0F6FF' : '#1d1d1f',
              fontSize: 16, fontWeight: 500, cursor: 'pointer', lineHeight: 1,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  )
}
