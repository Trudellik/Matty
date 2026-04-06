import './GameHeader.css'

const MAX_LIVES_DEFAULT = 3

/**
 * Shared game header used across all challenge screens.
 *
 * Props:
 *   onQuit        fn        – called when quit button clicked
 *   quitLabel     string    – button label (default "✕")
 *   lives         number    – current life count (omit to hide)
 *   maxLives      number    – total hearts (default 3)
 *   crackingIdx   number    – index of heart currently animating (optional)
 *   streak        number    – current streak (omit to hide)
 *   score         any       – large display on right side (omit to hide)
 *   difficulty    string    – badge text, e.g. "Easy" or "Lvl 3"
 *   timerKey      any       – changing this resets the timer animation
 *   timerDuration number    – seconds; shows drain bar when provided
 *   timerDanger   boolean   – turns bar red
 */
export default function GameHeader({
  onQuit,
  quitLabel = '✕',
  lives,
  maxLives = MAX_LIVES_DEFAULT,
  crackingIdx,
  streak,
  score,
  difficulty,
  timerKey,
  timerDuration,
  timerDanger = false,
}) {
  return (
    <div className="gh-root">
      <div className="gh-topbar">
        {/* Left: quit */}
        <button className="gh-quit-btn" onClick={onQuit}>{quitLabel}</button>

        {/* Centre: streak + lives */}
        <div className="gh-centre">
          {streak !== undefined && (
            <div className={`gh-streak${streak >= 3 ? ' gh-streak-hot' : ''}`}>
              <span className="gh-streak-icon">{streak >= 3 ? '🔥' : '⚡'}</span>
              <span className="gh-streak-count">{streak}</span>
            </div>
          )}
          {lives !== undefined && (
            <div className="gh-lives">
              {Array.from({ length: maxLives }, (_, i) => {
                if (i === crackingIdx) return <span key={i} className="life-cracking">💔</span>
                if (i < lives)        return <span key={i}>❤️</span>
                return                       <span key={i} className="life-lost">🖤</span>
              })}
            </div>
          )}
        </div>

        {/* Right: score + difficulty badge */}
        <div className="gh-right">
          {score !== undefined && (
            <div className="gh-score">{score}</div>
          )}
          {difficulty !== undefined && (
            <div className="gh-difficulty-badge">{difficulty}</div>
          )}
        </div>
      </div>

      {/* Timer drain bar */}
      {timerDuration !== undefined && (
        <div className="gh-timer-track">
          <div
            key={timerKey}
            className={`gh-timer-fill${timerDanger ? ' gh-timer-danger' : ''}`}
            style={{ animationDuration: `${timerDuration}s` }}
          />
        </div>
      )}
    </div>
  )
}
