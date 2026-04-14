'use client'

// src/components/OrgUpload.tsx
// Drag-and-drop org chart image uploader
// Converts image to base64 → calls POST /api/parse-org → returns Agent[] to parent

import { useState, useCallback } from 'react'
import { agentStore } from '@/lib/agent-store'
import { NOVA_AGENCY_DEMO, NOVA_COMMERCE_DEMO } from '../../tools/scripts/seed-demo'
import type { Agent, OrgChartParseResponse } from '@/lib/types'

interface Props {
  onAgentsGenerated: (agents: Agent[], companyName?: string) => void
  isLoading: boolean
}

export default function OrgUpload({ onAgentsGenerated, isLoading }: Props) {
  const [isDragOver, setIsDragOver] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fileName, setFileName] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  const disabled = isLoading || isProcessing

  async function processFile(file: File) {
    const allowed = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    if (!allowed.includes(file.type)) {
      setError('Please upload a JPEG, PNG, GIF, or WebP image')
      return
    }

    setError(null)
    setFileName(file.name)
    setIsProcessing(true)

    try {
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result as string)
        reader.onerror = reject
        reader.readAsDataURL(file)
      })
      const imageBase64 = base64.split(',')[1]

      const res = await fetch('/api/parse-org', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64, mediaType: file.type }),
      })

      const data: OrgChartParseResponse = await res.json()

      if (data.error) {
        setError(data.error)
      } else {
        onAgentsGenerated(data.agents)
      }
    } catch {
      setError('Failed to process image. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) processFile(file)
  }, [])

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) processFile(file)
  }, [])

  function handleLoadNovaAgency() {
    agentStore.seedDemoCompany(NOVA_AGENCY_DEMO)
    onAgentsGenerated(NOVA_AGENCY_DEMO.agents, NOVA_AGENCY_DEMO.name)
  }

  function handleLoadNovaCommerce() {
    agentStore.seedDemoCompany(NOVA_COMMERCE_DEMO)
    onAgentsGenerated(NOVA_COMMERCE_DEMO.agents, NOVA_COMMERCE_DEMO.name)
  }

  const isActive = disabled

  return (
    <div className="space-y-6">
      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragOver(true) }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
        className={`
          border-2 border-dashed rounded-xl p-16 text-center transition-all
          ${isDragOver
            ? 'border-organa-accent bg-organa-accent/10'
            : 'border-organa-border hover:border-organa-muted'
          }
          ${isActive ? 'opacity-50 pointer-events-none' : 'cursor-pointer'}
        `}
      >
        <label htmlFor="org-chart-input" className={`block ${isActive ? '' : 'cursor-pointer'}`}>
          {/* Upload icon */}
          <svg
            className="mx-auto mb-4 text-organa-text-muted"
            width="40"
            height="40"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>

          <p className="text-organa-text font-medium">
            {isProcessing ? 'Parsing org chart...' : 'Drop your org chart here'}
          </p>
          <p className="text-organa-text-muted text-sm mt-2">
            {fileName ? `Selected: ${fileName}` : 'JPEG, PNG, GIF, or WebP · Any size'}
          </p>
          {!isActive && (
            <span className="inline-block mt-4 px-4 py-2 bg-organa-accent hover:bg-organa-accent-hover rounded-lg text-sm font-medium transition-colors text-white">
              Choose file
            </span>
          )}
        </label>
        <input
          id="org-chart-input"
          type="file"
          accept="image/jpeg,image/png,image/gif,image/webp"
          onChange={handleFileInput}
          className="hidden"
        />
      </div>

      {error && (
        <div className="p-4 bg-red-900/20 border border-red-800 rounded-lg text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Demo templates */}
      <div>
        <p className="text-organa-text-muted text-xs text-center mb-3">
          — or load a demo template —
        </p>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={handleLoadNovaAgency}
            disabled={disabled}
            className="p-4 bg-organa-surface border border-organa-border hover:border-organa-muted rounded-xl text-left transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
          >
            <p className="text-organa-text text-sm font-medium group-hover:text-white transition-colors">
              Load Nova Agency
            </p>
            <p className="text-organa-text-muted text-xs mt-1">
              Marketing agency · 13 agents · 3 trained
            </p>
          </button>
          <button
            onClick={handleLoadNovaCommerce}
            disabled={disabled}
            className="p-4 bg-organa-surface border border-organa-border hover:border-organa-muted rounded-xl text-left transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
          >
            <p className="text-organa-text text-sm font-medium group-hover:text-white transition-colors">
              Use Ecommerce Template
            </p>
            <p className="text-organa-text-muted text-xs mt-1">
              Nova Commerce · 5 agents · 3 trained
            </p>
          </button>
        </div>
      </div>
    </div>
  )
}
