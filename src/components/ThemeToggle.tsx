'use client'

import { useEffect, useState } from 'react'

type Theme = 'dark' | 'light'

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>('dark')

  useEffect(() => {
    const stored = typeof window !== 'undefined' ? localStorage.getItem('blockpilot_theme') : null
    const initial = stored === 'light' || stored === 'dark' ? stored : 'dark'
    setTheme(initial)
    document.documentElement.setAttribute('data-theme', initial)
    document.documentElement.classList.toggle('dark', initial === 'dark')
  }, [])

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    localStorage.setItem('blockpilot_theme', next)
    document.documentElement.setAttribute('data-theme', next)
    document.documentElement.classList.toggle('dark', next === 'dark')
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
      className="hidden sm:inline-flex items-center gap-2 rounded-lg border border-gray-800 bg-white/5 px-3 py-2 text-sm text-gray-300 hover:border-indigo-500/50 hover:text-white transition-colors light-surface"
    >
      <span>{theme === 'dark' ? '🌙' : '☀️'}</span>
      <span>{theme === 'dark' ? 'Dark' : 'Light'}</span>
    </button>
  )
}
