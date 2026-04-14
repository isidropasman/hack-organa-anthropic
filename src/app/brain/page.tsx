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
    // Capture filename synchronously before the async gap
    setDocs(prev => {
      const filename = prev.find(d => d.id === id)?.filename ?? 'Documento'
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

        // Add node to the graph
        const { node, links: newLinks } = buildUploadedDocNode(id, filename, 'ceo')
        setGraphNodes(cur => [...cur, node])
        setGraphLinks(cur => [...cur, ...newLinks])

        showToast(`Documento procesado — ${newLinks.length} nuevas conexiones detectadas`)
      }, 2000)

      return updated
    })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleDelete = useCallback((id: string) => {
    // Remove from doc list
    setDocs(prev => {
      const updated = prev.filter(d => d.id !== id)
      saveDocs(updated)
      return updated
    })

    // Remove graph node and all its links.
    // User-uploaded nodes follow the pattern doc-upload-{id}.
    const nodeId = `doc-upload-${id}`
    setGraphNodes(prev => prev.filter(n => n.id !== nodeId))
    setGraphLinks(prev =>
      prev.filter(l => l.source !== nodeId && l.target !== nodeId),
    )

    // Deselect if the deleted node was selected
    setSelectedNode(cur => (cur?.id === nodeId ? null : cur))

    showToast('Documento eliminado — la red se actualizó')
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // ─────────────────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col" style={{ background: '#080810', minHeight: '100vh' }}>

      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div
        className="px-8 pt-7 pb-5 flex-shrink-0"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
      >
        <div className="flex items-start justify-between gap-6 flex-wrap">
          <div>
            <div className="flex items-center gap-3 mb-1.5">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: 'rgba(79,107,237,0.15)', border: '1px solid rgba(79,107,237,0.3)' }}
              >
                <Network size={16} style={{ color: '#4F6BED' }} />
              </div>
              <h1 className="text-white text-xl font-bold tracking-tight">
                Cerebro Organizacional
              </h1>
            </div>
            <p className="text-slate-500 text-sm">
              Red neuronal de conocimiento de Nova Store
            </p>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-5 flex-wrap">
            <Stat value={stats.persons}   label="roles"                color="#4F6BED" />
            <Stat value={stats.tools}     label="herramientas"         color="#F59E0B" />
            <Stat value={stats.decisions} label="decisiones clave"     color="#EF4444" />
            <Stat value={stats.knowledge} label="conocimientos tácitos" color="#8B5CF6" />
            <Stat value={stats.documents} label="documentos"           color="#06B6D4" />
            <Stat value={stats.links}     label="conexiones"           color="#94A3B8" />
          </div>
        </div>

        <div className="mt-4">
          <BrainLegend />
        </div>
      </div>

      {/* ── Graph area ──────────────────────────────────────────────────────── */}
      <div className="flex min-h-0 gap-4 p-4" style={{ height: 'calc(100vh - 196px)' }}>
        <div className="flex-1 min-h-0 min-w-0 relative">
          <BrainGraph
            nodes={graphNodes}
            links={graphLinks}
            selectedNodeId={selectedNode?.id ?? null}
            onNodeClick={setSelectedNode}
          />
        </div>

        {selectedNode && (
          <div
            className="flex-shrink-0 self-start mt-2"
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

      {/* ── Documents section ───────────────────────────────────────────────── */}
      <div
        className="px-8 py-6"
        style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
      >
        <div className="flex items-center gap-3 mb-5">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: 'rgba(79,107,237,0.12)', border: '1px solid rgba(79,107,237,0.25)' }}
          >
            <FileStack size={13} style={{ color: '#4F6BED' }} />
          </div>
          <div>
            <h2 className="text-white text-sm font-semibold">Documentos del cerebro</h2>
            <p className="text-slate-600 text-xs">
              Subí manuales, SOPs y guías para enriquecer el conocimiento organizacional
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
