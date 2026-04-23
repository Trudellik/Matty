import { useNavigate } from 'react-router-dom'
import challenges from '../config/challenges'
import { useHighScores } from '../hooks/useHighScores'
import { useLocale } from '../store/LocaleContext'
import { formatTime } from '../utils/utils'
import './Home.css'

function getScoreBadge(challenge, scores, t) {
  if (challenge.scoreKeys) {
    const vals = challenge.scoreKeys.map(k => scores[k]).filter(v => v !== undefined && v !== null)
    if (vals.length === 0) return null
    const best = challenge.scoreType === 'time' ? Math.min(...vals) : Math.max(...vals)
    return challenge.scoreType === 'time'
      ? `${t('best_time')} ${formatTime(best)}`
      : `${t('best_score')} ${best}`
  }

  const data = scores[challenge.scoreKey ?? challenge.id]
  if (data === undefined || data === null) return null

  if (challenge.scoreType === 'time') {
    if (typeof data !== 'object') return null
    const times = Object.values(data).filter((v) => v !== undefined && v !== null)
    if (times.length === 0) return null
    return `${t('best_time')} ${formatTime(Math.min(...times))}`
  }

  return `${t('best_score')} ${data}`
}

function Home() {
  const navigate = useNavigate()
  const { scores } = useHighScores()
  const { t, challengePath } = useLocale()

  return (
    <div className="home">
      <header className="home-header">
        <h1>Matty</h1>
        <p>{t('home_subtitle')}</p>
      </header>

      <main className="challenges-grid">
        {challenges.map((challenge) => {
          const key = challenge.id.replace(/-/g, '_')
          const label = t(`challenge_${key}_label`)
          const description = t(`challenge_${key}_desc`)
          const badge = getScoreBadge(challenge, scores, t)
          const disabled = !challenge.ready
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
              {!disabled && badge && <span className="challenge-highscore">{badge}</span>}
            </button>
          )
        })}
      </main>

      <footer className="home-footer">
        <p>Made with ♥ by Matty</p>
      </footer>
    </div>
  )
}

export default Home
