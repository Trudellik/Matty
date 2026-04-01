import { createContext, useContext, useState } from 'react'
import { t as translate, LOCALES } from '../utils/i18n'

const LocaleContext = createContext(null)

export function LocaleProvider({ children }) {
  const [locale, setLocale] = useState(
    () => {
      const saved = localStorage.getItem('matty_locale')
      return LOCALES.includes(saved) ? saved : 'en'
    }
  )

  function changeLocale(next) {
    localStorage.setItem('matty_locale', next)
    setLocale(next)
  }

  function t(key, vars) {
    return translate(locale, key, vars)
  }

  return (
    <LocaleContext.Provider value={{ locale, setLocale: changeLocale, t }}>
      {children}
    </LocaleContext.Provider>
  )
}

export function useLocale() {
  return useContext(LocaleContext)
}
