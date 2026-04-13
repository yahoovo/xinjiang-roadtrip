import { useState } from 'react'

export function useLocalStorage(key, initial) {
  const [value, setValue] = useState(() => {
    try {
      const stored = localStorage.getItem(key)
      return stored !== null ? JSON.parse(stored) : initial
    } catch {
      return initial
    }
  })

  function set(v) {
    const next = typeof v === 'function' ? v(value) : v
    setValue(next)
    try { localStorage.setItem(key, JSON.stringify(next)) } catch {}
  }

  return [value, set]
}
