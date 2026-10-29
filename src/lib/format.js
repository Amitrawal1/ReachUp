// Show a date like "12 Nov 2026" (English) or "12 नव॰ 2026" (Hindi)
export function formatDate(date, lang) {
  return date.toLocaleDateString(lang === 'hi' ? 'hi-IN' : 'en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}
