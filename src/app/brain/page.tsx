'use client'

import { useState, useMemo, useCallback, useEffect, useRef } from 'react'
import { Network, FileStack } from 'lucide-react'
import {
  BRAIN_GRAPH_DATA,
  buildUploadedDocNode,
  type GraphNode,
  type GraphLink,
} from '@/lib/brain-graph'
import {
  loadDocs,
  saveDocs,
  getMockExtractedItems,
  formatFileSize,
  ACCEPTED_EXTENSIONS,
  type BrainDoc,
} from '@/lib/brain-docs'
import BrainGraph     from '@/components/data/BrainGraph'
import BrainLegend    from '@/components/data/BrainLegend'
import BrainNodeDetail from '@/components/data/BrainNodeDetail'
import BrainUpload    from '@/components/data/BrainUpload'
import BrainChat      from '@/components/data/BrainChat'
import BrainChatButton from '@/components/data/BrainChatButton'
import DocCompleteness from '@/components/data/DocCompleteness'
import Toast          from '@/components/data/Toast'

// ─── Types ────────────────────────────────────────────────────────────────────

interface ToastState {
  id:      number
  message: string
  type:    'success' | 'error' | 'info'
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function BrainPage() {
  // ── Graph state ──────────────────────────────────────────────────────────────
  const [graphNodes, setGraphNodes] = useState<GraphNode[]>(BRAIN_GRAPH_DATA.nodes)
  const [graphLinks, setGraphLinks] = useState<GraphLink[]>(BRAIN_GRAPH_DATA.links)

  // ── Doc state (source of truth for the upload panel) ─────────────────────────
  const [docs, setDocs] = useState<BrainDoc[]>([])
  useEffect(() => { setDocs(loadDocs()) }, [])

  // ── UI state ─────────────────────────────────────────────────────────────────
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null)
  const [chatOpen,     setChatOpen]     = useState(false)
  const [toast,        setToast]        = useState<ToastState | null>(null)
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  function showToast(message: string, type: ToastState['type'] = 'success') {
    if (toastTimer.current) clearTimeout(toastTimer.current)
    setToast({ id: Date.now(), message, type })
    toastTimer.current = setTimeout(() => setToast(null), 3000)
  }

  // ── Stats ─────────────────────────────────────────────────────────────────────
  const stats = useMemo(() => ({
    persons:   graphNodes.filter(n => n.type === 'person').length,
    tools:     graphNodes.filter(n => n.type === 'tool').length,
    decisions: graphNodes.filter(n => n.type === 'decision').length,
    knowledge: graphNodes.filter(n => n.type === 'knowledge').length,
    documents: graphNodes.filter(n => n.type === 'document').length,
    links:     graphLinks.length,
  }), [graphNodes, graphLinks])

  // ── Doc handlers ──────────────────────────────────────────────────────────────

  const handleAddFiles = useCallback((files: FileList | null) => {
    if (!files || files.length === 0) return
    const newDocs: BrainDoc[] = []
    for (const file of Array.from(files)) {
      const ext = '.' + (file.name.split('.').pop()?.toLowerCase() ?? '')
      if (!ACCEPTED_EXTENSIONS.includes(ext)) continue
      newDocs.push({
        id:         `doc-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        filename:   file.name,
        uploadedAt: new Date().toISOString(),
        size:       formatFileSize(file.size),
        status:     'pending',
      })
    }
    if (newDocs.length === 0) return
    setDocs(prev => {
      const updated = [...newDocs, ...prev]
      saveDocs(updated)
      return updated
    })
  }, [])

  const handleProcess = useCallback((id: string) => {
    setDocs(prev => {
      const filename = prev.find(d => d.id === id)?.filename ?? 'Document'
      const updated  = prev.map(d => d.id === id ? { ...d, status: 'processing' as const } : d)
      saveDocs(updated)

      setTimeout(() => {
        const extracted = getMockExtractedItems()
        setDocs(cur => {
          const next = cur.map(d =>
            d.id === id
              ? { ...d, status: 'processed' as const, extractedItems: extracted }
              : d,
          )
          saveDocs(next)
          return next
        })

        const { node, links: newLinks } = buildUploadedDocNode(id, filename, 'ceo')
        setGraphNodes(cur => [...cur, node])
        setGraphLinks(cur => [...cur, ...newLinks])

        showToast(`Document processed — ${newLinks.length} new connections detected`)
      }, 2000)

      return updated
    })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleDelete = useCallback((id: string) => {
    setDocs(prev => {
      const updated = prev.filter(d => d.id !== id)
      saveDocs(updated)
      return updated
    })

    const nodeId = `doc-upload-${id}`
    setGraphNodes(prev => prev.filter(n => n.id !== nodeId))
    setGraphLinks(prev =>
      prev.filter(l => l.source !== nodeId && l.target !== nodeId),
    )

    setSelectedNode(cur => (cur?.id === nodeId ? null : cur))

    showToast('Document deleted — the network was updated')
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // ─────────────────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col bg-slate-50 min-h-screen">

      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div className="px-8 pt-7 pb-5 flex-shrink-0 bg-white border-b border-slate-200">
        <div className="flex items-start justify-between gap-6 flex-wrap">
          <div>
            <div className="flex items-center gap-3 mb-1.5">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-blue-50 border border-blue-200">
                <Network size={16} className="text-organa-accent" />
              </div>
              <h1 className="text-organa-text text-xl font-bold tracking-tight">
                Organizational Brain
              </h1>
            </div>
            <p className="text-organa-text-muted text-sm">
              Knowledge Neural Network — Nova Agency
            </p>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-5 flex-wrap">
            <Stat value={stats.persons}   label="roles"           color="#4F6BED" />
            <Stat value={stats.tools}     label="tools"           color="#F59E0B" />
            <Stat value={stats.decisions} label="key decisions"   color="#EF4444" />
            <Stat value={stats.knowledge} label="tacit knowledge" color="#8B5CF6" />
            <Stat value={stats.documents} label="documents"       color="#06B6D4" />
            <Stat value={stats.links}     label="connections"     color="#64748B" />
          </div>
        </div>

        <div className="mt-4">
          <BrainLegend />
        </div>
      </div>

      {/* ── Graph area — DARK BACKGROUND intentional for node visibility ────── */}
      <div
        className="mx-0 rounded-xl overflow-hidden"
        style={{ background: '#0F172A' }}
      >
        <div className="flex items-start gap-4 p-4">
          <div className="flex-1 min-w-0">
            <BrainGraph
              nodes={graphNodes}
              links={graphLinks}
              selectedNodeId={selectedNode?.id ?? null}
              onNodeClick={setSelectedNode}
            />
          </div>

          {selectedNode && (
            <div
              className="flex-shrink-0 mt-2"
              style={{ animation: 'slideInRight 0.2s ease-out' }}
            >
              <BrainNodeDetail
                node={selectedNode}
                nodes={graphNodes}
                links={graphLinks}
                onClose={() => setSelectedNode(null)}
              />
            </div>
          )}
        </div>
      </div>

      {/* ── Documents section ───────────────────────────────────────────────── */}
      <div className="px-8 py-6 bg-white border-t border-slate-200">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-blue-50 border border-blue-200">
            <FileStack size={13} className="text-organa-accent" />
          </div>
          <div>
            <h2 className="text-organa-text text-sm font-semibold">Brain Documents</h2>
            <p className="text-organa-text-muted text-xs">
              Upload manuals, SOPs and guides to enrich organizational knowledge
            </p>
          </div>
        </div>

        <div style={{ maxWidth: '760px' }}>
          <BrainUpload
            docs={docs}
            onAddFiles={handleAddFiles}
            onProcess={handleProcess}
            onDelete={handleDelete}
          />
        </div>
      </div>

      {/* ── Doc completeness analysis ────────────────────────────────────────── */}
      <DocCompleteness />

      {/* ── Floating chat ───────────────────────────────────────────────────── */}
      {!chatOpen && <BrainChatButton onClick={() => setChatOpen(true)} />}
      {chatOpen  && <BrainChat onClose={() => setChatOpen(false)} />}

      {/* ── Toast ────────────────────────────────────────────────────────────── */}
      {toast && <Toast key={toast.id} message={toast.message} type={toast.type} />}

      <style>{`
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(20px); }
          to   { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </div>
  )
}

function Stat({ value, label, color }: { value: number; label: string; color: string }) {
  return (
    <div className="flex items-center gap-1.5 text-sm">
      <span className="font-bold" style={{ color }}>{value}</span>
      <span className="text-slate-500">{label}</span>
    </div>
  )
}
