import { useEffect } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { useApp } from './lib/AppContext'
import { opportunities } from './data/opportunities'
import { daysLeft } from './lib/matching'
import { sendDueReminders } from './lib/reminders'
import Welcome from './pages/Welcome'
import Profile from './pages/Profile'
import Feed from './pages/Feed'
import Detail from './pages/Detail'
import MyList from './pages/MyList'
import WhatsappPreview from './pages/WhatsappPreview'

// Pages that need a finished profile send new students to the welcome screen
function NeedsProfile({ children }) {
  const { profile } = useApp()
  return profile ? children : <Navigate to="/welcome" replace />
}

export default function App() {
  const { profile, saved, t, pick } = useApp()

  // When the app opens, remind the student about saved deadlines that are close
  useEffect(() => {
    if (!profile) return
    sendDueReminders(saved, opportunities, (o) => ({
      title: t('remindTitle', { title: pick(o.title), n: daysLeft(o) }),
      body: t('remindBody'),
    }))
    // Only on first load, not on every change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    // Phone-sized column in the middle of the screen, even on a laptop
    <div className="mx-auto min-h-svh max-w-md bg-slate-50 shadow-sm">
      <Routes>
        <Route path="/" element={<Navigate to={profile ? '/feed' : '/welcome'} replace />} />
        <Route path="/welcome" element={<Welcome />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/feed" element={<NeedsProfile><Feed /></NeedsProfile>} />
        <Route path="/opportunity/:id" element={<NeedsProfile><Detail /></NeedsProfile>} />
        <Route path="/my-list" element={<NeedsProfile><MyList /></NeedsProfile>} />
        <Route path="/whatsapp" element={<NeedsProfile><WhatsappPreview /></NeedsProfile>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  )
}
