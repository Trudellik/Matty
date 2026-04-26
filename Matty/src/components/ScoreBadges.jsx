import './ScoreBadges.css'

/**
 * Renders "My HS" and/or "Global HS" badges side by side.
 *
 * Props:
 *   my     string | undefined  — active user's best (formatted)
 *   global string | undefined  — global best across all users (formatted)
 *   size   'sm' | 'md'         — 'sm' for option cards, 'md' for home cards
 */
export default function ScoreBadges({ my, global, size = 'md' }) {
  if (!my && !global) return null
  const cls = `sb-root sb-root--${size}`
  return (
    <div className={cls}>
      {my && (
        <span className="sb-badge sb-badge--my">
          <span className="sb-label">Me</span>
          <span className="sb-value">{my}</span>
        </span>
      )}
      {global && (
        <span className="sb-badge sb-badge--global">
          <span className="sb-label">Best</span>
          <span className="sb-value">{global}</span>
        </span>
      )}
    </div>
  )
}
