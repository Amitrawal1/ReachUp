// One opportunity in the feed. Tapping it opens the detail page.

import { Link } from 'react-router-dom'
import { useApp } from '../lib/AppContext'
import { DeadlineBadge, EligibilityBadge, SafetyBadge } from './Badges'

export default function OpportunityCard({ item }) {
  const { t, pick, label } = useApp()
  const { opp, safety, eligibility, score } = item

  return (
    <Link
      to={`/opportunity/${opp.id}`}
      className="block rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition active:scale-[0.99]"
    >
      <div className="flex items-center gap-2 text-xs">
        <span className="font-semibold tracking-wide text-indigo-600 uppercase">{label('type', opp.type)}</span>
        <SafetyBadge level={safety.level} />
        <span className="ml-auto font-bold text-slate-400">
          {score}% {t('match')}
        </span>
      </div>

      <h3 className="mt-2 text-base leading-snug font-bold text-slate-900">{pick(opp.title)}</h3>
      <p className="text-sm text-slate-500">{pick(opp.org)}</p>

      <div className="mt-3 space-y-1 text-sm text-slate-700">
        <p>💰 {pick(opp.stipend)}</p>
        <p>📍 {pick(opp.location)}</p>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <EligibilityBadge eligibility={eligibility} />
        <DeadlineBadge opp={opp} />
      </div>
    </Link>
  )
}
