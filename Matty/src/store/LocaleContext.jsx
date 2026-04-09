import { createContext, useContext } from 'react'
import { Outlet, useParams } from 'react-router-dom'
import { t as translate, LOCALES } from '../utils/i18n'

const LocaleContext = createContext(null)

export function LocaleProvider() {
  const { locale: paramLocale } = useParams()
  const locale = LOCALES.includes(paramLocale) ? paramLocale : 'da'

  function t(key, vars) {
    return translate(locale, key, vars)
  }

  function homePath() {
    return `/${locale}`
  }

  function challengePath(id) {
    return `/${locale}/challenge/${id}`
  }

  return (
    <LocaleContext.Provider value={{ locale, t, homePath, challengePath }}>
      <Outlet />
    </LocaleContext.Provider>
  )
}

export function useLocale() {
  return useContext(LocaleContext)
}
