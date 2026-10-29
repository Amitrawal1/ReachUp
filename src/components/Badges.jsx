// Small coloured labels used on cards and the detail page.

import { useApp } from '../lib/AppContext'
import { daysLeft } from '../lib/matching'

// Green "Verified", yellow "Check carefully" or red "Likely scam"
export function SafetyBadge({ level }) {
  const { t } = useApp()
  const styles = {
    verified: 'bg-emerald-100 text-emerald-700',
    caution: 'bg-amber-100 text-amber-800',
    scam: 'bg-red-100 text-red-700',
  }
  const icons = { verified: '✔', caution: '!', scam: '⚠' }
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${styles[level]}`}>
      {icons[level]} {t(level)}
    </span>
  )
}

// "You are eligible" / "Missing: …" / "Not eligible yet"
export function EligibilityBadge({ eligibility }) {
  const { t, lang, label } = useApp()

  if (eligibility.eligible) {
    return <span className="rounded-full bg-emerald-600 px-2.5 py-1 text-xs font-bold text-white">✅ {t('eligible')}</span>
  }

  if (eligibility.missing.length === 1) {
    return (
      <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-800">
        ⚡ {t('missingOne', { what: shortMissing(eligibility.missing[0], lang, label) })}
      </span>
    )
  }

  return <span className="rounded-full bg-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-600">{t('notEligible')}</span>
}

// Very short name of a missing rule, for small badges
function shortMissing(rule, lang, label) {
  const hi = lang === 'hi'
  const names = {
    age: hi ? 'उम्र' : 'age',
    education: hi ? 'पढ़ाई' : 'education',
    stream: hi ? 'स्ट्रीम' : 'stream',
    gender: hi ? 'सिर्फ़ लड़कियाँ' : 'girls only',
    category: label('category', rule.params.allowed?.[0]),
    income: hi ? 'आय सीमा' : 'income limit',
    marks: `${rule.params.min}% ${hi ? 'नंबर' : 'marks'}`,
    notEmployed: hi ? 'नौकरी नहीं होनी चाहिए' : 'no full-time job',
  }
  return names[rule.key] ?? rule.key
}

// Deadline pill. Turns red when 3 days or less are left.
export function DeadlineBadge({ opp }) {
  const { t } = useApp()
  const left = daysLeft(opp)
  const text = left === 0 ? t('lastDay') : left === 1 ? t('oneDayLeft') : t('daysLeft', { n: left })
  const urgent = left <= 3
  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${urgent ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-600'}`}>
      ⏰ {text}
    </span>
  )
}
