import { getEmployeeData } from '@/lib/mock-data-employee'
import TwinHero from '@/components/data/TwinHero'
import AchievementsGrid from '@/components/data/AchievementsGrid'
import LearningFeed from '@/components/data/LearningFeed'
import TeamComparison from '@/components/data/TeamComparison'
import NextSteps from '@/components/data/NextSteps'

interface Props {
  params: { agentId: string }
}

export default function MyTwinPage({ params }: Props) {
  const data = getEmployeeData(params.agentId) ?? getEmployeeData('ops-twin')!

  return (
    <main className="min-h-screen bg-organa-bg p-8">
      {/* Section A — Twin Hero */}
      <div className="mb-6">
        <TwinHero data={data} />
      </div>

      {/* Section B — Achievements */}
      <div className="mb-6">
        <AchievementsGrid achievements={data.achievements} />
      </div>

      {/* Section C — Learning Feed */}
      <div className="mb-6">
        <LearningFeed items={data.recentLearnings} />
      </div>

      {/* Section D — Team Comparison */}
      <div className="mb-6">
        <TeamComparison data={data.teamComparison} />
      </div>

      {/* Section E — Next Steps */}
      <div className="mb-8">
        <NextSteps steps={data.nextSteps} />
      </div>
    </main>
  )
}
