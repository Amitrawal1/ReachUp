// Preview of the planned WhatsApp channel (Phase 2).
// It is a mock chat built from the student's real matches, to show how students
// without the app would get their weekly opportunities. Nothing is actually sent.

import { useEffect, useMemo, useRef, useState } from 'react'
import { useApp } from '../lib/AppContext'
import { buildFeed, daysLeft } from '../lib/matching'
import { opportunities } from '../data/opportunities'
import { formatDate } from '../lib/format'
import { Screen } from '../components/Layout'

export default function WhatsappPreview() {
  const { t, lang, pick, label, profile } = useApp()
  const hi = lang === 'hi'
  const bottomRef = useRef(null)

  // Top 3 opportunities the student is fully eligible for
  const top = useMemo(
    () => buildFeed(opportunities, profile).matches.filter((m) => m.eligibility.eligible).slice(0, 3),
    [profile],
  )

  // Replies the student tapped, like ['2']
  const [replies, setReplies] = useState([])

  // Keep the newest message in view.
  // Curly braces matter: newer browsers return a Promise from scrollIntoView, and React must not receive it.
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [replies])

  // First bot message: the weekly list
  const greeting = [
    t('waGreeting', { name: profile.name, n: top.length }),
    '',
    ...top.map(
      ({ opp }, i) => `${i + 1}️⃣ *${pick(opp.title)}*\n   💰 ${pick(opp.stipend)}\n   ⏰ ${t('daysLeft', { n: daysLeft(opp) })}\n`,
    ),
    t('waReply'),
  ].join('\n')

  // Bot answer for one opportunity
  const detailMessage = (opp) =>
    [
      `*${pick(opp.title)}*`,
      `✅ ${t('eligible')}`,
      `💰 ${pick(opp.stipend)}`,
      `📅 ${t('deadline')}: ${formatDate(opp.deadline, lang)}`,
      `📄 ${t('docsNeeded')}: ${opp.docs.map((d) => label('docs', d)).join(', ')}`,
      '',
      hi ? '👉 पूरी जानकारी और अप्लाई करने के स्टेप:' : '👉 Full details and steps to apply:',
      `${window.location.origin}/opportunity/${opp.id}`,
      '',
      hi ? '⏰ आख़िरी तारीख़ से 3 दिन पहले हम याद दिलाएँगे।' : '⏰ We will remind you 3 days before the last date.',
    ].join('\n')

  return (
    <Screen title={t('waTitle')}>
      <p className="text-sm text-slate-500">{t('waSub')}</p>

      {/* Phone-style chat window */}
      <div className="mt-3 overflow-hidden rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3 bg-[#075e54] px-4 py-3 text-white">
          <img src="/logo.svg" alt="" className="h-9 w-9 rounded-full" />
          <div>
            <p className="font-semibold">ReachUp</p>
            <p className="text-xs text-emerald-100">{hi ? 'वेरिफ़ाइड बिज़नेस अकाउंट' : 'Verified business account'}</p>
          </div>
        </div>

        <div className="space-y-3 bg-[#ece5dd] p-3 text-[15px]">
          <Bubble text={greeting} />

          {replies.map((r, i) => (
            <div key={i} className="space-y-3">
              <Bubble mine text={r} />
              <Bubble text={detailMessage(top[Number(r) - 1].opp)} />
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        {/* Quick reply buttons instead of a keyboard */}
        <div className="flex gap-2 bg-[#f0f0f0] p-3">
          {top.map((_, i) => (
            <button
              key={i}
              onClick={() => setReplies([...replies, String(i + 1)])}
              className="flex-1 rounded-full bg-white py-2 font-bold text-[#075e54] shadow-sm"
            >
              {i + 1}
            </button>
          ))}
        </div>
      </div>

      <p className="mt-4 rounded-xl bg-amber-50 p-3 text-center text-xs text-amber-800">ℹ️ {t('waPreviewNote')}</p>
    </Screen>
  )
}

// One chat message. "*bold*" text is shown in bold, like real WhatsApp.
function Bubble({ text, mine = false }) {
  const parts = text.split(/(\*[^*]+\*)/g)

  return (
    <div className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
      <p className={`max-w-[85%] rounded-lg px-3 py-2 whitespace-pre-wrap shadow-sm ${mine ? 'bg-[#dcf8c6]' : 'bg-white'}`}>
        {parts.map((p, i) => (p.startsWith('*') && p.endsWith('*') ? <b key={i}>{p.slice(1, -1)}</b> : p))}
      </p>
    </div>
  )
}
