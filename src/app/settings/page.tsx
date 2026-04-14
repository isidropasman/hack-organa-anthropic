'use client'

import { useEffect, useState } from 'react'
import { agentStore } from '@/lib/agent-store'
import {
  INTEGRATIONS_REGISTRY,
  computeRecommendations,
  CATEGORY_LABELS,
} from '@/lib/integrations-registry'
import type { Integration, IntegrationCategory, ConnectionStatus } from '@/lib/integrations-registry'

// ─── LocalStorage ─────────────────────────────────────────────────────────────

const CONNECTED_KEY = 'organa_connected_integrations'
// Only resend and google-calendar start connected — drive/slack/gmail are featured recommendations
const INITIALLY_CONNECTED = ['resend', 'google-calendar']
// Pinned first 3 in the recommendations section (in order)
const PINNED_RECOMMENDATIONS = ['google-drive', 'slack', 'github']

function loadConnected(): string[] {
  if (typeof window === 'undefined') return INITIALLY_CONNECTED
  try {
    const raw = localStorage.getItem(CONNECTED_KEY)
    return raw ? (JSON.parse(raw) as string[]) : INITIALLY_CONNECTED
  } catch {
    return INITIALLY_CONNECTED
  }
}

function saveConnected(ids: string[]) {
  localStorage.setItem(CONNECTED_KEY, JSON.stringify(ids))
}

// ─── Brand logos (original SVGs) ─────────────────────────────────────────────

const BRAND_SVGS: Record<string, (size: number) => React.ReactNode> = {
  'google-drive': (size) => (
    <svg width={size} height={size} viewBox="0 0 87.3 78" xmlns="http://www.w3.org/2000/svg">
      <path d="m6.6 66.85 3.85 6.65c.8 1.4 1.95 2.5 3.3 3.3l13.75-23.8h-27.5c0 1.55.4 3.1 1.2 4.5z" fill="#0066da"/>
      <path d="m43.65 25-13.75-23.8c-1.35.8-2.5 1.9-3.3 3.3l-25.4 44a9.06 9.06 0 0 0-1.2 4.5h27.5z" fill="#00ac47"/>
      <path d="m73.55 76.8c1.35-.8 2.5-1.9 3.3-3.3l1.6-2.75 7.65-13.25c.8-1.4 1.2-2.95 1.2-4.5h-27.5l5.85 11.5z" fill="#ea4335"/>
      <path d="m43.65 25 13.75-23.8c-1.35-.8-2.9-1.2-4.5-1.2h-18.5c-1.6 0-3.15.45-4.5 1.2z" fill="#00832d"/>
      <path d="m59.8 53h-32.3l-13.75 23.8c1.35.8 2.9 1.2 4.5 1.2h50.8c1.6 0 3.15-.45 4.5-1.2z" fill="#2684fc"/>
      <path d="m73.4 26.5-12.7-22c-.8-1.4-1.95-2.5-3.3-3.3l-13.75 23.8 16.15 27h27.45c0-1.55-.4-3.1-1.2-4.5z" fill="#ffba00"/>
    </svg>
  ),
  'slack': (size) => (
    <svg width={size} height={size} viewBox="0 0 270 270" xmlns="http://www.w3.org/2000/svg">
      <path d="M99.4 151.2c0 7.1-5.8 12.9-12.9 12.9-7.1 0-12.9-5.8-12.9-12.9 0-7.1 5.8-12.9 12.9-12.9h12.9v12.9z" fill="#E01E5A"/>
      <path d="M105.9 151.2c0-7.1 5.8-12.9 12.9-12.9s12.9 5.8 12.9 12.9v32.3c0 7.1-5.8 12.9-12.9 12.9s-12.9-5.8-12.9-12.9v-32.3z" fill="#E01E5A"/>
      <path d="M118.8 99.4c-7.1 0-12.9-5.8-12.9-12.9 0-7.1 5.8-12.9 12.9-12.9 7.1 0 12.9 5.8 12.9 12.9v12.9h-12.9z" fill="#36C5F0"/>
      <path d="M118.8 105.9c7.1 0 12.9 5.8 12.9 12.9s-5.8 12.9-12.9 12.9H86.5c-7.1 0-12.9-5.8-12.9-12.9s5.8-12.9 12.9-12.9h32.3z" fill="#36C5F0"/>
      <path d="M170.6 118.8c0-7.1 5.8-12.9 12.9-12.9 7.1 0 12.9 5.8 12.9 12.9 0 7.1-5.8 12.9-12.9 12.9h-12.9v-12.9z" fill="#2EB67D"/>
      <path d="M164.1 118.8c0 7.1-5.8 12.9-12.9 12.9-7.1 0-12.9-5.8-12.9-12.9V86.5c0-7.1 5.8-12.9 12.9-12.9 7.1 0 12.9 5.8 12.9 12.9v32.3z" fill="#2EB67D"/>
      <path d="M151.2 170.6c7.1 0 12.9 5.8 12.9 12.9 0 7.1-5.8 12.9-12.9 12.9-7.1 0-12.9-5.8-12.9-12.9v-12.9h12.9z" fill="#ECB22E"/>
      <path d="M151.2 164.1c-7.1 0-12.9-5.8-12.9-12.9 0-7.1 5.8-12.9 12.9-12.9h32.3c7.1 0 12.9 5.8 12.9 12.9 0 7.1-5.8 12.9-12.9 12.9h-32.3z" fill="#ECB22E"/>
    </svg>
  ),
  'gmail': (size) => (
    <svg width={size} height={size} viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
      <path fill="#4caf50" d="M45 16.2l-5 2.75-5 4.75V40h7a3 3 0 003-3V16.2z"/>
      <path fill="#1e88e5" d="M3 16.2l5 2.75 5 4.75V40H6a3 3 0 01-3-3V16.2z"/>
      <polygon fill="#e53935" points="35,11.2 24,19.45 13,11.2 12,28 24,37.45 36,28"/>
      <path fill="#c62828" d="M3 12.45v3.75l10 7.5V12.45L10.25 11c-1.8-1.35-4.25-.9-5.6.9z"/>
      <path fill="#fbc02d" d="M45 12.45v3.75l-10 7.5V12.45L37.75 11c1.8-1.35 4.25-.9 5.6.9z"/>
    </svg>
  ),
  'github': (size) => (
    <svg width={size} height={size} viewBox="0 0 98 96" xmlns="http://www.w3.org/2000/svg">
      <path fillRule="evenodd" clipRule="evenodd" d="M48.854 0C21.839 0 0 22 0 49.217c0 21.756 13.993 40.172 33.405 46.69 2.427.49 3.316-1.059 3.316-2.362 0-1.141-.08-5.052-.08-9.127-13.59 2.934-16.42-5.867-16.42-5.867-2.184-5.704-5.42-7.17-5.42-7.17-4.448-3.015.324-3.015.324-3.015 4.934.326 7.523 5.052 7.523 5.052 4.367 7.496 11.404 5.378 14.235 4.074.404-3.178 1.699-5.378 3.074-6.6-10.839-1.141-22.243-5.378-22.243-24.283 0-5.378 1.94-9.778 5.014-13.2-.485-1.222-2.184-6.275.486-13.038 0 0 4.125-1.304 13.426 5.052a46.97 46.97 0 0 1 12.214-1.63c4.125 0 8.33.571 12.213 1.63 9.302-6.356 13.427-5.052 13.427-5.052 2.67 6.763.97 11.816.485 13.038 3.155 3.422 5.015 7.822 5.015 13.2 0 18.905-11.404 23.06-22.324 24.283 1.78 1.548 3.316 4.481 3.316 9.126 0 6.6-.08 11.897-.08 13.526 0 1.304.89 2.853 3.316 2.364 19.412-6.52 33.405-24.935 33.405-46.691C97.707 22 75.788 0 48.854 0z" fill="#24292f"/>
    </svg>
  ),
}

function BrandLogo({ id, size, fallback }: { id: string; size: number; fallback: string }) {
  const renderer = BRAND_SVGS[id]
  if (renderer) return <>{renderer(size)}</>
  return <span style={{ fontSize: size * 0.75 }}>{fallback}</span>
}

// ─── Fallback agents (when store is empty) ────────────────────────────────────

const FALLBACK_AGENTS = [
  { id: 'a1', name: 'ARIA', role: 'CEO', department: 'Executive', capabilities: ['strategic planning', 'reporting', 'email'] },
  { id: 'a2', name: 'NOVA', role: 'CTO', department: 'Technology', capabilities: ['architecture', 'code review', 'deployments'] },
  { id: 'a3', name: 'LUMA', role: 'CFO', department: 'Finance', capabilities: ['financial reporting', 'invoicing', 'payments'] },
  { id: 'a4', name: 'VEGA', role: 'Project Manager', department: 'Technology', capabilities: ['sprint planning', 'task management'] },
  { id: 'a5', name: 'PULSE', role: 'Marketing Lead', department: 'Marketing', capabilities: ['campaigns', 'social media', 'email marketing'] },
  { id: 'a6', name: 'FLUX', role: 'Operations Manager', department: 'Operations', capabilities: ['process optimization', 'vendor management'] },
  { id: 'a7', name: 'SAGE', role: 'HR Director', department: 'People', capabilities: ['hiring', 'onboarding', 'team management'] },
]

// ─── Config maps ──────────────────────────────────────────────────────────────

const COMPLEXITY_CONFIG: Record<Integration['setup_complexity'], { label: string; color: string; detail: string }> = {
  one_click: { label: 'Un click',         color: 'text-organa-success',     detail: 'Conexión inmediata sin configuración adicional' },
  oauth:     { label: 'OAuth',            color: 'text-organa-accent',      detail: 'Autoriza el acceso con tu cuenta — menos de 1 minuto' },
  api_key:   { label: 'API Key',          color: 'text-amber-600',          detail: 'Necesitás una API key de la plataforma — 2-3 minutos' },
  custom:    { label: 'Configuración',    color: 'text-organa-text-muted',  detail: 'Requiere configuración adicional del equipo técnico' },
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function ini(name: string) {
  return (name ?? '?').split(' ').map((n: string) => n[0]).slice(0, 2).join('').toUpperCase()
}

function resolveStatus(integration: Integration, connectedIds: string[]): ConnectionStatus {
  if (integration.status === 'coming_soon') return 'coming_soon'
  return connectedIds.includes(integration.id) ? 'connected' : 'available'
}

// ─── AgentChips ──────────────────────────────────────────────────────────────

function AgentChips({ agents, max = 3 }: { agents: string[]; max?: number }) {
  const shown = agents.slice(0, max)
  const extra = agents.length - max
  return (
    <div className="flex items-center gap-1 flex-wrap">
      {shown.map(name => (
        <span key={name} className="flex items-center gap-1 bg-organa-bg border border-organa-border rounded-full px-2 py-0.5 text-[10px] text-organa-text-secondary font-medium">
          <span className="w-3.5 h-3.5 rounded-full bg-organa-accent/10 flex items-center justify-center text-[8px] font-bold text-organa-accent flex-shrink-0">{ini(name)}</span>
          {name.split(' ')[0]}
        </span>
      ))}
      {extra > 0 && <span className="text-[10px] text-organa-text-muted font-medium">+{extra}</span>}
    </div>
  )
}

// ─── StatusBadge ──────────────────────────────────────────────────────────────

function StatusBadge({ status, score }: { status: ConnectionStatus; score?: number }) {
  if (status === 'connected') return (
    <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-organa-success/10 text-organa-success border border-organa-success/20 whitespace-nowrap">✅ Conectado</span>
  )
  if (status === 'coming_soon') return (
    <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-organa-bg text-organa-text-muted border border-organa-border whitespace-nowrap">Próximamente</span>
  )
  if ((score ?? 0) > 20) return (
    <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-organa-accent/10 text-organa-accent border border-organa-accent/20 whitespace-nowrap">⭐ Recomendado</span>
  )
  return (
    <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-organa-bg text-organa-text-muted border border-organa-border whitespace-nowrap">Disponible</span>
  )
}

// ─── CategoryFilter ──────────────────────────────────────────────────────────

function CategoryFilter({
  selected,
  onChange,
  categories,
  counts,
}: {
  selected: IntegrationCategory | 'all'
  onChange: (c: IntegrationCategory | 'all') => void
  categories: IntegrationCategory[]
  counts: Record<string, number>
}) {
  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      {(['all', ...categories] as (IntegrationCategory | 'all')[]).map(cat => (
        <button
          key={cat}
          onClick={() => onChange(cat)}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors whitespace-nowrap ${
            selected === cat
              ? 'bg-organa-accent text-white border-organa-accent shadow-button'
              : 'bg-white text-organa-text-muted border-organa-border hover:border-organa-accent hover:text-organa-text'
          }`}
        >
          {cat === 'all' ? 'Todas' : CATEGORY_LABELS[cat]}
          <span className={`ml-1 text-[9px] font-bold ${selected === cat ? 'opacity-70' : 'opacity-50'}`}>
            {counts[cat] ?? 0}
          </span>
        </button>
      ))}
    </div>
  )
}

// ─── IntegrationCard (compact grid) ──────────────────────────────────────────

function IntegrationCard({
  integration,
  connectedIds,
  onSelect,
  onConnect,
}: {
  integration: Integration
  connectedIds: string[]
  onSelect: () => void
  onConnect: () => void
}) {
  const status = resolveStatus(integration, connectedIds)
  const isConnected  = status === 'connected'
  const isComingSoon = status === 'coming_soon'
  const isRecommended = !isConnected && (integration.priority_score ?? 0) > 20

  return (
    <div
      onClick={onSelect}
      className={`relative bg-white border rounded-2xl p-4 shadow-card cursor-pointer transition-all hover:shadow-card-hover ${
        isConnected    ? 'border-organa-success/40' :
        isRecommended  ? 'border-organa-accent/30' :
        'border-organa-border'
      } ${isComingSoon ? 'opacity-60 cursor-default' : ''}`}
    >
      {/* Header */}
      <div className="flex items-start gap-3 mb-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden ${
          isConnected ? 'bg-organa-success/10' : 'bg-organa-bg'
        }`}>
          <BrandLogo id={integration.id} size={28} fallback={integration.icon} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-organa-text font-semibold text-sm leading-tight truncate">{integration.name}</p>
          <p className="text-organa-text-muted text-[10px]">{CATEGORY_LABELS[integration.category]}</p>
        </div>
      </div>

      <p className="text-organa-text-secondary text-xs leading-relaxed mb-3 line-clamp-2">{integration.description}</p>

      {/* Agent chips */}
      {isRecommended && (integration.recommended_for?.length ?? 0) > 0 && (
        <div className="mb-3">
          <AgentChips agents={integration.recommended_for!} max={3} />
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <StatusBadge status={status} score={integration.priority_score} />
          {integration.mcp_available && (
            <span className="text-[9px] font-bold text-organa-accent bg-organa-accent/10 border border-organa-accent/20 px-1.5 py-0.5 rounded-full">MCP</span>
          )}
        </div>
        {!isComingSoon && (
          <button
            onClick={e => { e.stopPropagation(); if (!isComingSoon) onConnect() }}
            className={`text-xs font-semibold px-3 py-1.5 rounded-xl transition-colors flex-shrink-0 ${
              isConnected
                ? 'text-organa-text-muted bg-organa-bg border border-organa-border hover:border-organa-accent/50'
                : 'text-white bg-organa-accent hover:bg-organa-accent-hover shadow-button'
            }`}
          >
            {isConnected ? 'Configurar' : 'Conectar'}
          </button>
        )}
      </div>
    </div>
  )
}

// ─── RecommendationCard (featured hero card) ──────────────────────────────────

function RecommendationCard({
  integration,
  onSelect,
  onConnect,
}: {
  integration: Integration
  onSelect: () => void
  onConnect: () => void
}) {
  const complexity = COMPLEXITY_CONFIG[integration.setup_complexity]

  return (
    <div
      onClick={onSelect}
      className="relative bg-white border border-organa-accent/25 rounded-2xl p-5 shadow-card cursor-pointer hover:shadow-card-hover transition-all overflow-hidden"
    >
      {/* Decorative gradient blob */}
      <div className="absolute -top-6 -right-6 w-24 h-24 bg-organa-accent/6 rounded-full pointer-events-none" />

      {/* Header */}
      <div className="flex items-center gap-3 mb-3">
        <div className="w-12 h-12 rounded-2xl bg-organa-bg flex items-center justify-center flex-shrink-0 overflow-hidden">
          <BrandLogo id={integration.id} size={34} fallback={integration.icon} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <p className="text-organa-text font-bold">{integration.name}</p>
            {integration.mcp_available && (
              <span className="text-[9px] font-bold text-organa-accent bg-organa-accent/10 border border-organa-accent/20 px-1.5 py-0.5 rounded-full">MCP</span>
            )}
          </div>
          <p className="text-organa-text-muted text-xs">{CATEGORY_LABELS[integration.category]}</p>
        </div>
        <div className="text-right flex-shrink-0">
          <div className="text-xs font-bold text-organa-accent">{integration.priority_score ?? 0} pts</div>
          <div className={`text-[10px] font-medium ${complexity.color}`}>{complexity.label}</div>
        </div>
      </div>

      {/* Reason */}
      {integration.recommendation_reason && (
        <div className="bg-organa-accent/6 border border-organa-accent/15 rounded-xl px-3 py-2 mb-3">
          <p className="text-organa-accent text-xs">✨ {integration.recommendation_reason.split(' · ')[0]}</p>
        </div>
      )}

      {/* Capabilities */}
      <div className="flex flex-wrap gap-1 mb-3">
        {integration.capabilities.slice(0, 3).map(cap => (
          <span key={cap} className="text-[10px] bg-organa-bg text-organa-text-secondary border border-organa-border px-2 py-0.5 rounded-full">{cap}</span>
        ))}
        {integration.capabilities.length > 3 && (
          <span className="text-[10px] text-organa-text-muted">+{integration.capabilities.length - 3}</span>
        )}
      </div>

      {/* Agent chips */}
      {(integration.recommended_for?.length ?? 0) > 0 && (
        <div className="mb-4">
          <p className="text-[10px] text-organa-text-muted mb-1.5">Beneficia a:</p>
          <AgentChips agents={integration.recommended_for!} max={4} />
        </div>
      )}

      {/* CTA */}
      <button
        onClick={e => { e.stopPropagation(); onConnect() }}
        className="w-full bg-organa-accent hover:bg-organa-accent-hover text-white rounded-xl py-2.5 text-sm font-semibold shadow-button transition-colors"
      >
        Conectar {integration.name}
      </button>
    </div>
  )
}

// ─── DetailPanel (right slide-out) ───────────────────────────────────────────

function DetailPanel({
  integration,
  connectedIds,
  onClose,
  onConnect,
  onDisconnect,
}: {
  integration: Integration | null
  connectedIds: string[]
  onClose: () => void
  onConnect: (i: Integration) => void
  onDisconnect: (id: string) => void
}) {
  if (!integration) return null

  const status = resolveStatus(integration, connectedIds)
  const isConnected  = status === 'connected'
  const isComingSoon = status === 'coming_soon'
  const complexity = COMPLEXITY_CONFIG[integration.setup_complexity]

  return (
    <>
      <div className="fixed inset-0 bg-black/20 backdrop-blur-[2px] z-40" onClick={onClose} />
      <div className="fixed right-0 top-0 h-full w-[420px] max-w-[90vw] bg-white shadow-modal z-50 flex flex-col animate-slide-right">

        {/* Header */}
        <div className="p-6 border-b border-organa-border flex items-start gap-4 flex-shrink-0">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 overflow-hidden ${
            isConnected ? 'bg-organa-success/10' : 'bg-organa-bg'
          }`}>
            <BrandLogo id={integration.id} size={40} fallback={integration.icon} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5 flex-wrap">
              <h2 className="text-organa-text font-bold text-lg leading-tight">{integration.name}</h2>
              {integration.mcp_available && (
                <span className="text-[9px] font-bold text-organa-accent bg-organa-accent/10 border border-organa-accent/20 px-1.5 py-0.5 rounded-full">MCP</span>
              )}
            </div>
            <p className="text-organa-text-muted text-xs mb-1.5">{CATEGORY_LABELS[integration.category]}</p>
            <StatusBadge status={status} score={integration.priority_score} />
          </div>
          <button
            onClick={onClose}
            className="text-organa-text-muted hover:text-organa-text transition-colors flex-shrink-0 p-1"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M14 4L4 14M4 4l10 10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">

          {/* Description */}
          <p className="text-organa-text-secondary text-sm leading-relaxed">{integration.long_description}</p>

          {/* Agent value */}
          <div className="bg-organa-accent/5 border border-organa-accent/15 rounded-xl p-4">
            <p className="text-[10px] font-bold text-organa-accent uppercase tracking-wide mb-1.5">Valor para tus agentes</p>
            <p className="text-organa-text-secondary text-sm leading-relaxed">{integration.agent_value}</p>
          </div>

          {/* Capabilities */}
          <div>
            <p className="text-[10px] font-bold text-organa-text uppercase tracking-wide mb-2">Capacidades</p>
            <div className="flex flex-wrap gap-1.5">
              {integration.capabilities.map(cap => (
                <span key={cap} className="text-xs bg-organa-bg text-organa-text-secondary border border-organa-border px-2.5 py-1 rounded-full">{cap}</span>
              ))}
            </div>
          </div>

          {/* Agents that benefit */}
          {(integration.recommended_for?.length ?? 0) > 0 && (
            <div>
              <p className="text-[10px] font-bold text-organa-text uppercase tracking-wide mb-2">Agentes que se benefician</p>
              <AgentChips agents={integration.recommended_for!} max={8} />
            </div>
          )}

          {/* Setup */}
          <div>
            <p className="text-[10px] font-bold text-organa-text uppercase tracking-wide mb-2">Configuración</p>
            <div className="flex items-start gap-2">
              <span className={`text-sm font-bold ${complexity.color} flex-shrink-0`}>{complexity.label}</span>
              <span className="text-organa-text-muted text-xs">·</span>
              <span className="text-organa-text-secondary text-xs">{complexity.detail}</span>
            </div>
          </div>

          {/* MCP info */}
          {integration.mcp_available && integration.mcp_url && (
            <div className="bg-organa-bg border border-organa-border rounded-xl p-3">
              <p className="text-[10px] font-bold text-organa-text mb-1">Model Context Protocol (MCP)</p>
              <p className="text-organa-text-muted text-xs leading-relaxed">
                Esta integración usa MCP — el estándar abierto de Anthropic para conectar agentes con herramientas externas de forma segura.
              </p>
            </div>
          )}

          {/* Recommendation reason */}
          {integration.recommendation_reason && !isConnected && !isComingSoon && (
            <div className="bg-organa-accent/5 border border-organa-accent/15 rounded-xl p-3">
              <p className="text-[10px] font-bold text-organa-accent mb-1">¿Por qué recomendamos esto?</p>
              <p className="text-organa-text-secondary text-xs">{integration.recommendation_reason}</p>
            </div>
          )}
        </div>

        {/* Footer CTA */}
        <div className="p-6 border-t border-organa-border flex-shrink-0">
          {isConnected && (
            <div className="space-y-2.5">
              <div className="flex items-center gap-2 text-organa-success text-sm font-semibold">
                <span>✅</span>
                <span>Integración activa</span>
              </div>
              <button
                onClick={() => onDisconnect(integration.id)}
                className="w-full py-2.5 rounded-xl border border-red-200 text-red-500 text-sm font-semibold hover:bg-red-50 transition-colors"
              >
                Desconectar
              </button>
            </div>
          )}
          {!isConnected && !isComingSoon && (
            <button
              onClick={() => { onClose(); onConnect(integration) }}
              className="w-full bg-organa-accent hover:bg-organa-accent-hover text-white rounded-xl py-3 text-sm font-semibold shadow-button transition-colors"
            >
              Conectar {integration.name}
            </button>
          )}
          {isComingSoon && (
            <div className="text-center space-y-2">
              <p className="text-organa-text-muted text-sm">Esta integración llegará pronto.</p>
              <button className="w-full py-2.5 rounded-xl border border-organa-border text-organa-text-muted text-sm font-semibold hover:border-organa-accent/50 transition-colors">
                Notificarme cuando esté disponible
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

// ─── ConnectFlow (modal) ──────────────────────────────────────────────────────

type ConnectStep = 'prompt' | 'loading' | 'success'

function ConnectFlow({
  integration,
  onClose,
  onConnected,
}: {
  integration: Integration | null
  onClose: () => void
  onConnected: (id: string) => void
}) {
  const [step, setStep] = useState<ConnectStep>('prompt')
  const [apiKey, setApiKey] = useState('')

  useEffect(() => {
    if (integration) { setStep('prompt'); setApiKey('') }
  }, [integration?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  if (!integration) return null

  const needsApiKey = integration.setup_complexity === 'api_key'

  function handleConnect() {
    if (needsApiKey && !apiKey.trim()) return
    setStep('loading')
    setTimeout(() => {
      setStep('success')
      setTimeout(() => {
        onConnected(integration!.id)
        onClose()
      }, 1400)
    }, 1800)
  }

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-[2px] z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-modal w-full max-w-sm overflow-hidden animate-scale-in"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-organa-border flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-organa-bg flex items-center justify-center flex-shrink-0 overflow-hidden">
            <BrandLogo id={integration.id} size={28} fallback={integration.icon} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-organa-text font-bold truncate">{integration.name}</p>
            <p className="text-organa-text-muted text-xs">{COMPLEXITY_CONFIG[integration.setup_complexity].label}</p>
          </div>
          <button onClick={onClose} className="text-organa-text-muted hover:text-organa-text transition-colors flex-shrink-0">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M12 4L4 12M4 4l8 8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="p-5">
          {step === 'prompt' && (
            <div className="space-y-4">
              {!needsApiKey && (
                <>
                  <p className="text-organa-text-secondary text-sm">
                    {integration.setup_complexity === 'oauth'
                      ? `Se abrirá una ventana para autorizar el acceso a ${integration.name}. El proceso tarda menos de un minuto.`
                      : `Conectar ${integration.name} de forma instantánea. No necesitás ninguna configuración adicional.`}
                  </p>
                  <div className="bg-organa-bg rounded-xl p-3 space-y-1.5">
                    <p className="text-[10px] font-bold text-organa-text">Permisos que se solicitan:</p>
                    {integration.capabilities.slice(0, 4).map(cap => (
                      <div key={cap} className="flex items-center gap-2 text-xs text-organa-text-secondary">
                        <span className="text-organa-success font-bold text-[10px]">✓</span>
                        {cap}
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={handleConnect}
                    className="w-full bg-organa-accent hover:bg-organa-accent-hover text-white rounded-xl py-3 text-sm font-semibold shadow-button transition-colors"
                  >
                    {integration.setup_complexity === 'oauth'
                      ? `Autorizar con ${integration.name}`
                      : `Conectar ${integration.name}`}
                  </button>
                </>
              )}

              {needsApiKey && (
                <>
                  <p className="text-organa-text-secondary text-sm">
                    Ingresá tu API key de {integration.name}. La encontrás en el panel de configuración de tu cuenta.
                  </p>
                  <div>
                    <label className="text-[10px] font-bold text-organa-text uppercase tracking-wide block mb-1.5">
                      API Key
                    </label>
                    <input
                      type="password"
                      value={apiKey}
                      onChange={e => setApiKey(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') handleConnect() }}
                      placeholder={`${integration.id}_xxxxxxxxxxxx`}
                      className="w-full border border-organa-border rounded-xl px-3 py-2.5 text-sm text-organa-text placeholder-organa-text-muted bg-organa-bg focus:outline-none focus:border-organa-accent transition-colors font-mono"
                      autoFocus
                    />
                  </div>
                  <button
                    onClick={handleConnect}
                    disabled={!apiKey.trim()}
                    className="w-full bg-organa-accent hover:bg-organa-accent-hover disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl py-3 text-sm font-semibold shadow-button transition-colors"
                  >
                    Guardar y conectar
                  </button>
                </>
              )}
            </div>
          )}

          {step === 'loading' && (
            <div className="py-8 flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-organa-accent border-t-transparent rounded-full animate-spin" />
              <div className="text-center">
                <p className="text-organa-text font-semibold text-sm">
                  {needsApiKey ? 'Verificando credenciales...' : 'Conectando con tu cuenta...'}
                </p>
                <p className="text-organa-text-muted text-xs mt-1">Esto tarda solo unos segundos</p>
              </div>
            </div>
          )}

          {step === 'success' && (
            <div className="py-8 flex flex-col items-center gap-3 text-center">
              <div className="w-16 h-16 rounded-2xl bg-organa-success/10 flex items-center justify-center text-4xl">
                ✅
              </div>
              <div>
                <p className="text-organa-text font-bold text-base">{integration.name} conectado</p>
                <p className="text-organa-text-secondary text-xs mt-1 max-w-[240px] leading-relaxed">{integration.agent_value}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SettingsPage() {
  const [mounted, setMounted] = useState(false)
  const [integrations, setIntegrations] = useState<Integration[]>([])
  const [connectedIds, setConnectedIds] = useState<string[]>(INITIALLY_CONNECTED)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<IntegrationCategory | 'all'>('all')
  const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null)
  const [connectingIntegration, setConnectingIntegration] = useState<Integration | null>(null)

  useEffect(() => {
    setMounted(true)
    const connected = loadConnected()
    setConnectedIds(connected)

    // Build org context from real agents (or fallback)
    const storeAgents = agentStore.getAllAgents()
    const contextAgents = storeAgents.length > 0
      ? storeAgents.map(a => ({
          id: a.id,
          name: a.name,
          role: a.role,
          department: a.department,
          capabilities: a.knowledgeBase
            ? [
                ...(a.knowledgeBase.categories.tools ?? []),
                ...(a.knowledgeBase.categories.tasks ?? []),
              ]
            : [],
        }))
      : FALLBACK_AGENTS

    // Apply real connected status to registry before computing
    const registryWithStatus = INTEGRATIONS_REGISTRY.map(integ => ({
      ...integ,
      status: integ.status === 'coming_soon'
        ? ('coming_soon' as const)
        : connected.includes(integ.id)
          ? ('connected' as const)
          : ('available' as const),
    }))

    const computed = computeRecommendations(registryWithStatus, {
      agents: contextAgents,
      sector: 'marketing_agency',
      size: 'startup',
      connected_integrations: connected,
    })

    setIntegrations(computed)
  }, [])

  function handleConnect(integration: Integration) {
    setSelectedIntegration(null)
    setConnectingIntegration(integration)
  }

  function handleConnected(id: string) {
    const next = [...connectedIds, id]
    setConnectedIds(next)
    saveConnected(next)
    setIntegrations(prev =>
      prev.map(i =>
        i.id === id ? { ...i, status: 'connected' as const, priority_score: 0 } : i
      )
    )
  }

  function handleDisconnect(id: string) {
    setSelectedIntegration(null)
    const next = connectedIds.filter(c => c !== id)
    setConnectedIds(next)
    saveConnected(next)
    setIntegrations(prev =>
      prev.map(i => i.id === id ? { ...i, status: 'available' as const } : i)
    )
  }

  if (!mounted) return null

  // ── Derived ──────────────────────────────────────────────────────────────────

  const summary = {
    connected:   integrations.filter(i => resolveStatus(i, connectedIds) === 'connected').length,
    available:   integrations.filter(i => resolveStatus(i, connectedIds) === 'available').length,
    recommended: integrations.filter(i => resolveStatus(i, connectedIds) === 'available' && (i.priority_score ?? 0) > 20).length,
    coming_soon: integrations.filter(i => i.status === 'coming_soon').length,
  }

  const pinnedRecs = PINNED_RECOMMENDATIONS
    .map(id => integrations.find(i => i.id === id))
    .filter((i): i is Integration => !!i && resolveStatus(i, connectedIds) === 'available')

  const otherRecs = integrations.filter(
    i => !PINNED_RECOMMENDATIONS.includes(i.id) &&
         resolveStatus(i, connectedIds) === 'available' &&
         (i.priority_score ?? 0) > 20
  )

  const topRecommendations = [...pinnedRecs, ...otherRecs].slice(0, 3)

  const categories = Array.from(new Set(integrations.map(i => i.category))) as IntegrationCategory[]

  const categoryCounts: Record<string, number> = { all: integrations.length }
  for (const i of integrations) {
    categoryCounts[i.category] = (categoryCounts[i.category] ?? 0) + 1
  }

  const filtered = integrations.filter(i => {
    const q = search.toLowerCase()
    const matchSearch = !q ||
      i.name.toLowerCase().includes(q) ||
      i.description.toLowerCase().includes(q) ||
      i.capabilities.some(c => c.toLowerCase().includes(q))
    const matchCat = categoryFilter === 'all' || i.category === categoryFilter
    return matchSearch && matchCat
  })

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <main className="min-h-screen bg-organa-bg p-8 max-w-6xl mx-auto">

      {/* Header */}
      <div className="mb-7">
        <h1 className="text-2xl font-bold text-organa-text">Integrations</h1>
        <p className="text-organa-text-muted text-sm mt-1">
          Conectá las herramientas que usa tu equipo para ampliar las capacidades de los agentes.
        </p>
      </div>

      {/* Summary strip */}
      <div className="grid grid-cols-4 gap-4 mb-7">
        {([
          { value: summary.connected,   label: 'Conectadas',     sub: 'activas ahora',         color: 'text-organa-success' },
          { value: summary.available,   label: 'Disponibles',    sub: 'listas para conectar',  color: 'text-organa-text' },
          { value: summary.recommended, label: 'Recomendadas',   sub: 'para tus agentes',      color: 'text-organa-accent' },
          { value: summary.coming_soon, label: 'Próximamente',   sub: 'en desarrollo',         color: 'text-organa-text-muted' },
        ] as const).map(({ value, label, sub, color }) => (
          <div key={label} className="bg-white border border-organa-border rounded-2xl p-4 shadow-card">
            <div className={`text-3xl font-bold leading-none ${color}`}>{value}</div>
            <div className="text-organa-text text-sm font-medium mt-1.5">{label}</div>
            <div className="text-organa-text-muted text-[10px] mt-0.5">{sub}</div>
          </div>
        ))}
      </div>

      {/* AI Recommendations */}
      {topRecommendations.length > 0 && (
        <section className="mb-8">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-7 h-7 rounded-full bg-organa-accent flex items-center justify-center flex-shrink-0 text-sm">✨</div>
            <div>
              <h2 className="text-organa-text font-bold">Recommendations for your team</h2>
              <p className="text-organa-text-muted text-xs">Basado en los roles y capacidades de tus {integrations.filter(i => i.recommended_for && i.recommended_for.length > 0).length > 0 ? 'agentes' : 'empleados'}</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {topRecommendations.map(integ => (
              <RecommendationCard
                key={integ.id}
                integration={integ}
                onSelect={() => setSelectedIntegration(integ)}
                onConnect={() => handleConnect(integ)}
              />
            ))}
          </div>
        </section>
      )}

      {/* Marketplace */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-organa-text font-bold">Todas las integraciones</h2>
          <span className="text-organa-text-muted text-xs">
            {integrations.length} disponibles · {summary.connected} conectadas
          </span>
        </div>

        {/* Search + filter */}
        <div className="space-y-3 mb-5">
          <div className="relative max-w-sm">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-organa-text-muted" width="14" height="14" viewBox="0 0 14 14" fill="none">
              <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.4"/>
              <path d="M9.5 9.5l2.5 2.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
            </svg>
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar integraciones…"
              className="w-full pl-8 pr-3 py-2 bg-white border border-organa-border rounded-xl text-sm text-organa-text placeholder-organa-text-muted focus:outline-none focus:border-organa-accent transition-colors"
            />
          </div>
          <CategoryFilter
            selected={categoryFilter}
            onChange={setCategoryFilter}
            categories={categories}
            counts={categoryCounts}
          />
        </div>

        {/* Grid */}
        {filtered.length === 0 ? (
          <div className="bg-white border border-organa-border rounded-2xl p-12 shadow-card text-center">
            <p className="text-organa-text-muted text-sm">No hay integraciones para este filtro.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map(integ => (
              <IntegrationCard
                key={integ.id}
                integration={integ}
                connectedIds={connectedIds}
                onSelect={() => setSelectedIntegration(integ)}
                onConnect={() => handleConnect(integ)}
              />
            ))}
          </div>
        )}
      </section>

      {/* Detail panel */}
      <DetailPanel
        integration={selectedIntegration}
        connectedIds={connectedIds}
        onClose={() => setSelectedIntegration(null)}
        onConnect={handleConnect}
        onDisconnect={handleDisconnect}
      />

      {/* Connect flow modal */}
      <ConnectFlow
        integration={connectingIntegration}
        onClose={() => setConnectingIntegration(null)}
        onConnected={handleConnected}
      />
    </main>
  )
}
