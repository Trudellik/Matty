import './GameScreens.css'

/**
 * Shared idle/start screen for score-based challenges.
 *
 * Props:
 *   icon        – emoji or text shown large
 *   title       – heading
 *   subtitle    – subtext below heading
 *   rules       – optional string[] of rule lines
 *   best        – optional best score value (omit to hide badge)
 *   bestLabel   – prefix for best badge, default '🏆'
 *   onStart     – start button handler
 *   startLabel  – start button text, default 'Start'
 *   onBack      – back button handler (omit to hide back button)
 *   backLabel   – back button text, default '← Back'
 */
export default function GameIdle({
  icon, title, subtitle,
  rules,
  best, bestLabel = '🏆',
  onStart, startLabel = 'Start',
  onBack,  backLabel  = '← Back',
}) {
  return (
    <div className="gs-page">
      {onBack && (
        <button className="gs-back-btn" onClick={onBack}>{backLabel}</button>
      )}
      <div className="gs-content">
        <div className="gs-icon">{icon}</div>
        <h1 className="gs-title">{title}</h1>
        {subtitle && <p className="gs-subtitle">{subtitle}</p>}
        {rules?.length > 0 && (
          <div className="gs-rules">
            {rules.map((rule, i) => <div key={i} className="gs-rule">{rule}</div>)}
          </div>
        )}
        {best !== undefined && (
          <div className="gs-best-badge">{bestLabel} {best}</div>
        )}
        <div className="gs-actions">
          <button className="gs-btn-primary" onClick={onStart}>{startLabel}</button>
        </div>
      </div>
    </div>
  )
}
