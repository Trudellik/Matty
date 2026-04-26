import { useNavigate } from 'react-router-dom'
import challenges from '../config/challenges'
import { useHighScores } from '../hooks/useHighScores'
import { useLocale } from '../store/LocaleContext'
import { formatTime } from '../utils/utils'
import UserPicker from '../components/UserPicker'
import ScoreBadges from '../components/ScoreBadges'
import './Home.css'

function getScores(challenge, myScores, globalScore, globalTimes) {
  let my, global

  if (challenge.scoreKeys) {
    // Multi-key score (e.g. multiple difficulty levels stored separately)
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

function Home() {
  const navigate = useNavigate()
  const { scores, globalScore, globalTimes } = useHighScores()
  const { t, challengePath } = useLocale()

  return (
    <div className="home">
      <div className="home-topbar">
        <UserPicker />
      </div>
      <header className="home-header">
        <h1>Matty</h1>
        <p>{t('home_subtitle')}</p>
      </header>

      <main className="challenges-grid">
        {challenges.map((challenge) => {
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
