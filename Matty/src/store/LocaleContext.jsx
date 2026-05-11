import { createContext, useContext } from 'react'
import { t as translate } from '../utils/i18n'

const LocaleContext = createContext(null)

export function LocaleProvider({ children }) {
  const locale = 'da'

  function t(key, vars) {
    return translate(locale, key, vars)
  }

  function homePath() {
    return '/'
  }

  function challengePath(id) {
    return `/challenge/${id}`
  }

  return (
    <LocaleContext.Provider value={{ locale, t, homePath, challengePath }}>
      {children}
    </LocaleContext.Provider>
  )
}

export function useLocale() {
  return useContext(LocaleContext)
}
