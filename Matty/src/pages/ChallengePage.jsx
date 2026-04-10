import GameHeader from '../components/GameHeader'
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
  return (
    <div className={`cp-page${className ? ` ${className}` : ''}`}>
      <GameHeader
        onQuit={onQuit}
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
    </div>
  )
}
