'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { agentStore } from '@/lib/agent-store'
import { NOVA_AGENCY_DEMO, NOVA_COMMERCE_DEMO } from '@/lib/demo-data'
import type { Agent, OrgChartParseResponse } from '@/lib/types'

interface Props {
  onAgentsGenerated: (agents: Agent[], companyName?: string) => void
  isLoading: boolean
}

const TEMPLATES = [
  {
    key: 'agency',
    label: 'Nova Agency',
    subtitle: 'Marketing · 13 agents · 3 trained',
    icon: '🎨',
    demo: NOVA_AGENCY_DEMO,
  },
  {
    key: 'ecommerce',
    label: 'Use Ecommerce Template',
    subtitle: 'Nova Commerce · 5 agents · 3 trained',
    icon: '🛍️',
    demo: NOVA_COMMERCE_DEMO,
  },
]

export default function OrgUpload({ onAgentsGenerated, isLoading }: Props) {
  const [isDragOver, setIsDragOver] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fileName, setFileName] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [loadingTemplate, setLoadingTemplate] = useState<string | null>(null)

  const disabled = isLoading || isProcessing

  const processFile = useCallback(async function processFile(file: File) {
    const allowed = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    if (!allowed.includes(file.type)) {
      setError('Please upload a JPEG, PNG, GIF, or WebP image')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be under 5MB. Try compressing it first.')
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
      if (data.error) setError(data.error)
      else onAgentsGenerated(data.agents)
    } catch {
      setError('Failed to process image. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }, [onAgentsGenerated])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) void processFile(file)
  }, [processFile])

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) void processFile(file)
  }, [processFile])

  function handleLoadTemplate(key: string, demo: typeof NOVA_AGENCY_DEMO) {
    setLoadingTemplate(key)
    setTimeout(() => {
      agentStore.seedDemoCompany(demo)
      onAgentsGenerated(demo.agents, demo.name)
      setLoadingTemplate(null)
    }, 600)
  }

  return (
    <div className="space-y-5">
      {/* Drop zone */}
      <motion.div
        onDragOver={(e) => { e.preventDefault(); setIsDragOver(true) }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
        animate={{
          borderColor: isDragOver ? '#0071E3' : 'rgba(0,0,0,0.12)',
          backgroundColor: isDragOver ? 'rgba(0,113,227,0.04)' : 'rgba(255,255,255,0.7)',
          scale: isDragOver ? 1.01 : 1,
        }}
        transition={{ duration: 0.15 }}
        className={`border-2 border-dashed rounded-2xl p-14 text-center transition-all ${
          disabled ? 'opacity-50 pointer-events-none' : 'cursor-pointer'
        }`}
      >
        <label htmlFor="org-chart-input" className={disabled ? '' : 'cursor-pointer block'}>
          <motion.div
            animate={isProcessing ? { rotate: 360 } : { rotate: 0 }}
            transition={isProcessing ? { duration: 1.5, repeat: Infinity, ease: 'linear' } : {}}
            className="w-14 h-14 mx-auto mb-5 rounded-2xl bg-organa-accent-light flex items-center justify-center"
          >
            {isProcessing ? (
              <svg className="text-organa-accent" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M21 12a9 9 0 1 1-9-9"/>
              </svg>
            ) : (
              <svg className="text-organa-accent" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="17 8 12 3 7 8"/>
                <line x1="12" y1="3" x2="12" y2="15"/>
              </svg>
            )}
          </motion.div>

          <p className="text-organa-text font-semibold text-[15px]">
            {isProcessing ? 'Parsing org chart with AI...' : 'Drop your org chart here'}
          </p>
          <p className="text-organa-text-muted text-sm mt-1.5">
            {fileName ? `Processing: ${fileName}` : 'JPEG, PNG, GIF or WebP · Any size'}
          </p>

          {!disabled && (
            <motion.span
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="inline-block mt-5 px-5 py-2 bg-organa-accent text-white rounded-xl text-sm font-medium shadow-button"
            >
              Choose file
            </motion.span>
          )}
        </label>
        <input
          id="org-chart-input"
          type="file"
          accept="image/jpeg,image/png,image/gif,image/webp"
          onChange={handleFileInput}
          className="hidden"
        />
      </motion.div>

      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="p-3.5 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm flex items-center gap-2.5"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="flex-shrink-0">
              <circle cx="8" cy="8" r="7" stroke="#EF4444" strokeWidth="1.5"/>
              <path d="M8 5v3.5M8 10.5v.5" stroke="#EF4444" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Divider */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-organa-border" />
        <span className="text-organa-text-muted text-xs">or try a demo</span>
        <div className="flex-1 h-px bg-organa-border" />
      </div>

      {/* Templates */}
      <div className="grid grid-cols-2 gap-3">
        {TEMPLATES.map((t, i) => (
          <motion.button
            key={t.key}
            onClick={() => handleLoadTemplate(t.key, t.demo)}
            disabled={disabled || loadingTemplate !== null}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + i * 0.08, duration: 0.4, ease: [0.22,1,0.36,1] }}
            whileHover={{ y: -2, boxShadow: '0 8px 20px rgba(0,0,0,0.08)' }}
            whileTap={{ scale: 0.97 }}
            className="p-4 bg-organa-surface rounded-2xl shadow-card text-left disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="flex items-center gap-2.5 mb-1.5">
              <span className="text-lg">{t.icon}</span>
              {loadingTemplate === t.key ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="w-4 h-4 border-2 border-organa-accent border-t-transparent rounded-full"
                />
              ) : null}
            </div>
            <p className="text-organa-text text-sm font-semibold leading-tight">{t.label}</p>
            <p className="text-organa-text-muted text-xs mt-0.5">{t.subtitle}</p>
          </motion.button>
        ))}
      </div>
    </div>
  )
}
