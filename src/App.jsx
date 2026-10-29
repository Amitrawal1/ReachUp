import { Navigate, Route, Routes } from 'react-router-dom'
import { useApp } from './lib/AppContext'

// Screens are added in the next parts. For now the shell only shows the app name.
function Placeholder() {
  const { t } = useApp()
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-indigo-600">{t('appName')}</h1>
      <p className="mt-2 text-slate-600">{t('tagline')}</p>
    </div>
  )
}

export default function App() {
  return (
    // Phone-sized column in the middle of the screen, even on a laptop
    <div className="mx-auto min-h-svh max-w-md bg-slate-50 shadow-sm">
      <Routes>
        <Route path="/" element={<Placeholder />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  )
}
