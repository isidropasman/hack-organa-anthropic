import type { NextStep } from '@/lib/mock-data-employee'

interface Props {
  steps: NextStep[]
}

export default function NextSteps({ steps }: Props) {
  return (
    <div className="bg-white border border-organa-border rounded-2xl p-6 shadow-card">
      <div className="mb-5">
        <h2 className="text-base font-semibold text-organa-text">Next steps</h2>
        <p className="text-xs text-organa-text-muted mt-0.5">
          Actions to help your twin keep growing
        </p>
      </div>

      <div className="space-y-3">
        {steps.map((step, i) => (
          <div
            key={i}
            className="flex items-start gap-4 p-4 bg-organa-bg rounded-2xl border border-organa-border hover:border-organa-border-strong hover:bg-organa-surface-secondary transition-colors"
          >
            <span className="text-2xl flex-shrink-0 mt-0.5">{step.icon}</span>

            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-organa-text">{step.action}</p>
              <p className="text-xs text-organa-text-muted mt-1 leading-relaxed">{step.reason}</p>
            </div>

            <div className="flex-shrink-0">
              <span className="text-xs font-medium text-organa-accent bg-organa-accent-light px-2.5 py-1 rounded-lg whitespace-nowrap">
                {step.impact}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
