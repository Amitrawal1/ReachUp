// Page frame used by the main screens: top bar with language switch and bottom navigation.

import { NavLink, Link } from 'react-router-dom'
import { useApp } from '../lib/AppContext'

export function LangToggle() {
  const { lang, setLang } = useApp()
  return (
    <div className="flex rounded-full bg-white/15 p-0.5 text-sm font-semibold">
      {[
        ['hi', 'हिं'],
        ['en', 'EN'],
      ].map(([code, text]) => (
        <button
          key={code}
          onClick={() => setLang(code)}
          className={`rounded-full px-3 py-1 transition ${lang === code ? 'bg-white text-indigo-700' : 'text-white'}`}
          aria-pressed={lang === code}
        >
          {text}
        </button>
      ))}
    </div>
  )
}

export function TopBar({ title, back }) {
  return (
    <header className="sticky top-0 z-20 flex items-center gap-3 bg-indigo-600 px-4 py-3 text-white shadow">
      {back ? (
        <Link to={back} className="-ml-1 rounded-full px-2 py-1 text-xl" aria-label="Back">
          ←
        </Link>
      ) : (
        <img src="/logo.svg" alt="" className="h-8 w-8 rounded-lg" />
      )}
      <h1 className="flex-1 truncate text-lg font-bold">{title}</h1>
      <LangToggle />
    </header>
  )
}

const NAV = [
  { to: '/feed', icon: '🏠', key: 'navHome' },
  { to: '/my-list', icon: '📌', key: 'navList' },
  { to: '/whatsapp', icon: '💬', key: 'navWhatsapp' },
  { to: '/profile', icon: '👤', key: 'navProfile' },
]

export function BottomNav() {
  const { t, saved } = useApp()
  const savedCount = Object.keys(saved).length

  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 mx-auto flex max-w-md border-t border-slate-200 bg-white">
      {NAV.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) =>
            `relative flex flex-1 flex-col items-center py-2 text-xs font-medium ${isActive ? 'text-indigo-600' : 'text-slate-500'}`
          }
        >
          <span className="text-xl leading-6">{item.icon}</span>
          {t(item.key)}
          {/* Small counter on "My list" */}
          {item.to === '/my-list' && savedCount > 0 && (
            <span className="absolute top-1 right-1/4 rounded-full bg-amber-500 px-1.5 text-[10px] font-bold text-white">
              {savedCount}
            </span>
          )}
        </NavLink>
      ))}
    </nav>
  )
}

// Top bar + scrolling content + bottom nav
export function Screen({ title, back, children, nav = true }) {
  return (
    <div className={nav ? 'pb-20' : ''}>
      <TopBar title={title} back={back} />
      <main className="px-4 py-4">{children}</main>
      {nav && <BottomNav />}
    </div>
  )
}
