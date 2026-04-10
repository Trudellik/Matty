import { useState, useEffect, useRef } from 'react'
import './GameOptionsPage.css'

/**
 * Shared options/level-select page shown before every game.
 *
 * Props:
 *   icon        – large emoji shown at top
 *   title       – page heading
 *   subtitle    – subheading (optional)
 *   rules       – string[] of rule lines (optional)
 *   options     – array of option objects (omit or [] for no-option games):
 *                   { key, label, desc, badge }
 *                 badge is the best-score string to show, or undefined
 *   onStart     – called with (selectedKey) when Start is triggered
 *                 For no-option games, called with null
 *   onBack      – back button handler
 *   backLabel   – back button text, default '← Back'
 *   startLabel  – start button text, default 'Start'
 */
export default function GameOptionsPage({
  icon, title, subtitle,
  rules,
  options = [],
  onStart,
  onBack,
  backLabel  = '← Back',
  startLabel = 'Start',
}) {
  const hasOptions = options.length > 0
  const [selected, setSelected] = useState(hasOptions ? null : '__none__')
  const startRef = useRef(null)

  const canStart = selected !== null

  // Keyboard: Enter starts, arrow keys move between options
  useEffect(() => {
    function onKeyDown(e) {
      if (e.key === 'Enter' && canStart) {
        e.preventDefault()
        handleStart()
      }
      if (!hasOptions) return
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault()
        setSelected(prev => {
          const idx = options.findIndex(o => o.key === prev)
          const next = (idx + 1) % options.length
          return options[next].key
        })
      }
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault()
        setSelected(prev => {
          const idx = options.findIndex(o => o.key === prev)
          const next = (idx - 1 + options.length) % options.length
          return options[next].key
        })
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [canStart, selected, options, hasOptions])

  function handleStart() {
    if (!canStart) return
    onStart(selected === '__none__' ? null : selected)
  }

  // Right-click on start button also triggers start
  function onContextMenu(e) {
    e.preventDefault()
    handleStart()
  }

  return (
    <div className="gop-page">
      <button className="gop-back-btn" onClick={onBack}>{backLabel}</button>

      <div className="gop-body">
        <div className="gop-hero">
          <span className="gop-icon">{icon}</span>
          <h1 className="gop-title">{title}</h1>
          {subtitle && <p className="gop-subtitle">{subtitle}</p>}
        </div>

        {rules?.length > 0 && (
          <div className="gop-rules">
            {rules.map((rule, i) => <div key={i} className="gop-rule">{rule}</div>)}
          </div>
        )}

        {hasOptions && (
          <div className="gop-options">
            {options.map(opt => {
              const style = opt.color ? {
                '--c':        opt.color,
                '--c-bg':     opt.color + '12',
                '--c-bg-sel': opt.color + '22',
                '--c-ring':   opt.color + '55',
                '--c-shadow': opt.color + '44',
              } : {}
              return (
                <button
                  key={opt.key}
                  className={`gop-option${selected === opt.key ? ' gop-option--selected' : ''}`}
                  style={style}
                  onClick={() => setSelected(opt.key)}
                >
                  <span className="gop-option-stripe" />
                  <span className="gop-option-label">{opt.label}</span>
                  {opt.desc && <span className="gop-option-desc">{opt.desc}</span>}
                  {opt.badge !== undefined && (
                    <span className="gop-option-badge">{opt.badge}</span>
                  )}
                </button>
              )
            })}
          </div>
        )}
      </div>

      <div className="gop-footer">
        <button
          ref={startRef}
          className={`gop-start-btn${!canStart ? ' gop-start-btn--disabled' : ''}`}
          onClick={handleStart}
          onContextMenu={onContextMenu}
          disabled={!canStart}
        >
          {startLabel}
        </button>
        {hasOptions && !selected && (
          <p className="gop-hint">↑ Pick a level above</p>
        )}
      </div>
    </div>
  )
}
