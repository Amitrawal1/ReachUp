// Shared app state: language, student profile and saved opportunities.
// Everything is kept in the browser (localStorage), so the prototype needs no server
// and still works offline.

import { createContext, useContext, useEffect, useState } from 'react'
import { strings, options } from '../i18n/strings'

const AppContext = createContext(null)

// Read from localStorage safely (it can fail in private mode)
function load(key, fallback) {
  try {
    const raw = localStorage.getItem('reachup:' + key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

function store(key, value) {
  try {
    localStorage.setItem('reachup:' + key, JSON.stringify(value))
  } catch {
    // Storage is full or blocked. The app still works for this visit.
  }
}

export function AppProvider({ children }) {
  const [lang, setLang] = useState(() => load('lang', 'hi'))
  const [profile, setProfile] = useState(() => load('profile', null))
  // saved looks like { [opportunityId]: { status: 'saved' | 'applied' | ..., docs: ['aadhaar'], savedAt } }
  const [saved, setSaved] = useState(() => load('saved', {}))

  useEffect(() => store('lang', lang), [lang])
  useEffect(() => store('profile', profile), [profile])
  useEffect(() => store('saved', saved), [saved])

  // Keep the <html lang> correct for screen readers
  useEffect(() => {
    document.documentElement.lang = lang
  }, [lang])

  // t('key', { n: 3 }) returns the text in the current language and fills {n}
  const t = (key, params = {}) => {
    let text = strings[lang][key] ?? strings.en[key] ?? key
    for (const [k, v] of Object.entries(params)) text = text.replace(`{${k}}`, v)
    return text
  }

  // label('education', 'ug') returns "Graduation…" or "ग्रेजुएशन…"
  const label = (group, key) => options[group]?.[key]?.[lang] ?? key

  // Pick the right language from an object like { en: '...', hi: '...' }
  const pick = (obj) => obj?.[lang] ?? obj?.en ?? ''

  // Update one saved opportunity (creates it if missing)
  const updateSaved = (id, changes) =>
    setSaved((prev) => ({
      ...prev,
      [id]: { status: 'saved', docs: [], savedAt: Date.now(), ...prev[id], ...changes },
    }))

  const removeSaved = (id) =>
    setSaved((prev) => {
      const next = { ...prev }
      delete next[id]
      return next
    })

  const resetAll = () => {
    setProfile(null)
    setSaved({})
  }

  // Small message at the bottom of the screen that hides itself after a few seconds
  const [toast, setToast] = useState(null)
  const showToast = (text) => {
    setToast(text)
    setTimeout(() => setToast(null), 3000)
  }

  const value = { lang, setLang, t, label, pick, profile, setProfile, saved, updateSaved, removeSaved, resetAll, showToast }
  return (
    <AppContext.Provider value={value}>
      {children}
      {toast && (
        <div className="fixed inset-x-0 bottom-24 z-50 mx-auto w-fit max-w-[90%] rounded-xl bg-slate-900 px-4 py-3 text-center text-sm font-medium text-white shadow-lg">
          {toast}
        </div>
      )}
    </AppContext.Provider>
  )
}

export function useApp() {
  return useContext(AppContext)
}
