'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Trash2, Save, UserPlus } from 'lucide-react'
import { agentStore } from '@/lib/agent-store'
import type { Agent } from '@/lib/types'

// ─── Helpers ──────────────────────────────────────────────────────────────────
function slugify(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .trim()
}

function ensureUniqueId(base: string, existing: Agent[]): string {
  const ids = new Set(existing.map(a => a.id))
  if (!ids.has(base)) return base
  let i = 2
  while (ids.has(`${base}-${i}`)) i++
  return `${base}-${i}`
}

// ─── Types ────────────────────────────────────────────────────────────────────
interface OrgEditPanelProps {
  /** null = creating a new agent */
  agent: Agent | null
  allAgents: Agent[]
  onClose: () => void
  onSaved: () => void
}

interface FormState {
  name: string
  role: string
  department: string
  reportsTo: string // empty string = root (no manager)
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function OrgEditPanel({ agent, allAgents, onClose, onSaved }: OrgEditPanelProps) {
  const isNew = agent === null

  const [form, setForm] = useState<FormState>({
    name: agent?.name ?? '',
    role: agent?.role ?? '',
    department: agent?.department ?? '',
    reportsTo: agent?.reportsTo ?? '',
  })
  const [saving, setSaving] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  // Reset form when agent changes
  useEffect(() => {
    setForm({
      name: agent?.name ?? '',
      role: agent?.role ?? '',
      department: agent?.department ?? '',
      reportsTo: agent?.reportsTo ?? '',
    })
    setConfirmDelete(false)
  }, [agent])

  function set(field: keyof FormState, value: string) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  function handleSave() {
    if (!form.name.trim() || !form.role.trim()) return
    setSaving(true)

    if (isNew) {
      const base = slugify(form.name.trim())
      const id = ensureUniqueId(base, allAgents)
      const newAgent: Agent = {
        id,
        name: form.name.trim(),
        role: form.role.trim(),
        department: form.department.trim() || 'Sin departamento',
        reportsTo: form.reportsTo || null,
        readinessScore: 0,
        onboardingComplete: false,
        knowledgeBase: null,
        onboardingMessages: [],
      }
      agentStore.upsertAgent(newAgent)
    } else {
      agentStore.upsertAgent({
        ...agent!,
        name: form.name.trim(),
        role: form.role.trim(),
        department: form.department.trim() || agent!.department,
        reportsTo: form.reportsTo || null,
      })
    }

    setSaving(false)
    onSaved()
  }

  function handleDelete() {
    if (!agent) return
    // Remove agent; promote their reports to their own manager
    const updated = allAgents
      .filter(a => a.id !== agent.id)
      .map(a => a.reportsTo === agent.id ? { ...a, reportsTo: agent.reportsTo } : a)
    agentStore.setAgents(updated)
    onSaved()
  }

  // Managers dropdown: all agents except the agent being edited
  const managerOptions = allAgents.filter(a => a.id !== agent?.id)

  const isValid = form.name.trim().length > 0 && form.role.trim().length > 0

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.15 }}
        className="fixed inset-0 bg-black/20 z-40"
        onClick={onClose}
      />

      {/* Panel */}
      <motion.aside
        initial={{ x: 400 }}
        animate={{ x: 0 }}
        exit={{ x: 400 }}
        transition={{ type: 'spring', damping: 28, stiffness: 300 }}
        className="fixed right-0 top-0 bottom-0 w-96 bg-organa-surface border-l border-organa-border z-50 flex flex-col shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-organa-border">
          <div className="flex items-center gap-2.5">
            <UserPlus size={16} className="text-organa-accent" />
            <h2 className="text-organa-text font-semibold text-sm">
              {isNew ? 'New person' : 'Edit person'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-organa-text-muted hover:text-organa-text transition-colors p-1 rounded-md hover:bg-organa-border/60"
          >
            <X size={16} />
          </button>
        </div>

        {/* Form */}
        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4">
          <Field label="Full name" required>
            <input
              type="text"
              value={form.name}
              onChange={e => set('name', e.target.value)}
              placeholder="e.g. Valentina Torres"
              className="input-base"
            />
          </Field>

          <Field label="Position / Role" required>
            <input
              type="text"
              value={form.role}
              onChange={e => set('role', e.target.value)}
              placeholder="e.g. CEO"
              className="input-base"
            />
          </Field>

          <Field label="Department">
            <input
              type="text"
              value={form.department}
              onChange={e => set('department', e.target.value)}
              placeholder="e.g. General Management"
              className="input-base"
            />
          </Field>

          <Field label="Reports to">
            <select
              value={form.reportsTo}
              onChange={e => set('reportsTo', e.target.value)}
              className="input-base"
            >
              <option value="">(No manager — root level)</option>
              {managerOptions.map(a => (
                <option key={a.id} value={a.id}>
                  {a.name} — {a.role}
                </option>
              ))}
            </select>
          </Field>

          {!isNew && (
            <div className="pt-1">
              <p className="text-organa-text-muted text-xs mb-1">Agent ID</p>
              <code className="text-[11px] text-organa-text-muted bg-organa-border/50 px-2 py-1 rounded font-mono">
                {agent!.id}
              </code>
            </div>
          )}

          {!isNew && (
            <div className="bg-organa-border/30 rounded-lg px-3 py-2.5 flex items-center justify-between">
              <div>
                <p className="text-organa-text text-xs font-medium">Training status</p>
                <p className="text-organa-text-muted text-xs mt-0.5">
                  {agent!.onboardingComplete
                    ? `Trained — ${agent!.readinessScore}% KRS`
                    : 'Not trained yet'}
                </p>
              </div>
              <div className={`w-2.5 h-2.5 rounded-full ${agent!.onboardingComplete ? 'bg-green-500' : 'bg-organa-border'}`} />
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="px-5 py-4 border-t border-organa-border space-y-2.5">
          <button
            onClick={handleSave}
            disabled={!isValid || saving}
            className="w-full flex items-center justify-center gap-2 bg-organa-accent hover:bg-organa-accent/90 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium py-2.5 px-4 rounded-lg transition-colors"
          >
            <Save size={14} />
            {saving ? 'Saving…' : isNew ? 'Create person' : 'Save changes'}
          </button>

          {!isNew && !confirmDelete && (
            <button
              onClick={() => setConfirmDelete(true)}
              className="w-full flex items-center justify-center gap-2 text-red-500 hover:bg-red-50 text-sm font-medium py-2 px-4 rounded-lg transition-colors border border-red-200"
            >
              <Trash2 size={14} />
              Delete person
            </button>
          )}

          {confirmDelete && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 space-y-2">
              <p className="text-red-700 text-xs font-medium">
                Confirm deletion of {agent!.name}?
              </p>
              <p className="text-red-500 text-xs">
                Their direct reports will move up one level in the hierarchy.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={handleDelete}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white text-xs font-medium py-1.5 rounded-md transition-colors"
                >
                  Yes, delete
                </button>
                <button
                  onClick={() => setConfirmDelete(false)}
                  className="flex-1 text-red-500 border border-red-200 text-xs font-medium py-1.5 rounded-md transition-colors hover:bg-red-100"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </motion.aside>
    </>
  )
}

// ─── Field wrapper ────────────────────────────────────────────────────────────
function Field({ label, required, children }: {
  label: string
  required?: boolean
  children: React.ReactNode
}) {
  return (
    <div>
      <label className="block text-organa-text-muted text-xs font-medium mb-1.5">
        {label}{required && <span className="text-organa-accent ml-0.5">*</span>}
      </label>
      {children}
    </div>
  )
}
