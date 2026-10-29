// First screen: pick language, enter mobile number, verify OTP.
// The OTP is fake in this prototype; any 4 digits work.

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../lib/AppContext'

// Ready-made student so judges can see the feed in one tap
const SAMPLE_STUDENT = {
  name: 'Priya',
  age: 22,
  gender: 'female',
  education: 'diploma',
  stream: 'engineering',
  marks: 72,
  state: 'Uttar Pradesh',
  category: 'sc',
  income: 2.5,
  employed: false,
  interests: ['tech', 'creative'],
  prefersRemote: true,
  phone: '9876543210',
}

export default function Welcome() {
  const { t, lang, setLang, setProfile } = useApp()
  const navigate = useNavigate()
  const [stage, setStage] = useState('phone') // 'phone' then 'otp'
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [error, setError] = useState('')

  const sendOtp = (e) => {
    e.preventDefault()
    // Indian mobile numbers are 10 digits and start with 6, 7, 8 or 9
    if (!/^[6-9]\d{9}$/.test(phone)) return setError(t('mobileError'))
    setError('')
    setStage('otp')
  }

  const verify = (e) => {
    e.preventDefault()
    if (otp.length === 4) navigate('/profile', { state: { phone } })
  }

  return (
    <div className="flex min-h-svh flex-col bg-gradient-to-b from-indigo-600 to-indigo-800 text-white">
      <div className="flex flex-1 flex-col justify-center px-6 pt-12">
        <img src="/logo.svg" alt="" className="h-16 w-16 rounded-2xl shadow-lg" />
        <h1 className="mt-6 text-4xl font-extrabold">{t('appName')}</h1>
        <p className="mt-2 text-lg text-indigo-100">{t('tagline')}</p>

        <div className="mt-8 space-y-3 text-indigo-50">
          <p className="text-2xl font-bold">{t('welcomeTitle')}</p>
          <p>{t('welcomeText')}</p>
        </div>
      </div>

      <div className="rounded-t-3xl bg-white px-6 pt-6 pb-10 text-slate-900">
        {/* Language choice comes first, with big buttons */}
        <p className="text-sm font-semibold text-slate-500">{t('chooseLanguage')}</p>
        <div className="mt-2 grid grid-cols-2 gap-3">
          {[
            ['hi', 'हिंदी'],
            ['en', 'English'],
          ].map(([code, text]) => (
            <button
              key={code}
              onClick={() => setLang(code)}
              className={`rounded-xl border-2 py-3 text-lg font-bold ${
                lang === code ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-slate-200 text-slate-600'
              }`}
            >
              {text}
            </button>
          ))}
        </div>

        {stage === 'phone' ? (
          <form onSubmit={sendOtp} className="mt-6">
            <label className="text-sm font-semibold text-slate-500" htmlFor="phone">
              {t('mobileLabel')}
            </label>
            <div className="mt-2 flex items-center rounded-xl border-2 border-slate-200 focus-within:border-indigo-600">
              <span className="pl-4 font-semibold text-slate-500">+91</span>
              <input
                id="phone"
                inputMode="numeric"
                maxLength={10}
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                placeholder={t('mobilePlaceholder')}
                className="w-full bg-transparent px-3 py-3 text-lg outline-none"
              />
            </div>
            {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
            <button className="mt-4 w-full rounded-xl bg-indigo-600 py-3.5 text-lg font-bold text-white">{t('sendOtp')}</button>
          </form>
        ) : (
          <form onSubmit={verify} className="mt-6">
            <label className="text-sm font-semibold text-slate-500" htmlFor="otp">
              {t('otpLabel')} +91 {phone}
            </label>
            <input
              id="otp"
              inputMode="numeric"
              maxLength={4}
              autoFocus
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
              placeholder="• • • •"
              className="mt-2 w-full rounded-xl border-2 border-slate-200 py-3 text-center text-2xl tracking-[0.6em] outline-none focus:border-indigo-600"
            />
            <p className="mt-2 text-xs text-slate-400">{t('otpHint')}</p>
            <button
              disabled={otp.length !== 4}
              className="mt-4 w-full rounded-xl bg-indigo-600 py-3.5 text-lg font-bold text-white disabled:opacity-40"
            >
              {t('verify')}
            </button>
          </form>
        )}

        <button
          onClick={() => {
            setProfile(SAMPLE_STUDENT)
            navigate('/feed')
          }}
          className="mt-4 w-full text-sm font-semibold text-indigo-600 underline underline-offset-4"
        >
          {t('trySample')}
        </button>
      </div>
    </div>
  )
}
