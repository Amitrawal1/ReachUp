// Short list of other opportunities the student is eligible for.
// Shown when they are not eligible, or were not selected, so they always have a next step.

import { Link } from 'react-router-dom'
import { useApp } from '../lib/AppContext'
import { opportunities } from '../data/opportunities'
import { similarOpportunities } from '../lib/matching'
import { DeadlineBadge } from './Badges'

export default function SimilarList({ opp, title }) {
  const { t, pick, label, profile } = useApp()
  const similar = similarOpportunities(opp, opportunities, profile)
  if (similar.length === 0) return null

  return (
    <div>
      <h3 className="text-sm font-bold text-slate-700">{title ?? t('similarTitle')}</h3>
      <div className="mt-2 space-y-2">
        {similar.map(({ opp: o }) => (
          <Link key={o.id} to={`/opportunity/${o.id}`} className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3">
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-indigo-600 uppercase">{label('type', o.type)}</p>
              <p className="truncate font-semibold text-slate-800">{pick(o.title)}</p>
            </div>
            <DeadlineBadge opp={o} />
          </Link>
        ))}
      </div>
    </div>
  )
}
