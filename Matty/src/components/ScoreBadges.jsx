import './ScoreBadges.css'

/**
 * Renders "My HS" and/or "Global HS" badges side by side.
 *
 * Props:
 *   my     string | undefined  — active user's best (formatted)
 *   global string | undefined  — global best across all users (formatted)
 *   size   'sm' | 'md'         — 'sm' for option cards, 'md' for home cards
 */
export default function ScoreBadges({ my, global, globalHolder = null, size = 'md' }) {
  if (!my && !global) return null
  const cls = `sb-root sb-root--${size}`

  if (my && global && my === global && !globalHolder) {
    return (
      <div className={cls}>
        <span className="sb-badge sb-badge--merged">
          🏆 {my}
        </span>
      </div>
    )
  }

  return (
    <div className={cls}>
      {my && (
        <span className="sb-badge sb-badge--my">
          <span className="sb-label">🏆</span>
          <span className="sb-value">{my}</span>
        </span>
      )}
      {global && (
        <span className="sb-badge sb-badge--global">
          <span className="sb-label">
            {globalHolder
              ? <span className="sb-holder-avatar">{globalHolder}</span>
              : '🏆'}
          </span>
          <span className="sb-value">{global}</span>
        </span>
      )}
    </div>
  )
}
