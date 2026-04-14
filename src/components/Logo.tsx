'use client'

// ─── ORGANA Logo ──────────────────────────────────────────────────────────────
// Usage:
//   <Logo />                   full (icon + wordmark), md
//   <Logo size="lg" />         large hero version
//   <Logo size="sm" />         compact sidebar version
//   <Logo variant="icon" />    icon only (no text)

type Size = 'sm' | 'md' | 'lg'
type Variant = 'full' | 'icon'

interface Props {
  size?: Size
  variant?: Variant
  className?: string
}

const config = {
  sm: { box: 32, radius: 9,  svg: 16, text: '16px', gap: 8,  tracking: '-0.025em' },
  md: { box: 38, radius: 11, svg: 19, text: '19px', gap: 10, tracking: '-0.03em'  },
  lg: { box: 44, radius: 13, svg: 22, text: '24px', gap: 12, tracking: '-0.03em'  },
}

export default function Logo({ size = 'md', variant = 'full', className = '' }: Props) {
  const c = config[size]

  return (
    <div
      className={`inline-flex items-center ${className}`}
      style={{ gap: c.gap }}
    >
      {/* ── Icon mark ── */}
      <div
        style={{
          width:  c.box,
          height: c.box,
          borderRadius: c.radius,
          background: 'linear-gradient(145deg, #1a8aff 0%, #0058c8 100%)',
          boxShadow: '0 2px 10px rgba(0,113,227,0.30), inset 0 1px 0 rgba(255,255,255,0.15)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <svg
          width={c.svg}
          height={c.svg}
          viewBox="0 0 24 24"
          fill="none"
        >
          {/* Root node */}
          <circle cx="12" cy="5.5" r="3" fill="white" />
          {/* Left child */}
          <circle cx="5"  cy="19"  r="2.4" fill="white" opacity="0.72" />
          {/* Right child */}
          <circle cx="19" cy="19"  r="2.4" fill="white" opacity="0.72" />
          {/* Left connector */}
          <line
            x1="12" y1="8.5"
            x2="5"  y2="16.6"
            stroke="white" strokeWidth="1.4" strokeLinecap="round" opacity="0.55"
          />
          {/* Right connector */}
          <line
            x1="12" y1="8.5"
            x2="19" y2="16.6"
            stroke="white" strokeWidth="1.4" strokeLinecap="round" opacity="0.55"
          />
        </svg>
      </div>

      {/* ── Wordmark ── */}
      {variant === 'full' && (
        <span
          style={{
            fontSize:      c.text,
            fontWeight:    700,
            letterSpacing: c.tracking,
            color:         '#1d1d1f',
            lineHeight:    1,
            userSelect:    'none',
          }}
        >
          ORGANA
        </span>
      )}
    </div>
  )
}
