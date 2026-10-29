// Opportunity detail page: explains the opportunity in simple words,
// shows the student's eligibility, a document checklist and the steps to apply.

import { useEffect, useLayoutEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useApp } from '../lib/AppContext'
import { getOpportunity, opportunities } from '../data/opportunities'
import { checkEligibility, daysLeft, whyItSuits } from '../lib/matching'
import { scamCheck } from '../lib/scamCheck'
import { ruleText, fixTip } from '../i18n/strings'
import { formatDate } from '../lib/format'
import { askPermission, notificationState, sendDueReminders, REMIND_DAYS } from '../lib/reminders'
import { Screen } from '../components/Layout'
import { DeadlineBadge, EligibilityBadge, SafetyBadge } from '../components/Badges'
import SimilarList from '../components/SimilarList'

export default function Detail() {
  const { id } = useParams()
  const { t, lang, pick, label, profile, saved, updateSaved, removeSaved, showToast } = useApp()
  const opp = getOpportunity(id)
  const [speaking, setSpeaking] = useState(false)

  // Stop reading aloud when leaving the page
  useEffect(() => () => window.speechSynthesis?.cancel(), [])

  // Page opens at the top, not where the feed was scrolled.
  // useLayoutEffect runs before the screen is drawn, so there is no jump.
  // (Curly braces so the browser's return value is not passed to React.)
  useLayoutEffect(() => {
    window.scrollTo(0, 0)
  }, [id])

  if (!opp) {
    return (
      <Screen title={t('appName')} back="/feed">
        <p className="text-slate-600">{t('notFound')}</p>
      </Screen>
    )
  }

  const safety = scamCheck(opp)
  const eligibility = checkEligibility(opp, profile)
  const reasons = whyItSuits(opp, profile, eligibility)
  const entry = saved[opp.id]
  const docsDone = entry?.docs ?? []
  const isScam = safety.level === 'scam'

  const toggleSave = async () => {
    if (entry) {
      removeSaved(opp.id)
      showToast(t('removedToast'))
      return
    }
    updateSaved(opp.id, { status: 'saved' })
    showToast(t('reminderSet', { n: REMIND_DAYS }))

    // Ask for notification permission the first time a student saves something
    if (notificationState() === 'default') await askPermission()
    // If this one already closes soon, remind right away
    sendDueReminders({ ...saved, [opp.id]: { status: 'saved' } }, opportunities, (o) => ({
      title: t('remindTitle', { title: pick(o.title), n: daysLeft(o) }),
      body: t('remindBody'),
    }))
  }

  // Ticking a document also saves the opportunity, so progress is not lost
  const toggleDoc = (doc) => {
    const docs = docsDone.includes(doc) ? docsDone.filter((d) => d !== doc) : [...docsDone, doc]
    updateSaved(opp.id, { docs })
  }

  const applyWithProfile = () => {
    updateSaved(opp.id, { status: 'applied' })
    showToast(t('appliedToast'))
  }

  const applyOfficial = () => {
    window.open(opp.source.url, '_blank', 'noopener')
    // Keep it in the list so the student can mark it applied later
    if (!entry) updateSaved(opp.id, { status: 'saved' })
  }

  // Read the main parts out loud for students who prefer listening
  const readAloud = () => {
    const synth = window.speechSynthesis
    if (speaking) {
      synth.cancel()
      return setSpeaking(false)
    }
    const text = [pick(opp.title), pick(opp.summary), t('howToApply'), ...pick(opp.steps)].join('. ')
    const utter = new SpeechSynthesisUtterance(text)
    utter.lang = lang === 'hi' ? 'hi-IN' : 'en-IN'
    utter.rate = 0.95
    utter.onend = () => setSpeaking(false)
    setSpeaking(true)
    synth.speak(utter)
  }

  const shareText = `${pick(opp.title)}\n${pick(opp.stipend)}\n${t('deadline')}: ${formatDate(opp.deadline, lang)}\n— ReachUp`
  const sourceLabel = { government: 'sourceGovernment', private: 'sourcePrivate', partner: 'sourcePartner', unknown: 'sourceUnknown' }

  return (
    <Screen title={label('type', opp.type)} back="/feed" nav={false}>
      <div className="pb-28">
        {/* Big red warning for listings that look fake */}
        {isScam && (
          <div className="mb-4 rounded-2xl bg-red-600 p-4 text-white">
            <p className="text-lg font-bold">⚠️ {t('scamTitle')}</p>
            <p className="mt-1 text-sm text-red-100">{t('scamText')}</p>
            <ul className="mt-3 space-y-1 text-sm">
              {safety.flags.map((f) => (
                <li key={f}>✗ {label('scamFlags', f)}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Title block */}
        <div className="flex flex-wrap items-center gap-2">
          <SafetyBadge level={safety.level} />
          <DeadlineBadge opp={opp} />
        </div>
        <h2 className="mt-2 text-2xl leading-tight font-extrabold text-slate-900">{pick(opp.title)}</h2>
        <p className="text-slate-500">{pick(opp.org)}</p>

        <div className="mt-3 flex gap-2">
          {'speechSynthesis' in window && (
            <button onClick={readAloud} className="rounded-full bg-indigo-100 px-4 py-2 text-sm font-semibold text-indigo-700">
              {speaking ? `⏹ ${t('stop')}` : `🔊 ${t('readAloud')}`}
            </button>
          )}
          {!isScam && (
            <a
              href={`https://wa.me/?text=${encodeURIComponent(shareText)}`}
              target="_blank"
              rel="noopener"
              className="rounded-full bg-emerald-100 px-4 py-2 text-sm font-semibold text-emerald-700"
            >
              💬 {t('shareWhatsapp')}
            </a>
          )}
        </div>

        {/* Key facts */}
        <dl className="mt-4 grid grid-cols-2 gap-2">
          <Fact term={t('stipend')} value={pick(opp.stipend)} />
          <Fact term={t('deadline')} value={formatDate(opp.deadline, lang)} />
          <Fact term={t('location')} value={pick(opp.location)} />
          <Fact term={t('source')} value={t(sourceLabel[opp.source.kind])} sub={opp.source.name} />
        </dl>

        <Section title={t('whatIsIt')}>
          <p className="text-slate-700">{pick(opp.summary)}</p>
        </Section>

        {!isScam && reasons.length > 0 && (
          <Section title={t('whySuits')}>
            <ul className="space-y-1.5">
              {reasons.map((r) => (
                <li key={r.key} className="flex gap-2 text-slate-700">
                  <span>⭐</span>
                  {t(r.key, { interests: r.params?.interests?.map((i) => label('interests', i)).join(', ') })}
                </li>
              ))}
            </ul>
          </Section>
        )}

        {/* Eligibility, rule by rule */}
        <Section title={t('yourEligibility')} right={<EligibilityBadge eligibility={eligibility} />}>
          <ul className="space-y-2">
            {eligibility.met.map((rule) => (
              <li key={rule.key} className="flex gap-2 text-slate-700">
                <span className="text-emerald-600">✔</span>
                {ruleText(rule, lang, label)}
              </li>
            ))}
            {eligibility.missing.map((rule) => (
              <li key={rule.key} className="flex gap-2 font-semibold text-red-600">
                <span>✗</span>
                {ruleText(rule, lang, label)}
              </li>
            ))}
          </ul>

          {eligibility.missing.length > 0 && (
            <div className="mt-4 rounded-xl bg-amber-50 p-3">
              <p className="text-sm font-bold text-amber-900">💡 {t('howToFix')}</p>
              <ul className="mt-1 space-y-1 text-sm text-amber-900">
                {eligibility.missing.map((rule) => (
                  <li key={rule.key}>• {fixTip(rule, lang)}</li>
                ))}
              </ul>
            </div>
          )}
        </Section>

        {!isScam && (
          <>
            {/* Document checklist */}
            <Section
              title={t('docsNeeded')}
              right={
                <span className="text-xs font-semibold text-slate-500">
                  {docsDone.length}/{opp.docs.length}
                </span>
              }
            >
              <p className="mb-2 text-xs text-slate-500">{t('docsHint')}</p>
              <div className="space-y-2">
                {opp.docs.map((doc) => {
                  const done = docsDone.includes(doc)
                  return (
                    <label
                      key={doc}
                      className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 ${
                        done ? 'border-emerald-300 bg-emerald-50' : 'border-slate-200 bg-white'
                      }`}
                    >
                      <input type="checkbox" checked={done} onChange={() => toggleDoc(doc)} className="h-5 w-5 accent-emerald-600" />
                      <span className={done ? 'text-emerald-800' : 'text-slate-700'}>{label('docs', doc)}</span>
                    </label>
                  )
                })}
              </div>
            </Section>

            {/* Steps */}
            <Section title={t('howToApply')}>
              <ol className="space-y-3">
                {pick(opp.steps).map((step, i) => (
                  <li key={i} className="flex gap-3">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-sm font-bold text-white">
                      {i + 1}
                    </span>
                    <span className="pt-0.5 text-slate-700">{step}</span>
                  </li>
                ))}
              </ol>
            </Section>

            {!eligibility.eligible && (
              <div className="mt-6">
                <SimilarList opp={opp} />
              </div>
            )}
          </>
        )}

        <p className="mt-6 text-center text-xs text-slate-400">{t('demoNote')}</p>
      </div>

      {/* Action buttons stay at the bottom */}
      {!isScam && (
        <div className="fixed inset-x-0 bottom-0 z-20 mx-auto flex max-w-md gap-2 border-t border-slate-200 bg-white p-3">
          <button
            onClick={toggleSave}
            className={`flex-1 rounded-xl px-3 py-3 text-sm font-bold ${
              entry ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-800'
            }`}
          >
            {entry ? `🔔 ${t('saved')}` : `🔔 ${t('save')}`}
          </button>

          {entry?.status && entry.status !== 'saved' ? (
            <span className="flex flex-1 items-center justify-center rounded-xl bg-emerald-600 px-3 py-3 text-sm font-bold text-white">
              {t('applied')}
            </span>
          ) : opp.source.url ? (
            <button onClick={applyOfficial} className="flex-1 rounded-xl bg-indigo-600 px-3 py-3 text-sm font-bold text-white">
              {t('applyOfficial')} ↗
            </button>
          ) : (
            <button onClick={applyWithProfile} className="flex-1 rounded-xl bg-indigo-600 px-3 py-3 text-sm font-bold text-white">
              {t('applyProfile')}
            </button>
          )}
        </div>
      )}
    </Screen>
  )
}

function Section({ title, right, children }) {
  return (
    <section className="mt-5 rounded-2xl border border-slate-200 bg-white p-4">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h3 className="font-bold text-slate-900">{title}</h3>
        {right}
      </div>
      {children}
    </section>
  )
}

function Fact({ term, value, sub }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3">
      <dt className="text-xs text-slate-500">{term}</dt>
      <dd className="mt-0.5 text-sm font-semibold text-slate-800">{value}</dd>
      {sub && <dd className="truncate text-xs text-slate-400">{sub}</dd>}
    </div>
  )
}
