'use client'

import { useEffect, useRef } from 'react'
import * as d3 from 'd3'
import { NODE_COLOR, LINK_COLOR, type GraphNode, type GraphLink } from '@/lib/brain-graph'

// ── Types ────────────────────────────────────────────────────────────────────

type SimNode = GraphNode & d3.SimulationNodeDatum

interface SimLink extends d3.SimulationLinkDatum<SimNode> {
  type: GraphLink['type']
  label?: string
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function getRadius(n: SimNode): number {
  if (n.type === 'person')   return 26
  if (n.type === 'document') return 18
  return Math.max(8, Math.min(8 + n.connections * 2, 18))
}

function getLinkStrokeWidth(type: GraphLink['type']): number {
  if (type === 'reports_to' || type === 'works_with') return 1.5
  return 1
}

// ── Component ─────────────────────────────────────────────────────────────────

interface Props {
  nodes: GraphNode[]
  links: GraphLink[]
  selectedNodeId: string | null
  onNodeClick: (node: GraphNode | null) => void
}

export default function BrainGraph({ nodes, links, selectedNodeId, onNodeClick }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const svgRef       = useRef<SVGSVGElement>(null)
  // Use a ref so D3 event handlers always call the latest version without
  // re-running the full simulation effect.
  const onClickRef = useRef(onNodeClick)
  useEffect(() => { onClickRef.current = onNodeClick })

  // ── Main D3 effect (runs once — nodes/links are static) ───────────────────
  useEffect(() => {
    const container = containerRef.current
    const svgEl     = svgRef.current
    if (!container || !svgEl) return

    const { width, height } = container.getBoundingClientRect()
    const W = width  || 1200
    const H = height || 700

    const svg = d3.select<SVGSVGElement, unknown>(svgEl)
    svg.selectAll('*').remove()
    svg.attr('width', W).attr('height', H)

    // ── Glow filters ─────────────────────────────────────────────────────────
    const defs = svg.append('defs')
    ;(Object.keys(NODE_COLOR) as Array<keyof typeof NODE_COLOR>).forEach(type => {
      const color = NODE_COLOR[type]
      const f = defs.append('filter')
        .attr('id', `glow-${type}`)
        .attr('x', '-60%').attr('y', '-60%')
        .attr('width', '220%').attr('height', '220%')
      f.append('feGaussianBlur')
        .attr('in', 'SourceGraphic')
        .attr('stdDeviation', type === 'person' ? 7 : 4)
        .attr('result', 'blur')
      const merge = f.append('feMerge')
      merge.append('feMergeNode').attr('in', 'blur')
      merge.append('feMergeNode').attr('in', 'SourceGraphic')
    })

    // ── Zoom ─────────────────────────────────────────────────────────────────
    const g = svg.append('g').attr('class', 'root')
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.25, 4])
      .on('zoom', ev => g.attr('transform', ev.transform))
    svg.call(zoom)
    // Start slightly zoomed-out so all nodes are visible
    svg.call(
      zoom.transform,
      d3.zoomIdentity
        .translate(W * 0.1, H * 0.1)
        .scale(0.8),
    )

    // ── Simulation data ───────────────────────────────────────────────────────
    const simNodes: SimNode[] = nodes.map(n => ({ ...n }))
    const simLinks: SimLink[] = links.map(l => ({
      source: l.source,
      target: l.target,
      type:   l.type,
      label:  l.label,
    }))

    // ── Simulation ────────────────────────────────────────────────────────────
    const simulation = d3
      .forceSimulation<SimNode>(simNodes)
      .force(
        'link',
        d3.forceLink<SimNode, SimLink>(simLinks)
          .id(d => d.id)
          .distance(d => {
            const s = d.source as SimNode
            const t = d.target as SimNode
            if (s.type === 'person' && t.type === 'person') return 200
            if (s.type === 'person' || t.type === 'person') return 130
            return 80
          })
          .strength(0.6),
      )
      .force(
        'charge',
        d3.forceManyBody<SimNode>().strength(d => (d.type === 'person' ? -900 : -200)),
      )
      .force('center', d3.forceCenter(W / 2, H / 2).strength(0.08))
      .force(
        'collide',
        d3.forceCollide<SimNode>().radius(d => getRadius(d) + 12).strength(0.8),
      )

    // ── Links ─────────────────────────────────────────────────────────────────
    const linkEls = g.append('g').attr('class', 'links')
      .selectAll<SVGLineElement, SimLink>('line')
      .data(simLinks)
      .enter()
      .append('line')
      .attr('stroke', d => LINK_COLOR[d.type] ?? '#94A3B8')
      .attr('stroke-opacity', 0.22)
      .attr('stroke-width', d => getLinkStrokeWidth(d.type))
      .attr('stroke-dasharray', d => d.type === 'uses_tool' ? '3,4' : null)

    // ── Node groups ───────────────────────────────────────────────────────────
    const nodeGroups = g.append('g').attr('class', 'nodes')
      .selectAll<SVGGElement, SimNode>('g')
      .data(simNodes)
      .enter()
      .append('g')
      .attr('class', 'node-group')
      .attr('data-id', d => d.id)
      .style('cursor', 'pointer')

    // Ambient glow disc — circles for all non-document nodes
    nodeGroups.filter(d => d.type !== 'document')
      .append('circle')
      .attr('r', d => getRadius(d) * 2.2)
      .attr('fill', d => NODE_COLOR[d.type])
      .attr('opacity', 0.07)
      .attr('pointer-events', 'none')

    // Ambient glow rect — for document nodes
    nodeGroups.filter(d => d.type === 'document')
      .append('rect')
      .attr('x', d => -getRadius(d) * 2.2)
      .attr('y', d => -getRadius(d) * 2.2)
      .attr('width', d => getRadius(d) * 4.4)
      .attr('height', d => getRadius(d) * 4.4)
      .attr('rx', 8)
      .attr('fill', d => NODE_COLOR[d.type])
      .attr('opacity', 0.07)
      .attr('pointer-events', 'none')

    // Main circle — non-document nodes
    nodeGroups.filter(d => d.type !== 'document')
      .append('circle')
      .attr('r', d => getRadius(d))
      .attr('fill', d => NODE_COLOR[d.type])
      .attr('fill-opacity', 0.85)
      .attr('stroke', d => NODE_COLOR[d.type])
      .attr('stroke-width', 1.5)
      .attr('stroke-opacity', 0.6)
      .attr('filter', d => `url(#glow-${d.type})`)

    // Main rounded rect — document nodes
    nodeGroups.filter(d => d.type === 'document')
      .append('rect')
      .attr('x', d => -getRadius(d))
      .attr('y', d => -getRadius(d))
      .attr('width', d => getRadius(d) * 2)
      .attr('height', d => getRadius(d) * 2)
      .attr('rx', 4)
      .attr('fill', d => NODE_COLOR[d.type])
      .attr('fill-opacity', 0.85)
      .attr('stroke', d => NODE_COLOR[d.type])
      .attr('stroke-width', 1.5)
      .attr('stroke-opacity', 0.6)
      .attr('filter', d => `url(#glow-${d.type})`)

    // Label
    nodeGroups.append('text')
      .attr('dy', d => getRadius(d) + 14)
      .attr('text-anchor', 'middle')
      .attr('fill', '#CBD5E1')
      .attr('font-size', d => (d.type === 'person' ? 12 : 9))
      .attr('font-weight', d => (d.type === 'person' ? '600' : '400'))
      .attr('opacity', 0.9)
      .attr('pointer-events', 'none')
      .text(d => (d.label.length > 16 ? `${d.label.slice(0, 15)}…` : d.label))

    // ── Drag ─────────────────────────────────────────────────────────────────
    const drag = d3.drag<SVGGElement, SimNode>()
      .on('start', (ev, d) => {
        if (!ev.active) simulation.alphaTarget(0.3).restart()
        d.fx = d.x
        d.fy = d.y
      })
      .on('drag', (ev, d) => {
        d.fx = ev.x
        d.fy = ev.y
      })
      .on('end', (ev, d) => {
        if (!ev.active) simulation.alphaTarget(0)
        d.fx = null
        d.fy = null
      })
    nodeGroups.call(drag)

    // ── Hover ─────────────────────────────────────────────────────────────────
    nodeGroups
      .on('mouseenter', (_ev, hovered) => {
        const connected = new Set<string>([hovered.id])
        simLinks.forEach(l => {
          const s = (l.source as SimNode).id
          const t = (l.target as SimNode).id
          if (s === hovered.id || t === hovered.id) {
            connected.add(s)
            connected.add(t)
          }
        })
        nodeGroups.attr('opacity', d => (connected.has(d.id) ? 1 : 0.12))
        linkEls
          .attr('stroke-opacity', d => {
            const s = (d.source as SimNode).id
            const t = (d.target as SimNode).id
            return s === hovered.id || t === hovered.id ? 0.85 : 0.04
          })
          .attr('stroke-width', d => {
            const s = (d.source as SimNode).id
            const t = (d.target as SimNode).id
            return s === hovered.id || t === hovered.id ? 2.5 : getLinkStrokeWidth(d.type)
          })
      })
      .on('mouseleave', () => {
        nodeGroups.attr('opacity', 1)
        linkEls
          .attr('stroke-opacity', 0.22)
          .attr('stroke-width', d => getLinkStrokeWidth(d.type))
      })

    // ── Click ────────────────────────────────────────────────────────────────
    nodeGroups.on('click', (ev, d) => {
      ev.stopPropagation()
      onClickRef.current(d)
    })
    svg.on('click', () => onClickRef.current(null))

    // ── Tick ─────────────────────────────────────────────────────────────────
    simulation.on('tick', () => {
      // Keep nodes at least 50px from every edge
      simNodes.forEach(n => {
        n.x = Math.max(50, Math.min(W - 50, n.x ?? W / 2))
        n.y = Math.max(50, Math.min(H - 50, n.y ?? H / 2))
      })

      linkEls
        .attr('x1', d => (d.source as SimNode).x ?? 0)
        .attr('y1', d => (d.source as SimNode).y ?? 0)
        .attr('x2', d => (d.target as SimNode).x ?? 0)
        .attr('y2', d => (d.target as SimNode).y ?? 0)
      nodeGroups.attr('transform', d => `translate(${d.x ?? 0},${d.y ?? 0})`)
    })

    // ── Fade-in ───────────────────────────────────────────────────────────────
    nodeGroups.attr('opacity', 0)
      .transition()
      .delay((_d, i) => i * 25)
      .duration(500)
      .attr('opacity', 1)

    linkEls.attr('stroke-opacity', 0)
      .transition()
      .delay(300)
      .duration(600)
      .attr('stroke-opacity', 0.22)

    return () => { simulation.stop() }
  }, [nodes, links]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Selection highlight effect ─────────────────────────────────────────────
  useEffect(() => {
    const svgEl = svgRef.current
    if (!svgEl) return
    const svg = d3.select(svgEl)

    svg.selectAll<SVGGElement, unknown>('.node-group').each(function () {
      const id = this.getAttribute('data-id')
      const opacity = !selectedNodeId || id === selectedNodeId ? '1' : '0.3'
      d3.select(this).attr('opacity', opacity)
    })
  }, [selectedNodeId])

  return (
    <div ref={containerRef} style={{ width: '100%', height: 700, overflow: 'hidden' }}>
      <svg ref={svgRef} style={{ display: 'block' }} />
    </div>
  )
}
