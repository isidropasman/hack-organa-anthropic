'use client'

import { motion } from 'framer-motion'
import type { Agent } from '@/lib/types'

interface Props {
  agent: Agent
  onClick: () => void
  index?: number
}

const DEPT_COLORS: Record<string, { bg: string; text: string }> = {
  'Dirección General': { bg: '#EFF6FF', text: '#1E40AF' },
  'Fundadores':        { bg: '#EFF6FF', text: '#1E40AF' },
  'Cuentas':           { bg: '#F0FDF4', text: '#166534' },
  'Growth':            { bg: '#F0FDF4', text: '#166534' },
  'Creatividad':       { bg: '#FDF4FF', text: '#7E22CE' },
  'Finanzas':          { bg: '#FFFBEB', text: '#92400E' },
  'Operaciones':       { bg: '#FFF7ED', text: '#C2410C' },
  'Tecnología':        { bg: '#F0F9FF', text: '#0369A1' },
}

function getInitials(name: string): string {
  return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
}

function getAvatarColor(name: string): string {
  const colors = [
    '#0071E3', '#34C759', '#FF9F0A', '#FF375F',
    '#BF5AF2', '#32ADE6', '#FF6961', '#30D158',
  ]
  let hash = 0
  for (const c of name) hash = (hash * 31 + c.charCodeAt(0)) & 0xFFFF
  return colors[hash % colors.length]
}

export default function AgentCard({ agent, onClick, index = 0 }: Props) {
  const avatarColor = getAvatarColor(agent.name)
  const deptStyle = DEPT_COLORS[agent.department] ?? { bg: '#F5F5F7', text: '#6E6E73' }

  return (
    <motion.button
      onClick={onClick}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        delay: index * 0.055,
        duration: 0.45,
        ease: [0.22, 1, 0.36, 1],
      }}
      whileHover={{ y: -4, boxShadow: '0 12px 32px rgba(0,0,0,0.10), 0 2px 6px rgba(0,0,0,0.04)' }}
      whileTap={{ scale: 0.98 }}
      className="w-full text-left p-5 bg-organa-surface rounded-2xl shadow-card transition-shadow duration-200 group"
    >
      {/* Top row: avatar + badge */}
      <div className="flex items-start justify-between mb-4">
        <div className="relative">
          <div
            className="w-11 h-11 rounded-full flex items-center justify-center text-white font-semibold text-sm select-none"
            style={{ backgroundColor: avatarColor }}
          >
            {getInitials(agent.name)}
          </div>
          {agent.onboardingComplete && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: index * 0.055 + 0.3, type: 'spring', stiffness: 300 }}
              className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-organa-success rounded-full border-2 border-white flex items-center justify-center"
            >
              <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                <path d="M1.5 4L3 5.5L6.5 2" stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </motion.div>
          )}
        </div>

        <span
          className="text-xs px-2.5 py-1 rounded-full font-medium"
          style={{ backgroundColor: deptStyle.bg, color: deptStyle.text }}
        >
          {agent.department}
        </span>
      </div>

      {/* Name + role */}
      <div className="mb-4">
        <p className="font-semibold text-organa-text text-[15px] leading-tight">
          {agent.name}
        </p>
        <p className="text-organa-text-secondary text-sm mt-0.5">{agent.role}</p>
      </div>

      {/* Readiness bar */}
      <div className="mb-4">
        <div className="flex justify-between text-xs text-organa-text-muted mb-1.5">
          <span>Readiness</span>
          <span className={agent.onboardingComplete ? 'text-organa-success font-medium' : ''}>
            {agent.readinessScore}%
          </span>
        </div>
        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${agent.readinessScore}%` }}
            transition={{ delay: index * 0.055 + 0.2, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className={`h-full rounded-full ${
              agent.onboardingComplete ? 'bg-organa-success' : 'bg-organa-accent'
            }`}
          />
        </div>
      </div>

      {/* CTA */}
      <div className="flex items-center justify-between">
        <span
          className={`text-xs font-medium transition-colors ${
            agent.onboardingComplete
              ? 'text-organa-accent group-hover:text-organa-accent-hover'
              : 'text-organa-text-secondary group-hover:text-organa-text'
          }`}
        >
          {agent.onboardingComplete ? 'Chat with agent →' : 'Start onboarding →'}
        </span>
        {agent.onboardingComplete ? (
          <span className="text-xs text-organa-success bg-organa-success-light px-2 py-0.5 rounded-full font-medium">
            Trained
          </span>
        ) : (
          <span className="text-xs text-organa-text-muted bg-gray-100 px-2 py-0.5 rounded-full">
            Draft
          </span>
        )}
      </div>
    </motion.button>
  )
}
