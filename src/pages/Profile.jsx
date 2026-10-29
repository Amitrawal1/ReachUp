// Profile as a short question-and-answer flow: one question per screen, mostly one tap.
// If the student already has a profile, we show a summary with an "Edit" button instead.

import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useApp } from '../lib/AppContext'
import { options, states } from '../i18n/strings'
import { Screen, LangToggle } from '../components/Layout'
import VoiceButton from '../components/VoiceButton'

// The questions, in order. "kind" decides how the answer is picked.
const QUESTIONS = [
  { key: 'name', q: 'qName', kind: 'text' },
  { key: 'age', q: 'qAge', kind: 'number', min: 14, max: 45 },
  { key: 'gender', q: 'qGender', kind: 'choice', group: 'gender' },
  { key: 'education', q: 'qEducation', kind: 'choice', group: 'education' },
  // 10th pass students have no stream yet, so we skip this one for them
  { key: 'stream', q: 'qStream', kind: 'choice', group: 'stream', skip: (a) => a.education === 'class10' },
  { key: 'marks', q: 'qMarks', kind: 'slider', min: 33, max: 100 },
  { key: 'state', q: 'qState', kind: 'select' },
  { key: 'category', q: 'qCategory', kind: 'choice', group: 'category' },
  { key: 'income', q: 'qIncome', kind: 'choice', group: 'income', numeric: true },
  { key: 'employed', q: 'qEmployed', kind: 'yesno' },
  { key: 'interests', q: 'qInterests', kind: 'multi', group: 'interests' },
  { key: 'prefersRemote', q: 'qRemote', kind: 'yesno' },
]

const EMPTY = { name: '', age: 20, marks: 60, state: '', interests: [] }

export default function Profile() {
  const { profile } = useApp()
  const [editing, setEditing] = useState(!profile)

  if (!editing) return <ProfileSummary onEdit={() => setEditing(true)} />
  return <ProfileWizard />
}

function ProfileWizard() {
  const { t, lang, label, profile, setProfile } = useApp()
  const navigate = useNavigate()
  const location = useLocation()
  const [answers, setAnswers] = useState(profile ?? EMPTY)
  const [index, setIndex] = useState(0)

  // Only the questions that apply to this student
  const visible = QUESTIONS.filter((q) => !q.skip?.(answers))
  const question = visible[index]
  const value = answers[question.key]
  const isLast = index === visible.length - 1

  const finish = (final) => {
    // 10th pass students get stream "other" so matching rules still work
    const cleaned = final.education === 'class10' ? { ...final, stream: 'other' } : final
    setProfile({ ...cleaned, phone: location.state?.phone ?? profile?.phone })
    navigate('/feed')
  }

  const goNext = (next = answers) => (isLast ? finish(next) : setIndex(index + 1))

  // Save the answer. One-tap questions move on by themselves.
  const answer = (v, autoNext = false) => {
    const next = { ...answers, [question.key]: v }
    setAnswers(next)
    if (autoNext) setTimeout(() => goNext(next), 150)
  }

  const canGoNext =
    question.kind === 'text' ? value?.trim().length > 0
    : question.kind === 'multi' ? value?.length > 0
    : question.kind === 'select' ? !!value
    : value !== undefined

  const choiceButton = (selected) =>
    `w-full rounded-xl border-2 px-4 py-3.5 text-left text-base font-semibold transition ${
      selected ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-slate-200 bg-white text-slate-700'
    }`

  return (
    <div className="flex min-h-svh flex-col">
      {/* Progress bar on top */}
      <header className="bg-indigo-600 px-4 pt-4 pb-3 text-white">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold">
            {t('step')} {index + 1} {t('of')} {visible.length}
          </span>
          <LangToggle />
        </div>
        <div className="mt-3 h-2 rounded-full bg-indigo-400/50">
          <div className="h-2 rounded-full bg-amber-400 transition-all" style={{ width: `${((index + 1) / visible.length) * 100}%` }} />
        </div>
      </header>

      <main className="flex-1 px-5 py-6">
        <h2 className="text-2xl font-bold text-slate-900">{t(question.q)}</h2>

        <div className="mt-6 space-y-3">
          {question.kind === 'text' && (
            <div className="flex gap-2">
              <input
                autoFocus
                value={value}
                onChange={(e) => answer(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && canGoNext && goNext()}
                className="w-full rounded-xl border-2 border-slate-200 bg-white px-4 py-3 text-lg outline-none focus:border-indigo-600"
              />
              <VoiceButton onResult={(text) => answer(text)} />
            </div>
          )}

          {question.kind === 'number' && (
            <div className="flex items-center justify-center gap-6 py-4">
              <button onClick={() => answer(Math.max(question.min, value - 1))} className="h-14 w-14 rounded-full bg-slate-200 text-3xl font-bold">
                −
              </button>
              <div className="text-center">
                <span className="text-5xl font-extrabold text-indigo-700">{value}</span>
                <p className="text-slate-500">{t('years')}</p>
              </div>
              <button onClick={() => answer(Math.min(question.max, value + 1))} className="h-14 w-14 rounded-full bg-slate-200 text-3xl font-bold">
                +
              </button>
            </div>
          )}

          {question.kind === 'slider' && (
            <div className="py-4">
              <p className="text-center text-5xl font-extrabold text-indigo-700">{value}%</p>
              <input
                type="range"
                min={question.min}
                max={question.max}
                value={value}
                onChange={(e) => answer(Number(e.target.value))}
                className="mt-6 w-full accent-indigo-600"
              />
            </div>
          )}

          {question.kind === 'choice' &&
            Object.keys(options[question.group]).map((key) => {
              const v = question.numeric ? Number(key) : key
              return (
                <button key={key} onClick={() => answer(v, true)} className={choiceButton(value === v)}>
                  {label(question.group, key)}
                </button>
              )
            })}

          {question.kind === 'yesno' &&
            [
              [true, t('yes')],
              [false, t('no')],
            ].map(([v, text]) => (
              <button key={text} onClick={() => answer(v, true)} className={choiceButton(value === v)}>
                {text}
              </button>
            ))}

          {question.kind === 'select' && (
            <select
              value={value}
              onChange={(e) => answer(e.target.value)}
              className="w-full rounded-xl border-2 border-slate-200 bg-white px-4 py-3.5 text-lg"
            >
              <option value="" disabled>
                {lang === 'hi' ? 'राज्य चुनें' : 'Select state'}
              </option>
              {states.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          )}

          {question.kind === 'multi' && (
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(options.interests).map(([key, opt]) => {
                const selected = value.includes(key)
                return (
                  <button
                    key={key}
                    onClick={() => answer(selected ? value.filter((k) => k !== key) : [...value, key])}
                    className={`${choiceButton(selected)} flex flex-col items-center gap-1 text-center text-sm`}
                  >
                    <span className="text-2xl">{opt.icon}</span>
                    {label('interests', key)}
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </main>

      <footer className="flex gap-3 px-5 pb-8">
        {index > 0 && (
          <button onClick={() => setIndex(index - 1)} className="rounded-xl bg-slate-200 px-6 py-3.5 font-bold text-slate-700">
            {t('back')}
          </button>
        )}
        <button
          disabled={!canGoNext}
          onClick={() => goNext()}
          className="flex-1 rounded-xl bg-indigo-600 py-3.5 text-lg font-bold text-white disabled:opacity-40"
        >
          {isLast ? t('finish') : t('next')}
        </button>
      </footer>
    </div>
  )
}

function ProfileSummary({ onEdit }) {
  const { t, label, profile, resetAll } = useApp()
  const navigate = useNavigate()

  const rows = [
    [t('qAge'), `${profile.age} ${t('years')}`],
    [t('qEducation'), label('education', profile.education)],
    [t('qStream'), label('stream', profile.stream)],
    [t('qMarks'), `${profile.marks}%`],
    [t('qState'), profile.state],
    [t('qCategory'), label('category', profile.category)],
    [t('qIncome'), label('income', profile.income)],
    [t('qInterests'), profile.interests.map((i) => label('interests', i)).join(', ')],
  ]

  return (
    <Screen title={t('navProfile')}>
      <div className="rounded-2xl bg-white p-5 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-indigo-100 text-2xl font-bold text-indigo-700">
            {profile.name?.[0]?.toUpperCase()}
          </div>
          <div>
            <p className="text-xl font-bold">{profile.name}</p>
            {profile.phone && <p className="text-sm text-slate-500">+91 {profile.phone}</p>}
          </div>
        </div>

        <dl className="mt-5 divide-y divide-slate-100">
          {rows.map(([k, v]) => (
            <div key={k} className="py-2.5">
              <dt className="text-xs text-slate-500">{k}</dt>
              <dd className="font-semibold text-slate-800">{v}</dd>
            </div>
          ))}
        </dl>
      </div>

      <button onClick={onEdit} className="mt-4 w-full rounded-xl bg-indigo-600 py-3.5 font-bold text-white">
        {t('editProfile')}
      </button>
      <button
        onClick={() => {
          resetAll()
          navigate('/welcome')
        }}
        className="mt-3 w-full rounded-xl bg-slate-200 py-3.5 font-bold text-slate-700"
      >
        {t('logout')}
      </button>
      <p className="mt-6 text-center text-xs text-slate-400">{t('demoNote')}</p>
    </Screen>
  )
}
