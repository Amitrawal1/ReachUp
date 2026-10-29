// "My list": every saved opportunity with its application status, document progress
// and deadline. Students update the status as they move forward.

import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useApp } from '../lib/AppContext'
import { opportunities } from '../data/opportunities'
import { daysLeft } from '../lib/matching'
import { formatDate } from '../lib/format'
import { askPermission, dueSoon, notificationState, notify } from '../lib/reminders'
import { Screen } from '../components/Layout'
import { DeadlineBadge } from '../components/Badges'
import SimilarList from '../components/SimilarList'

const STATUSES = ['saved', 'applied', 'interview', 'selected', 'notSelected']
const STATUS_KEY = {
  saved: 'statusSaved',
  applied: 'statusApplied',
  interview: 'statusInterview',
  selected: 'statusSelected',
  notSelected: 'statusNotSelected',
}
const STATUS_STYLE = {
  saved: 'bg-slate-100 text-slate-700',
  applied: 'bg-indigo-100 text-indigo-700',
  interview: 'bg-amber-100 text-amber-800',
  selected: 'bg-emerald-100 text-emerald-700',
  notSelected: 'bg-red-100 text-red-700',
}

export default function MyList() {
  const { t, saved } = useApp()
  const [permission, setPermission] = useState(notificationState())

  // Saved opportunities, closest deadline first
  const items = opportunities.filter((o) => saved[o.id]).sort((a, b) => a.deadline - b.deadline)
  const soon = dueSoon(saved, opportunities, 7)

  const turnOnReminders = async () => {
    const result = await askPermission()
    setPermission(result)
    if (result === 'granted') notify('ReachUp', t('remindTest'))
  }

  return (
    <Screen title={t('myList')}>
      <ReminderBanner permission={permission} onEnable={turnOnReminders} />

      {items.length === 0 && (
        <div className="mt-10 text-center">
          <p className="text-5xl">📌</p>
          <p className="mt-3 text-slate-500">{t('myListEmpty')}</p>
          <Link to="/feed" className="mt-4 inline-block rounded-xl bg-indigo-600 px-5 py-3 font-bold text-white">
            {t('navHome')}
          </Link>
        </div>
      )}

      {/* Not applied yet and closing within a week */}
      {soon.length > 0 && (
        <section className="mt-4 rounded-2xl bg-red-50 p-4">
          <h2 className="font-bold text-red-700">⏰ {t('dueSoon')}</h2>
          <ul className="mt-2 space-y-1">
            {soon.map((o) => (
              <li key={o.id}>
                <SoonRow opp={o} />
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="mt-4 space-y-3">
        {items.map((opp) => (
          <SavedCard key={opp.id} opp={opp} />
        ))}
      </div>
    </Screen>
  )
}

function SoonRow({ opp }) {
  const { pick, t } = useApp()
  const left = daysLeft(opp)
  return (
    <Link to={`/opportunity/${opp.id}`} className="flex justify-between gap-2 text-sm text-red-800">
      <span className="truncate">{pick(opp.title)}</span>
      <span className="shrink-0 font-bold">{left === 0 ? t('lastDay') : t('daysLeft', { n: left })}</span>
    </Link>
  )
}

function ReminderBanner({ permission, onEnable }) {
  const { t } = useApp()
  if (permission === 'granted') return <p className="rounded-xl bg-emerald-50 p-3 text-sm font-semibold text-emerald-700">🔔 {t('remindersEnabled')}</p>
  if (permission === 'denied') return <p className="rounded-xl bg-amber-50 p-3 text-sm text-amber-800">🔕 {t('remindersBlocked')}</p>
  if (permission === 'unsupported') return <p className="rounded-xl bg-slate-100 p-3 text-sm text-slate-600">{t('remindersUnsupported')}</p>
  return (
    <button onClick={onEnable} className="w-full rounded-xl bg-indigo-600 p-3 font-bold text-white">
      🔔 {t('remindersOn')}
    </button>
  )
}

function SavedCard({ opp }) {
  const { t, lang, pick, label, saved, updateSaved, removeSaved, showToast } = useApp()
  const entry = saved[opp.id]
  const docsDone = entry.docs?.length ?? 0

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="flex items-start justify-between gap-2">
        <Link to={`/opportunity/${opp.id}`} className="min-w-0">
          <p className="text-xs font-semibold text-indigo-600 uppercase">{label('type', opp.type)}</p>
          <p className="font-bold text-slate-900">{pick(opp.title)}</p>
          <p className="text-xs text-slate-500">
            {t('deadline')}: {formatDate(opp.deadline, lang)}
          </p>
        </Link>
        <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-bold ${STATUS_STYLE[entry.status]}`}>{t(STATUS_KEY[entry.status])}</span>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <DeadlineBadge opp={opp} />
        <span className="text-xs text-slate-500">📄 {t('docsReady', { done: docsDone, total: opp.docs.length })}</span>
      </div>

      {/* Document progress bar */}
      <div className="mt-2 h-1.5 rounded-full bg-slate-100">
        <div className="h-1.5 rounded-full bg-emerald-500" style={{ width: `${(docsDone / opp.docs.length) * 100}%` }} />
      </div>

      {/* Status buttons: the student taps where they are now */}
      <p className="mt-4 text-xs font-semibold text-slate-500">{t('updateStatus')}</p>
      <div className="mt-1.5 flex flex-wrap gap-1.5">
        {STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => updateSaved(opp.id, { status: s })}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
              entry.status === s ? STATUS_STYLE[s] + ' ring-2 ring-current' : 'border border-slate-200 text-slate-500'
            }`}
          >
            {t(STATUS_KEY[s])}
          </button>
        ))}
      </div>

      {/* Not selected: encourage and suggest what to try next */}
      {entry.status === 'notSelected' && (
        <div className="mt-4 rounded-xl bg-amber-50 p-3">
          <SimilarList opp={opp} title={`💪 ${t('notSelectedTip')}`} />
        </div>
      )}

      <button
        onClick={() => {
          removeSaved(opp.id)
          showToast(t('removedToast'))
        }}
        className="mt-3 text-xs font-semibold text-slate-400"
      >
        {t('remove')}
      </button>
    </div>
  )
}
