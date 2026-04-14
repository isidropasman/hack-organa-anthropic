import type { LearningItem } from '@/lib/mock-data-employee'
import LearningFeedItem from './LearningFeedItem'

interface Props {
  items: LearningItem[]
}

export default function LearningFeed({ items }: Props) {
  return (
    <div className="bg-white border border-organa-border rounded-2xl p-6 shadow-card">
      <div className="mb-6">
        <h2 className="text-base font-semibold text-organa-text">What your Twin learned today</h2>
        <p className="text-xs text-organa-text-muted mt-0.5">
          Each item is a task or decision your twin captured and documented
        </p>
      </div>

      <div>
        {items.map((item, i) => (
          <LearningFeedItem
            key={i}
            item={item}
            isLast={i === items.length - 1}
          />
        ))}
      </div>
    </div>
  )
}
