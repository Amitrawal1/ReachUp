// Microphone button: the student speaks and the text is filled in for them.
// Uses the browser's built-in speech recognition (works in Chrome on Android).
// If the browser does not support it, the button is simply hidden.

import { useRef, useState } from 'react'
import { useApp } from '../lib/AppContext'

const Recognition = typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition)

export default function VoiceButton({ onResult }) {
  const { t, lang } = useApp()
  const [listening, setListening] = useState(false)
  const recRef = useRef(null)

  if (!Recognition) return null

  const start = () => {
    const rec = new Recognition()
    rec.lang = lang === 'hi' ? 'hi-IN' : 'en-IN'
    rec.interimResults = false
    rec.onresult = (e) => onResult(e.results[0][0].transcript.trim())
    rec.onend = () => setListening(false)
    rec.onerror = () => setListening(false)
    recRef.current = rec
    setListening(true)
    rec.start()
  }

  return (
    <button
      type="button"
      onClick={listening ? () => recRef.current?.stop() : start}
      className={`flex shrink-0 items-center gap-1 rounded-xl px-3 font-semibold ${
        listening ? 'animate-pulse bg-red-500 text-white' : 'bg-indigo-100 text-indigo-700'
      }`}
    >
      🎤 {listening ? t('listening') : t('speak')}
    </button>
  )
}
