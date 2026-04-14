import { Suspense } from 'react'
import CivilizationLayout from '@/components/civilization/CivilizationLayout'

export const metadata = { title: 'Civilization — ORGANA' }

export default function CivilizationPage() {
  return (
    <div
      style={{
        background:  '#F8FAFC',
        minHeight:   '100vh',
        padding:     '28px 32px',
        display:     'flex',
        flexDirection: 'column',
      }}
    >
      {/* Page header */}
      <div style={{ marginBottom: 24, flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
          <span
            style={{
              display:        'inline-flex',
              alignItems:     'center',
              justifyContent: 'center',
              width:          32,
              height:         32,
              borderRadius:   8,
              background:     'rgba(79,107,237,0.1)',
              border:         '1px solid rgba(79,107,237,0.2)',
              fontSize:       16,
            }}
          >
            ⬡
          </span>
          <h1 style={{ color: '#1E293B', fontSize: 22, fontWeight: 800, margin: 0, letterSpacing: '-0.01em' }}>
            Agent Civilization Layer
          </h1>
          <span
            style={{
              padding:      '2px 8px',
              borderRadius: 4,
              fontSize:     10,
              fontWeight:   700,
              background:   'rgba(139,92,246,0.1)',
              color:        '#8B5CF6',
              border:       '1px solid rgba(139,92,246,0.2)',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
            }}
          >
            Demo
          </span>
        </div>
        <p style={{ color: '#64748B', fontSize: 13, margin: 0 }}>
          5 interconnected systems: SYNAPSE · NEXUS · SCORE · TRIBUNAL · ACADEMIA
        </p>
      </div>

      {/* Main layout (takes remaining height) */}
      <div style={{ flex: 1, minHeight: 0 }}>
        <Suspense fallback={<p style={{ color: '#64748B' }}>Loading…</p>}>
          <CivilizationLayout />
        </Suspense>
      </div>
    </div>
  )
}
