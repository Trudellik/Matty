import { useParams, useNavigate } from 'react-router-dom'
import challenges from '../config/challenges'
import { useLocale } from '../store/LocaleContext'
import './ChallengePage.css'

function ChallengePage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { t, homePath } = useLocale()
  const challenge = challenges.find((c) => c.id === id)

  if (!challenge) {
    return (
      <div className="challenge-page">
        <p>{t('challenge_not_found')}</p>
        <button onClick={() => navigate(homePath())}>{t('back_to_home')}</button>
      </div>
    )
  }

  const key = challenge.id.replace(/-/g, '_')

  return (
    <div className="challenge-page">
      <button className="back-btn" onClick={() => navigate(homePath())}>{t('back')}</button>
      <div className="challenge-hero">
        <span className="challenge-page-icon">{challenge.icon}</span>
        <h1>{t(`challenge_${key}_label`)}</h1>
        <p>{t(`challenge_${key}_desc`)}</p>
      </div>
      <div className="coming-soon">
        <p>{t('challenge_coming_soon')}</p>
      </div>
    </div>
  )
}

export default ChallengePage
