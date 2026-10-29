// Deadline reminders using browser notifications.
// When the app opens, we check saved opportunities and remind the student
// about anything closing in 3 days or less (at most once a day per opportunity).

import { daysLeft } from './matching.js'

export const REMIND_DAYS = 3

export function notificationState() {
  if (!('Notification' in window)) return 'unsupported'
  return Notification.permission // 'default', 'granted' or 'denied'
}

export async function askPermission() {
  if (!('Notification' in window)) return 'unsupported'
  return Notification.requestPermission()
}

// Show a notification. On Android Chrome this must go through the service worker,
// on a laptop the simple way works too.
export async function notify(title, body) {
  if (notificationState() !== 'granted') return false
  const options = { body, icon: '/logo.svg', badge: '/logo.svg' }
  try {
    const reg = await navigator.serviceWorker?.getRegistration()
    if (reg) await reg.showNotification(title, options)
    else new Notification(title, options)
    return true
  } catch {
    return false
  }
}

// Saved opportunities that are not applied yet and close soon
export function dueSoon(saved, opportunities, withinDays = REMIND_DAYS) {
  return opportunities.filter((opp) => {
    const entry = saved[opp.id]
    const left = daysLeft(opp)
    return entry && entry.status === 'saved' && left >= 0 && left <= withinDays
  })
}

// Remind about each due opportunity, but only once per day
export function sendDueReminders(saved, opportunities, makeText) {
  const today = new Date().toDateString()
  let sent = {}
  try {
    sent = JSON.parse(localStorage.getItem('reachup:reminded') || '{}')
  } catch {
    // ignore broken storage
  }

  for (const opp of dueSoon(saved, opportunities)) {
    if (sent[opp.id] === today) continue
    const { title, body } = makeText(opp)
    notify(title, body)
    sent[opp.id] = today
  }

  try {
    localStorage.setItem('reachup:reminded', JSON.stringify(sent))
  } catch {
    // ignore
  }
}
