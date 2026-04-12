import { useState, useEffect } from 'react'
import GameHeader from '../components/GameHeader'
import { useLocale } from '../store/LocaleContext'
import './ChallengePage.css'

/**
 * Shared game-screen layout used by all challenges.
 *
 * Renders a full-height page with GameHeader at the top and children below.
 * All GameHeader props are forwarded directly.
 *
 * GameHeader props (all optional):
 *   onQuit        fn        – quit / back-to-levels button handler
 *   quitLabel     string    – quit button text (default "✕")
 *   lives         number    – current lives (omit to hide hearts)
 *   maxLives      number    – total hearts (default 3)
 *   crackingIdx   number    – index of heart to animate
 *   streak        number    – streak count (omit to hide)
 *   score         any       – score shown on right (omit to hide)
 *   difficulty    string    – badge text, e.g. "Easy"
 *   timerKey      any       – reset key for the drain bar animation
 *   timerDuration number    – seconds; shows drain bar when provided
 *   timerDanger   boolean   – turns drain bar red
 *
 * Other props:
 *   children                – game content rendered below the header
 *   className    string     – extra class on the page root (optional)
 */
export default function ChallengePage({
  // GameHeader props
  onQuit,
  quitLabel,
  lives,
  maxLives,
  crackingIdx,
  streak,
  score,
  difficulty,
  timerKey,
  timerDuration,
  timerDanger,
  // Layout
  children,
  className = '',
}) {
  const { t } = useLocale()
  const [confirming, setConfirming] = useState(false)

  useEffect(() => {
    if (!confirming) return
    function onKey(e) {
      if (e.key === 'Escape') setConfirming(false)
      if (e.key === 'Enter')  { setConfirming(false); onQuit?.() }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [confirming, onQuit])

  return (
    <div className={`cp-page${className ? ` ${className}` : ''}`}>
      <GameHeader
        onQuit={() => setConfirming(true)}
        quitLabel={quitLabel}
        lives={lives}
        maxLives={maxLives}
        crackingIdx={crackingIdx}
        streak={streak}
        score={score}
        difficulty={difficulty}
        timerKey={timerKey}
        timerDuration={timerDuration}
        timerDanger={timerDanger}
      />
      <div className="cp-content">
        {children}
      </div>

      {confirming && (
        <div className="cp-confirm-backdrop" onClick={() => setConfirming(false)}>
          <div className="cp-confirm-dialog" onClick={e => e.stopPropagation()}>
            <div className="cp-confirm-title">{t('quit_confirm_title')}</div>
            <div className="cp-confirm-body">{t('quit_confirm_body')}</div>
            <div className="cp-confirm-actions">
              <button className="cp-confirm-stay" onClick={() => setConfirming(false)}>
                {t('quit_confirm_stay')}
              </button>
              <button className="cp-confirm-leave" onClick={() => { setConfirming(false); onQuit?.() }}>
                {t('quit_confirm_leave')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
