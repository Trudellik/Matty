import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import challenges from '../config/challenges'
import signeChallenges from '../config/signe-challenges'
import { useHighScores } from '../hooks/useHighScores'
import { useLocale } from '../store/LocaleContext'
import { formatTime } from '../utils/utils'
import UserPicker from '../components/UserPicker'
import ScoreBadges from '../components/ScoreBadges'
import './Home.css'

function getScores(challenge, myScores, globalScore, globalTimes) {
  let my, global

  if (challenge.scoreKeys) {
    const myVals = challenge.scoreKeys.map(k => myScores[k]).filter(v => v != null)
    const glVals = challenge.scoreKeys.map(k => globalScore(k)).filter(v => v != null)
    if (challenge.scoreType === 'time') {
      if (myVals.length) my = formatTime(Math.min(...myVals))
      if (glVals.length) global = formatTime(Math.min(...glVals))
    } else {
      if (myVals.length) my = String(Math.max(...myVals))
      if (glVals.length) global = String(Math.max(...glVals))
    }
    return { my, global }
  }

  const key  = challenge.scoreKey ?? challenge.id
  const myRaw = myScores[key]
  const glRaw = challenge.scoreType === 'time' ? globalTimes(key) : globalScore(key)

  if (challenge.scoreType === 'time') {
    if (typeof myRaw === 'object' && myRaw !== null) {
      const times = Object.values(myRaw).filter(v => v != null)
      if (times.length) my = formatTime(Math.min(...times))
    }
    if (typeof glRaw === 'object' && glRaw !== null) {
      const times = Object.values(glRaw).filter(v => v != null)
      if (times.length) global = formatTime(Math.min(...times))
    }
  } else {
    if (typeof myRaw === 'number') my = String(myRaw)
    if (typeof glRaw === 'number') global = String(glRaw)
  }

  return { my, global }
}

function AppToggle({ app, onToggle }) {
  const isSigne = app === 'signe'
  return (
    <button
      className={`app-toggle${isSigne ? ' app-toggle--signe' : ''}`}
      onClick={onToggle}
      aria-label={isSigne ? 'Switch to Matty' : 'Switch to Signe'}
    >
      <span className={`app-toggle-option${!isSigne ? ' app-toggle-option--active' : ''}`}>
        Matty
      </span>
      <span className="app-toggle-track">
        <span className="app-toggle-thumb" />
      </span>
      <span className={`app-toggle-option${isSigne ? ' app-toggle-option--active' : ''}`}>
        Signe
      </span>
    </button>
  )
}

function Home() {
  const navigate = useNavigate()
  const { scores, globalScore, globalTimes } = useHighScores()
  const { t, challengePath } = useLocale()

  const [app, setApp] = useState(() => localStorage.getItem('activeApp') ?? 'matty')

  function handleToggle() {
    const next = app === 'matty' ? 'signe' : 'matty'
    setApp(next)
    localStorage.setItem('activeApp', next)
  }

  const isSigne   = app === 'signe'
  const list      = isSigne ? signeChallenges : challenges
  const title     = isSigne ? 'Signe' : 'Matty'
  const subtitle  = isSigne ? t('signe_subtitle') : t('home_subtitle')

  return (
    <div className={`home${isSigne ? ' home--signe' : ''}`}>
      <div className="home-topbar">
        <AppToggle app={app} onToggle={handleToggle} />
        <UserPicker />
      </div>
      <header className="home-header">
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </header>

      <main className="challenges-grid">
        {list.map((challenge) => {
          const key         = challenge.id.replace(/-/g, '_')
          const label       = t(`challenge_${key}_label`)
          const description = t(`challenge_${key}_desc`)
          const disabled    = !challenge.ready
          const { my, global } = disabled
            ? {}
            : getScores(challenge, scores, globalScore, globalTimes)

          return (
            <button
              key={challenge.id}
              className={`challenge-card${disabled ? ' challenge-card--disabled' : ''}`}
              onClick={() => !disabled && navigate(challengePath(challenge.id))}
              disabled={disabled}
            >
              <span className="challenge-icon">{challenge.icon}</span>
              <span className="challenge-label">{label}</span>
              <span className="challenge-desc">{description}</span>
              {disabled && <span className="challenge-soon">{t('coming_soon')}</span>}
              {!disabled && <ScoreBadges my={my} global={global} size="md" />}
            </button>
          )
        })}
      </main>

      <footer className="home-footer">
        <p>Made with ♥ by Kenneth Andersen</p>
        <p className="home-version">v{__APP_VERSION__}</p>
      </footer>
    </div>
  )
}

export default Home
