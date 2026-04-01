import { useEffect } from 'react'
import './GameScreens.css'

/**
 * Shared game-over / completion screen.
 *
 * Props:
 *   icon          – emoji, default '💀'
 *   title         – heading
 *   result        – score number or formatted time string
 *   resultLabel   – text below result (e.g. 'correct picks')
 *   isNewBest     – show new-best badge when true
 *   newBestLabel  – badge text
 *   actions       – [{ label, onClick, primary? }] – rendered as buttons
 *   overlay       – render as a fixed overlay instead of a full page
 *
 * Keyboard (full-page only):
 *   Enter  → first primary action (play again)
 *   Escape → last action (home)
 */
export default function GameOver({
  icon = '💀', title,
  result, resultLabel,
  isNewBest, newBestLabel,
  actions = [],
  overlay = false,
}) {
  const primaryAction = actions.find(a => a.primary)
  const lastAction    = actions[actions.length - 1]

  useEffect(() => {
    if (overlay) return
    function onKey(e) {
      if (e.key === 'Enter'  && primaryAction) { e.preventDefault(); primaryAction.onClick() }
      if (e.key === 'Escape' && lastAction)    { e.preventDefault(); lastAction.onClick() }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const content = (
    <div className={overlay ? 'gs-overlay-card' : 'gs-content'}>
      <div className="gs-icon">{icon}</div>
      <h1 className="gs-title">{title}</h1>
      {result !== undefined && <div className="gs-final-score">{result}</div>}
      {resultLabel          && <div className="gs-final-label">{resultLabel}</div>}
      {isNewBest && newBestLabel && <div className="gs-new-best">{newBestLabel}</div>}
      <div className="gs-actions">
        {actions.map((action, i) => (
          <button
            key={i}
            className={action.primary ? 'gs-btn-primary' : 'gs-btn-secondary'}
            onClick={action.onClick}
          >
            {action.label}
          </button>
        ))}
      </div>
    </div>
  )

  if (overlay) {
    return <div className="gs-overlay">{content}</div>
  }

  return <div className="gs-page">{content}</div>
}
