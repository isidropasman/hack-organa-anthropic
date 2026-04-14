'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { getCurrentUser } from '@/lib/auth'
import { agentStore } from '@/lib/agent-store'
import { portalStore } from '@/lib/portal-store'
import MarkdownMessage from '@/components/MarkdownMessage'
import type { Automation } from '@/lib/types'

type RecordState = 'idle' | 'requesting' | 'recording' | 'processing' | 'done' | 'sensitive' | 'error'

function captureFrame(video: HTMLVideoElement): string {
  const canvas = document.createElement('canvas')
  const scale = 0.5
  canvas.width = Math.floor(video.videoWidth * scale)
  canvas.height = Math.floor(video.videoHeight * scale)
  const ctx = canvas.getContext('2d')
  if (!ctx || canvas.width === 0 || canvas.height === 0) return ''
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
  return canvas.toDataURL('image/jpeg', 0.75)
}

function formatTime(s: number) {
  return `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`
}

export default function RecordPage() {
  const [state, setState] = useState<RecordState>('idle')
  const [elapsed, setElapsed] = useState(0)
  const [frames, setFrames] = useState<string[]>([])
  const [analysis, setAnalysis] = useState('')
  const [analysisDone, setAnalysisDone] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [automationAdded, setAutomationAdded] = useState(false)
  const [sharedToPortal, setSharedToPortal] = useState(false)
  const [sensitiveApp, setSensitiveApp] = useState('')
  const [agentName, setAgentName] = useState('the employee')
  const [agentRole, setAgentRole] = useState('their role')
  const [agentDept, setAgentDept] = useState('')
  const [agentId, setAgentId] = useState<string | null>(null)

  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const framesRef = useRef<string[]>([])
  const captureRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  // Resolve agent from store
  useEffect(() => {
    const user = getCurrentUser()
    const id = user.agentId ?? null
    let agent = id ? agentStore.getAgent(id) : null
    if (!agent && user.name) {
      agent = agentStore.getAllAgents().find(
        a => a.name.toLowerCase() === user.name.toLowerCase()
      ) ?? null
    }
    if (agent) { setAgentName(agent.name); setAgentRole(agent.role); setAgentId(agent.id); setAgentDept(agent.department) }
    else if (user.name) setAgentName(user.name)
  }, [])

  // Attach stream to video element once it's rendered (state = 'recording')
  useEffect(() => {
    if (state === 'recording' && streamRef.current && videoRef.current) {
      videoRef.current.srcObject = streamRef.current
      videoRef.current.play().catch(() => {})
    }
  }, [state])

  // Cleanup on unmount
  useEffect(() => () => { clearAll(); abortRef.current?.abort() }, []) // eslint-disable-line react-hooks/exhaustive-deps

  function clearAll() {
    streamRef.current?.getTracks().forEach(t => t.stop())
    streamRef.current = null
    if (captureRef.current) clearInterval(captureRef.current)
    if (timerRef.current) clearInterval(timerRef.current)
    captureRef.current = null
    timerRef.current = null
  }

  const startRecording = useCallback(async () => {
    setState('requesting')
    framesRef.current = []
    setFrames([])
    setElapsed(0)
    setAnalysis('')
    setAnalysisDone(false)
    setAutomationAdded(false)
    setErrorMsg('')

    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { frameRate: { ideal: 5 } },
        audio: false,
      })
      streamRef.current = stream
      setState('recording') // video element now renders → useEffect attaches stream

      timerRef.current = setInterval(() => setElapsed(s => s + 1), 1000)

      captureRef.current = setInterval(() => {
        const video = videoRef.current
        if (!video || video.readyState < 2) return
        const frame = captureFrame(video)
        if (!frame) return
        framesRef.current = [...framesRef.current, frame].slice(-6)
        setFrames([...framesRef.current])
      }, 3000)

      stream.getVideoTracks()[0].addEventListener('ended', () => stopRecording())
    } catch (err) {
      const name = (err as Error).name
      if (name === 'NotAllowedError' || name === 'AbortError') {
        setState('idle')
      } else {
        setErrorMsg('Could not access the screen. Check your browser permissions.')
        setState('error')
      }
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const stopRecording = useCallback(() => {
    if (captureRef.current) clearInterval(captureRef.current)
    if (timerRef.current) clearInterval(timerRef.current)

    // Final frame
    const video = videoRef.current
    if (video && video.readyState >= 2) {
      const last = captureFrame(video)
      if (last) framesRef.current = [...framesRef.current, last].slice(-6)
    }
    const captured = [...framesRef.current]
    setFrames(captured)

    clearAll()
    setState('processing')
    analyzeFrames(captured)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  async function analyzeFrames(captured: string[]) {
    if (captured.length === 0) {
      setErrorMsg('No frames captured. Record for at least 5 seconds before stopping.')
      setState('error')
      return
    }
    const ctrl = new AbortController()
    abortRef.current = ctrl
    try {
      const res = await fetch('/api/analyze-recording', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ frames: captured, agentName, agentRole }),
        signal: ctrl.signal,
      })
      if (!res.body) throw new Error('No response from server')

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let buf = ''
      let accumulated = ''  // local accumulator for signal detection

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buf += decoder.decode(value, { stream: true })
        const lines = buf.split('\n')
        buf = lines.pop() ?? ''
        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          try {
            const ev = JSON.parse(line.slice(6))
            if (ev.type === 'text') {
              accumulated += ev.text
              // Detect sensitive content signal — check before showing anything
              if (accumulated.trimStart().startsWith('SENSITIVE_CONTENT')) {
                const match = accumulated.match(/SENSITIVE_CONTENT:\s*(.+)/)
                setSensitiveApp(match?.[1]?.trim() ?? 'sensitive content detected')
                setState('sensitive')
                return
              }
              setAnalysis(accumulated)
              setState('done')
            } else if (ev.type === 'error') throw new Error(ev.message)
          } catch { /* skip */ }
        }
      }
      setAnalysisDone(true)
    } catch (err) {
      if ((err as Error).name === 'AbortError') return
      setErrorMsg(`Analysis error: ${(err as Error).message}`)
      setState('error')
    }
  }

  function extractAutomationName(text: string): string {
    // Try "Proposed automation: X" first, then "Detected task: X"
    const patterns = [
      /\*\*Proposed automation:\*\*\s*(.+)/i,
      /Proposed automation:\s*(.+)/i,
      /\*\*Detected task:\*\*\s*(.+)/i,
      /Detected task:\s*(.+)/i,
    ]
    for (const re of patterns) {
      const m = text.match(re)
      if (m?.[1]) return m[1].replace(/\*\*/g, '').trim()
    }
    return `Recorded task — ${new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}`
  }

  function extractTimeSaved(text: string): number {
    const m = text.match(/Estimated savings?[^:]*:\s*~?(\d+)\s*min/i)
    return m?.[1] ? parseInt(m[1], 10) : 15
  }

  function extractFrequency(text: string): Automation['estimatedFrequency'] {
    if (/daily|every day/i.test(text)) return 'daily'
    if (/weekly|every week/i.test(text)) return 'weekly'
    if (/monthly|every month/i.test(text)) return 'monthly'
    return 'daily'
  }

  function shareToPortal() {
    if (sharedToPortal || !agentId) return
    const name = extractAutomationName(analysis)
    const timeSaved = extractTimeSaved(analysis)
    portalStore.addPost({
      authorId: agentId,
      authorName: agentName,
      authorRole: agentRole,
      authorDept: agentDept,
      content: `I recorded a task and automated "${name}". Saves ~${timeSaved}min/day.`,
      type: 'achievement',
      achievementEmoji: '⚡',
      timestamp: new Date().toISOString(),
    })
    setSharedToPortal(true)
  }

  function addAutomation() {
    if (!agentId || automationAdded) return
    const name = extractAutomationName(analysis)
    const auto: Automation = {
      id: `rec-${Date.now()}`,
      name,
      description: analysis.split('\n').find(l => l.trim() && !l.startsWith('#') && !l.startsWith('**'))?.trim()
        ?? 'Automation proposed by screen recording analysis',
      steps: [],
      status: 'pending_approval',
      source: 'recording',
      createdAt: new Date().toISOString(),
      runsTotal: 0,
      timeSavedMinutes: extractTimeSaved(analysis),
      estimatedFrequency: extractFrequency(analysis),
    }
    agentStore.addAutomation(agentId, auto)
    setAutomationAdded(true)
  }

  function reset() {
    setState('idle')
    setFrames([]); framesRef.current = []
    setElapsed(0); setAnalysis(''); setAnalysisDone(false)
    setAutomationAdded(false); setSharedToPortal(false); setErrorMsg(''); setSensitiveApp('')
  }

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <main className="min-h-screen bg-organa-bg p-8 max-w-3xl mx-auto">

      {/* Header — always visible */}
      <div className="mb-7">
        <h1 className="text-2xl font-bold text-organa-text">Record a task</h1>
        <p className="text-organa-text-muted text-sm mt-1">
          Share your screen while doing a task. Your agent analyzes the process and detects automations.
        </p>
      </div>

      {/* ── IDLE ─────────────────────────────────────────────────────────────── */}
      {state === 'idle' && (
        <div className="space-y-5">
          <div className="grid grid-cols-3 gap-4">
            {[
              { icon: '🔁', title: 'Repetitive tasks', desc: 'You do the same thing every week' },
              { icon: '📋', title: 'Copy and paste', desc: 'Between tools or spreadsheets' },
              { icon: '📊', title: 'Manual reports', desc: 'Data you update by hand' },
            ].map(({ icon, title, desc }) => (
              <div key={title} className="bg-white border border-organa-border rounded-2xl p-5 shadow-card text-center">
                <div className="text-3xl mb-2">{icon}</div>
                <p className="text-organa-text font-semibold text-xs">{title}</p>
                <p className="text-organa-text-muted text-xs mt-1">{desc}</p>
              </div>
            ))}
          </div>

          <div className="bg-white border border-organa-border rounded-2xl p-5 shadow-card">
            <p className="text-organa-text-muted text-xs uppercase tracking-wide mb-4">How it works</p>
            <ol className="space-y-3">
              {[
                { n: '1', t: 'Click "Start recording" and select your screen or window' },
                { n: '2', t: 'Perform the full task once, just as you normally would' },
                { n: '3', t: 'Stop the recording and Claude automatically analyzes the steps' },
              ].map(({ n, t }) => (
                <li key={n} className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-organa-accent text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">{n}</span>
                  <span className="text-organa-text-secondary text-sm">{t}</span>
                </li>
              ))}
            </ol>
          </div>

          <button
            onClick={startRecording}
            className="w-full bg-organa-accent hover:bg-organa-accent-hover text-white rounded-2xl py-4 font-semibold text-base shadow-button transition-colors flex items-center justify-center gap-3"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <rect x="2" y="3" width="16" height="11" rx="2" stroke="white" strokeWidth="1.5"/>
              <path d="M7 17h6M10 14v3" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
              <circle cx="10" cy="8.5" r="2.5" fill="white"/>
            </svg>
            Start recording
          </button>

          <p className="text-center text-organa-text-muted text-xs">+20 points per completed recording</p>
        </div>
      )}

      {/* ── REQUESTING ───────────────────────────────────────────────────────── */}
      {state === 'requesting' && (
        <div className="bg-white border border-organa-border rounded-2xl p-12 shadow-card flex flex-col items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-organa-accent-light flex items-center justify-center">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <rect x="3" y="5" width="26" height="17" rx="2.5" stroke="#0071E3" strokeWidth="2"/>
              <path d="M11 27h10M16 22v5" stroke="#0071E3" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
          <div className="text-center">
            <p className="text-organa-text font-semibold text-base">Select what to share</p>
            <p className="text-organa-text-muted text-sm mt-1.5 max-w-xs">
              Choose a screen, window, or tab in the browser's picker
            </p>
          </div>
          <div className="flex gap-1.5">
            {[0, 1, 2].map(i => (
              <div
                key={i}
                className="w-2 h-2 rounded-full bg-organa-accent"
                style={{ animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite` }}
              />
            ))}
          </div>
        </div>
      )}

      {/* ── RECORDING ────────────────────────────────────────────────────────── */}
      {state === 'recording' && (
        <div className="space-y-4">
          {/* Status bar */}
          <div className="bg-white border border-organa-border rounded-2xl px-5 py-3.5 shadow-card flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500" />
              </span>
              <span className="text-red-600 font-semibold text-sm">Recording</span>
            </div>
            <span className="font-mono font-bold text-organa-text text-xl tabular-nums">{formatTime(elapsed)}</span>
            <div className="flex-1" />
            <div className="flex items-center gap-1.5">
              {frames.map((_, i) => (
                <div key={i} className="w-1.5 h-4 rounded-full bg-organa-accent" style={{ opacity: 0.4 + (i / frames.length) * 0.6 }} />
              ))}
              <span className="text-organa-text-muted text-xs ml-1">{frames.length} frames</span>
            </div>
          </div>

          {/* Live preview */}
          <div className="bg-[#1a1a1a] rounded-2xl overflow-hidden aspect-video shadow-card relative ring-2 ring-red-500/30">
            <video
              ref={videoRef}
              muted
              playsInline
              autoPlay
              className="w-full h-full object-contain"
            />
            {/* Last captured frame overlay — subtle */}
            {frames.length === 0 && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                <svg width="40" height="40" viewBox="0 0 40 40" fill="none" opacity={0.4}>
                  <rect x="4" y="7" width="32" height="21" rx="3" stroke="white" strokeWidth="2"/>
                  <path d="M14 34h12M20 28v6" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                <p className="text-white/40 text-xs">Starting preview…</p>
              </div>
            )}
            {/* Red border pulse */}
            <div className="absolute inset-0 rounded-2xl ring-2 ring-red-500 animate-pulse pointer-events-none" />
          </div>

          {/* Tip */}
          <div className="bg-organa-accent-light border border-organa-accent/20 rounded-xl px-4 py-3 flex items-center gap-2.5">
            <span className="text-organa-accent text-base flex-shrink-0">💡</span>
            <p className="text-organa-accent text-xs">
              Perform the full task from start to finish. The more detailed, the better the analysis.
            </p>
          </div>

          {/* Stop */}
          <button
            onClick={stopRecording}
            className="w-full bg-red-500 hover:bg-red-600 text-white rounded-2xl py-4 font-semibold text-base shadow-button transition-colors flex items-center justify-center gap-3"
          >
            <span className="w-4 h-4 bg-white rounded-sm flex-shrink-0" />
            Stop and analyze
          </button>
        </div>
      )}

      {/* ── PROCESSING ───────────────────────────────────────────────────────── */}
      {state === 'processing' && (
        <div className="bg-white border border-organa-border rounded-2xl p-10 shadow-card flex flex-col items-center gap-5">
          {/* Captured frames strip */}
          {frames.length > 0 && (
            <div className="flex gap-2 w-full overflow-x-auto pb-1">
              {frames.map((f, i) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={i} src={f} alt="" className="h-12 w-auto rounded-lg border border-organa-border flex-shrink-0 opacity-60" />
              ))}
            </div>
          )}
          <div className="w-10 h-10 border-4 border-organa-accent border-t-transparent rounded-full animate-spin" />
          <div className="text-center">
            <p className="text-organa-text font-semibold">Analyzing with AI…</p>
            <p className="text-organa-text-muted text-sm mt-1">
              Claude is identifying the steps and evaluating automation potential
            </p>
          </div>
        </div>
      )}

      {/* ── DONE ─────────────────────────────────────────────────────────────── */}
      {state === 'done' && (
        <div className="space-y-5">
          {/* Frame strip */}
          {frames.length > 0 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {frames.map((f, i) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={i}
                  src={f}
                  alt={`Frame ${i + 1}`}
                  className="h-16 w-auto rounded-xl border border-organa-border flex-shrink-0 object-cover shadow-card"
                />
              ))}
            </div>
          )}

          {/* Analysis card */}
          <div className="bg-white border border-organa-border rounded-2xl p-6 shadow-card">
            <div className="flex items-center gap-2 mb-4 pb-4 border-b border-organa-border">
              <div className="w-8 h-8 rounded-full bg-organa-accent flex items-center justify-center flex-shrink-0">
                <span className="text-white text-sm">🤖</span>
              </div>
              <div>
                <p className="text-organa-text font-semibold text-sm">Recording analysis</p>
                <p className="text-organa-text-muted text-xs">{frames.length} frames analyzed</p>
              </div>
              {!analysisDone && (
                <span className="ml-auto inline-block w-1 h-4 bg-organa-accent animate-pulse rounded-sm" />
              )}
            </div>

            <div className="prose prose-sm max-w-none text-organa-text-secondary">
              <MarkdownMessage content={analysis} />
            </div>
          </div>

          {/* CTAs */}
          {analysisDone && (
            <div className="space-y-2.5">
              <div className="flex gap-3">
                <button
                  onClick={addAutomation}
                  disabled={automationAdded || !agentId}
                  className={`flex-1 py-4 rounded-2xl font-semibold text-sm transition-all shadow-button flex items-center justify-center gap-2 ${
                    automationAdded
                      ? 'bg-organa-success text-white cursor-default'
                      : !agentId
                      ? 'bg-organa-bg text-organa-text-muted cursor-not-allowed border border-organa-border'
                      : 'bg-organa-accent hover:bg-organa-accent-hover text-white hover:shadow-card-hover'
                  }`}
                >
                  {automationAdded ? '✅ Added to automations · +30 pts' : '⚡ Add to my automations'}
                </button>
                <button
                  onClick={reset}
                  className="px-6 py-4 rounded-2xl border border-organa-border bg-white hover:border-organa-accent text-organa-text font-semibold text-sm transition-colors shadow-card whitespace-nowrap"
                >
                  Record another
                </button>
              </div>
              {automationAdded && (
                <button
                  onClick={shareToPortal}
                  disabled={sharedToPortal}
                  className={`w-full py-3 rounded-2xl font-semibold text-sm transition-all border flex items-center justify-center gap-2 ${
                    sharedToPortal
                      ? 'bg-organa-bg text-organa-text-muted border-organa-border cursor-default'
                      : 'bg-white border-organa-accent/50 text-organa-accent hover:bg-organa-accent-light hover:border-organa-accent shadow-card'
                  }`}
                >
                  {sharedToPortal ? '✓ Published to the portal' : '🎉 Share achievement to the portal'}
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── SENSITIVE ────────────────────────────────────────────────────────── */}
      {state === 'sensitive' && (
        <div className="space-y-4">
          <div className="bg-white border border-organa-border rounded-2xl p-7 shadow-card flex flex-col items-center gap-4 text-center">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-3xl">
              🔒
            </div>
            <div>
              <p className="text-organa-text font-semibold text-base">Recording not analyzed</p>
              <p className="text-organa-text-secondary text-sm mt-2 leading-relaxed max-w-sm">
                Sensitive content was detected in the recording
                {sensitiveApp && (
                  <span className="font-medium text-organa-text"> ({sensitiveApp})</span>
                )}
                . For your privacy, we do not process recordings containing personal messaging, banking data, or health information.
              </p>
            </div>
            <div className="bg-organa-bg rounded-xl px-4 py-3 text-xs text-organa-text-muted text-left w-full">
              <p className="font-medium text-organa-text mb-1.5">We do not analyze recordings with:</p>
              <ul className="space-y-1">
                <li>· Personal messaging (WhatsApp, Telegram, etc.)</li>
                <li>· Banking apps or digital wallets</li>
                <li>· Health data or medical records</li>
                <li>· Visible passwords or credentials</li>
              </ul>
            </div>
          </div>
          <button
            onClick={reset}
            className="w-full bg-organa-accent hover:bg-organa-accent-hover text-white rounded-2xl py-4 font-semibold text-sm shadow-button transition-colors"
          >
            Record another task
          </button>
        </div>
      )}

      {/* ── ERROR ────────────────────────────────────────────────────────────── */}
      {state === 'error' && (
        <div className="space-y-4">
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6 shadow-card">
            <p className="text-red-700 font-semibold text-sm mb-1">Something went wrong</p>
            <p className="text-red-600 text-sm">{errorMsg}</p>
          </div>
          <button
            onClick={reset}
            className="w-full bg-organa-accent hover:bg-organa-accent-hover text-white rounded-2xl py-4 font-semibold text-sm shadow-button transition-colors"
          >
            Try again
          </button>
        </div>
      )}

      <style jsx>{`
        @keyframes bounce {
          0%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-6px); }
        }
      `}</style>
    </main>
  )
}
