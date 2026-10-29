// Home feed: the student's best matches, ranked by the matching engine.
// Fake listings caught by the scam check are shown separately at the bottom, so students see what was blocked.

import { useMemo, useState } from 'react'
import { useApp } from '../lib/AppContext'
import { buildFeed } from '../lib/matching'
import { opportunities } from '../data/opportunities'
import { Screen } from '../components/Layout'
import OpportunityCard from '../components/OpportunityCard'
import { SafetyBadge } from '../components/Badges'

const FILTERS = ['all', 'onlyEligible', 'remote', 'scholarship', 'internship', 'job']

export default function Feed() {
  const { t, pick, label, profile } = useApp()
  const [filter, setFilter] = useState('all')
  const [showBlocked, setShowBlocked] = useState(false)

  const { matches, blocked } = useMemo(() => buildFeed(opportunities, profile), [profile])

  // Show eligible ones and "almost eligible" ones (only one thing missing).
  // Listings that miss many rules are not useful for this student, so we hide them.
  const relevant = matches.filter((m) => m.eligibility.missing.length <= 1)

  const shown = relevant.filter(({ opp, eligibility }) => {
    if (filter === 'onlyEligible') return eligibility.eligible
    if (filter === 'remote') return opp.remote
    if (filter === 'job') return opp.type === 'job' || opp.type === 'apprenticeship'
    if (filter === 'internship') return opp.type === 'internship' || opp.type === 'fellowship'
    if (filter === 'scholarship') return opp.type === 'scholarship'
    return true
  })

  const eligibleCount = relevant.filter((m) => m.eligibility.eligible).length
  const filterText = (f) => (f === 'all' || f === 'onlyEligible' || f === 'remote' ? t(f) : label('type', f))

  return (
    <Screen title={t('appName')}>
      {/* Greeting */}
      <section className="rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 p-5 text-white shadow">
        <p className="text-indigo-100">
          {t('hello')}, {profile.name} 👋
        </p>
        <h2 className="mt-1 text-xl font-bold">{t('feedTitle')}</h2>
        <p className="mt-1 text-sm text-indigo-100">{t('feedSub', { count: matches.length })}</p>
        <div className="mt-4 flex gap-3 text-center">
          <Stat value={eligibleCount} text={t('eligible')} />
          <Stat value={relevant.length - eligibleCount} text={t('almost')} />
          <Stat value={blocked.length} text={t('scam')} />
        </div>
      </section>

      {/* Filter chips, scroll sideways on small phones */}
      <div className="-mx-4 mt-4 flex gap-2 overflow-x-auto px-4 pb-1">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold ${
              filter === f ? 'bg-indigo-600 text-white' : 'border border-slate-200 bg-white text-slate-600'
            }`}
          >
            {filterText(f)}
          </button>
        ))}
      </div>

      <div className="mt-4 space-y-3">
        {shown.map((item) => (
          <OpportunityCard key={item.opp.id} item={item} />
        ))}
      </div>

      {/* Listings blocked by the scam check */}
      {blocked.length > 0 && (
        <section className="mt-6 rounded-2xl border-2 border-dashed border-red-200 bg-red-50 p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-red-700">🛡️ {t('blockedTitle')}</h3>
              <p className="text-sm text-red-600">{t('blockedSub', { n: blocked.length })}</p>
            </div>
            <button onClick={() => setShowBlocked(!showBlocked)} className="shrink-0 rounded-full bg-white px-3 py-1.5 text-sm font-semibold text-red-700">
              {showBlocked ? t('hideBlocked') : t('showBlocked')}
            </button>
          </div>

          {showBlocked &&
            blocked.map(({ opp, safety }) => (
              <div key={opp.id} className="mt-3 rounded-xl bg-white p-3">
                <SafetyBadge level="scam" />
                <p className="mt-1 font-semibold text-slate-800 line-through decoration-red-400">{pick(opp.title)}</p>
                <ul className="mt-2 space-y-1 text-sm text-red-700">
                  {safety.flags.map((f) => (
                    <li key={f}>✗ {label('scamFlags', f)}</li>
                  ))}
                </ul>
              </div>
            ))}
        </section>
      )}

      <p className="mt-6 text-center text-xs text-slate-400">{t('demoNote')}</p>
    </Screen>
  )
}

function Stat({ value, text }) {
  return (
    <div className="flex-1 rounded-xl bg-white/15 py-2">
      <p className="text-2xl font-extrabold">{value}</p>
      <p className="text-xs text-indigo-100">{text}</p>
    </div>
  )
}
