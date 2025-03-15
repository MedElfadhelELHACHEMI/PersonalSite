'use client'

import { Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'

import * as React from 'react'

export function ThemeSwitcher() {
  const { setTheme, theme } = useTheme()

  return (
    <>
      <button
        className="h-11 w-11  bg-transparent "
        onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
      >
        <Sun className="hidden h-6 w-6 stroke-darkText dark:inline" />
        <Moon className="inline h-6 w-6 stroke-text dark:hidden" />
        <span className="sr-only">Toggle theme</span>
      </button>
    </>
  )
}
