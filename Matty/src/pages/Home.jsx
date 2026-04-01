import { useNavigate } from 'react-router-dom'
import challenges from '../config/challenges'
import { useHighScores } from '../hooks/useHighScores'
import { useLocale } from '../store/LocaleContext'
import { LOCALES, LOCALE_LABELS } from '../utils/i18n'
import { formatTime } from '../utils/utils'
import './Home.css'

function getScoreBadge(challenge, scores, t) {
  const data = scores[challenge.id]
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
  const { locale, setLocale, t } = useLocale()

  return (
    <div className="home">
      <header className="home-header">
        <h1>Matty</h1>
        <p>{t('home_subtitle')}</p>
        <div className="locale-toggle">
          {LOCALES.map((loc) => (
            <button
              key={loc}
              className={`locale-btn${locale === loc ? ' locale-btn--active' : ''}`}
              onClick={() => setLocale(loc)}
            >
              {LOCALE_LABELS[loc]}
            </button>
          ))}
        </div>
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
              onClick={() => !disabled && navigate(`/challenge/${challenge.id}`)}
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
    </div>
  )
}

export default Home
