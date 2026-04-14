'use client'

import { useEffect, useRef } from 'react'
import * as d3 from 'd3'
import { AGENTS, SCORES } from '@/lib/mock-data-civilization'
import { getScoreLevel, SCORE_COLORS, type CommLink } from '@/types/civilization'

type SimNode = d3.SimulationNodeDatum & {
  id:      string
  name:    string
  avatar:  string
  color:   string
  weight:  number  // total message count
}

type SimLink = d3.SimulationLinkDatum<SimNode> & {
  weight: number
}

interface Props {
  links: CommLink[]
}

export default function CommGraph({ links }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const svgRef       = useRef<SVGSVGElement>(null)

  useEffect(() => {
    const container = containerRef.current
    const svgEl     = svgRef.current
    if (!container || !svgEl) return

    const { width, height } = container.getBoundingClientRect()
    const W = width  || 700
    const H = height || 420

    // Build weight map per agent
    const weightMap: Record<string, number> = {}
    links.forEach(l => {
      weightMap[l.from] = (weightMap[l.from] ?? 0) + l.weight
      weightMap[l.to]   = (weightMap[l.to]   ?? 0) + l.weight
    })

    const simNodes: SimNode[] = AGENTS.map(a => {
      const score = SCORES[a.id]
      const level = score ? getScoreLevel(score.composite) : 'good'
      return {
        id:     a.id,
        name:   a.name.split(' ')[0],
        avatar: a.avatar,
        color:  SCORE_COLORS[level],
        weight: weightMap[a.id] ?? 0,
      }
    })

    const simLinks: SimLink[] = links.map(l => ({
      source: l.from,
      target: l.to,
      weight: l.weight,
    }))

    const svg = d3.select<SVGSVGElement, unknown>(svgEl)
    svg.selectAll('*').remove()
    svg.attr('width', W).attr('height', H)

    // Defs — glow filters
    const defs = svg.append('defs')
    AGENTS.forEach(a => {
      const score = SCORES[a.id]
      const level = score ? getScoreLevel(score.composite) : 'good'
      const color = SCORE_COLORS[level]
      const f = defs.append('filter')
        .attr('id', `cg-glow-${a.id}`)
        .attr('x', '-80%').attr('y', '-80%')
        .attr('width', '260%').attr('height', '260%')
      f.append('feGaussianBlur').attr('in', 'SourceGraphic').attr('stdDeviation', 5).attr('result', 'blur')
      const merge = f.append('feMerge')
      merge.append('feMergeNode').attr('in', 'blur')
      merge.append('feMergeNode').attr('in', 'SourceGraphic')
      // color unused but keeps pattern consistent
      void color
    })

    // Zoom
    const g = svg.append('g').attr('class', 'root')
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.4, 3])
      .on('zoom', ev => g.attr('transform', ev.transform))
    svg.call(zoom)

    // Simulation
    const maxWeight = d3.max(links, l => l.weight) ?? 1
    const nodeRadius = (n: SimNode) => Math.max(18, Math.min(18 + n.weight * 0.8, 32))

    const simulation = d3.forceSimulation<SimNode>(simNodes)
      .force('link',
        d3.forceLink<SimNode, SimLink>(simLinks)
          .id(d => d.id)
          .distance(160)
          .strength(0.5),
      )
      .force('charge', d3.forceManyBody<SimNode>().strength(-400))
      .force('center', d3.forceCenter(W / 2, H / 2).strength(0.05))
      .force('collide', d3.forceCollide<SimNode>().radius(d => nodeRadius(d) + 14).strength(0.8))

    // Links
    const linkEls = g.append('g').attr('class', 'links')
      .selectAll<SVGLineElement, SimLink>('line')
      .data(simLinks)
      .enter().append('line')
      .attr('stroke', '#475569')
      .attr('stroke-opacity', 0.3)
      .attr('stroke-width', d => 1 + (d.weight / maxWeight) * 4)

    // Node groups
    const nodeGroups = g.append('g').attr('class', 'nodes')
      .selectAll<SVGGElement, SimNode>('g')
      .data(simNodes)
      .enter().append('g')
      .attr('class', 'cg-node')
      .attr('data-id', d => d.id)
      .style('cursor', 'pointer')

    // Ambient glow disc
    nodeGroups.append('circle')
      .attr('r', d => nodeRadius(d) * 2.4)
      .attr('fill', d => d.color)
      .attr('opacity', 0.06)
      .attr('pointer-events', 'none')

    // Main circle
    nodeGroups.append('circle')
      .attr('r', d => nodeRadius(d))
      .attr('fill', d => `${d.color}22`)
      .attr('stroke', d => d.color)
      .attr('stroke-width', 2)
      .attr('filter', d => `url(#cg-glow-${d.id})`)

    // Initials
    nodeGroups.append('text')
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'central')
      .attr('fill', d => d.color)
      .attr('font-size', d => nodeRadius(d) * 0.55)
      .attr('font-weight', 700)
      .attr('pointer-events', 'none')
      .text(d => d.avatar)

    // Name label
    nodeGroups.append('text')
      .attr('dy', d => nodeRadius(d) + 13)
      .attr('text-anchor', 'middle')
      .attr('fill', '#94A3B8')
      .attr('font-size', 10)
      .attr('font-weight', 500)
      .attr('pointer-events', 'none')
      .text(d => d.name)

    // Drag
    const drag = d3.drag<SVGGElement, SimNode>()
      .on('start', (ev, d) => { if (!ev.active) simulation.alphaTarget(0.3).restart(); d.fx = d.x; d.fy = d.y })
      .on('drag',  (ev, d) => { d.fx = ev.x; d.fy = ev.y })
      .on('end',   (ev, d) => { if (!ev.active) simulation.alphaTarget(0); d.fx = null; d.fy = null })
    nodeGroups.call(drag)

    // Hover
    nodeGroups
      .on('mouseenter', (_ev, hovered) => {
        const connected = new Set<string>([hovered.id])
        simLinks.forEach(l => {
          const s = (l.source as SimNode).id
          const t = (l.target as SimNode).id
          if (s === hovered.id || t === hovered.id) { connected.add(s); connected.add(t) }
        })
        nodeGroups.attr('opacity', d => connected.has(d.id) ? 1 : 0.12)
        linkEls
          .attr('stroke-opacity', d => {
            const s = (d.source as SimNode).id
            const t = (d.target as SimNode).id
            return s === hovered.id || t === hovered.id ? 0.9 : 0.04
          })
          .attr('stroke', d => {
            const s = (d.source as SimNode).id
            const t = (d.target as SimNode).id
            if (s === hovered.id || t === hovered.id) {
              const src = simNodes.find(n => n.id === s)
              return src?.color ?? '#475569'
            }
            return '#475569'
          })
      })
      .on('mouseleave', () => {
        nodeGroups.attr('opacity', 1)
        linkEls.attr('stroke', '#475569').attr('stroke-opacity', 0.3)
      })

    // Tick
    simulation.on('tick', () => {
      linkEls
        .attr('x1', d => (d.source as SimNode).x ?? 0)
        .attr('y1', d => (d.source as SimNode).y ?? 0)
        .attr('x2', d => (d.target as SimNode).x ?? 0)
        .attr('y2', d => (d.target as SimNode).y ?? 0)
      nodeGroups.attr('transform', d => `translate(${d.x ?? 0},${d.y ?? 0})`)
    })

    // Fade in
    nodeGroups.attr('opacity', 0).transition().delay((_d, i) => i * 40).duration(600).attr('opacity', 1)
    linkEls.attr('stroke-opacity', 0).transition().delay(400).duration(700).attr('stroke-opacity', 0.3)

    return () => { simulation.stop() }
  }, [links])

  return (
    <div ref={containerRef} className="w-full h-full">
      <svg ref={svgRef} style={{ display: 'block', width: '100%', height: '100%' }} />
    </div>
  )
}
