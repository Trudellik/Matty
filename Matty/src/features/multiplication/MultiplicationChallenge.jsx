import { useNavigate } from 'react-router-dom'
import { useHighScores } from '../../hooks/useHighScores'
import { useLocale } from '../../store/LocaleContext'
import { useMultiplicationGame } from './useMultiplicationGame'
import { LEVELS, isPrefilled } from './multiplicationEngine'
import { formatTime } from '../../utils/utils'
import GameOver from '../../components/GameOver'
import './MultiplicationChallenge.css'

export default function MultiplicationChallenge() {
  const navigate                    = useNavigate()
  const { scores, saveBestTime }    = useHighScores()
  const { t }                       = useLocale()

  // D: inject score I/O — component doesn't know game internals
  const game = useMultiplicationGame({
    saveBestTime:    (level, time) => saveBestTime('multiplication', level, time),
    getExistingScore: (level)     => scores['multiplication']?.[level],
  })

  const {
    level, started, typingValue, filledCells,
    wrongFlash, wrongInfo, elapsed, completed, isNewBest,
    size, cellsToFill, activeCell, currentCellRef,
    selectLevel, startGame, playAgain, stopGame,
  } = game

  // ── Level select ──────────────────────────────────────────────────
  if (!level) {
    const multiScores = typeof scores['multiplication'] === 'object'
      ? scores['multiplication'] : {}
    return (
      <div className="mult-page">
        <button className="mult-back-btn" onClick={() => navigate('/')}>{t('back')}</button>
        <div className="mult-header">
          <span className="mult-big-icon">✖️</span>
          <h1>{t('mult_title')}</h1>
          <p>{t('mult_subtitle')}</p>
        </div>
        <div className="level-grid">
          {Object.entries(LEVELS).map(([key, cfg]) => (
            <button
              key={key}
              className={`level-card level-${key}`}
              onClick={() => selectLevel(key)}
            >
              <span className="level-name">{t(cfg.labelKey)}</span>
              <span className="level-desc">{t(cfg.descKey)}</span>
              {multiScores[key] !== undefined && (
                <span className="level-best">⏱ {formatTime(multiScores[key])}</span>
              )}
            </button>
          ))}
        </div>
      </div>
    )
  }

  // ── Game screen ───────────────────────────────────────────────────
  return (
    <div className="mult-page game-screen">
      <div className="game-topbar">
        <button
          className="mult-back-btn topbar-back"
          onClick={() => { stopGame(); selectLevel(null) }}
        >
          {t('mult_levels')}
        </button>
        <div className="game-timer">{formatTime(elapsed)}</div>
        <div className="game-level-badge">{t(LEVELS[level].labelKey)}</div>
      </div>

      {/* Start overlay */}
      {!started && (
        <div className="start-overlay">
          <div className="start-card">
            <p className="start-level-name">{t(LEVELS[level].labelKey)}</p>
            <p className="start-hint">
              {t('mult_cells_to_fill', { n: cellsToFill.length })}<br />
              {t('mult_type_hint')}
            </p>
            <button className="start-btn" onClick={startGame}>
              {t('mult_start')}
            </button>
          </div>
        </div>
      )}

      {/* Wrong answer overlay */}
      {wrongInfo && (
        <div className="wrong-overlay">
          <div className="wrong-card">
            <div className="wrong-x">✗</div>
            <div className="wrong-equation">
              <span className="wrong-label">{wrongInfo.row} * {wrongInfo.col}</span>
              <span className="wrong-neq">≠</span>
              <span className="wrong-typed">{wrongInfo.typed}</span>
            </div>
          </div>
        </div>
      )}

      {completed && (
        <GameOver
          overlay
          icon="🎉"
          title={t('mult_complete')}
          result={formatTime(elapsed)}
          isNewBest={isNewBest}
          newBestLabel={t('mult_new_best')}
          actions={[
            { label: t('mult_play_again'),   onClick: playAgain,              primary: true },
            { label: t('mult_change_level'), onClick: () => selectLevel(null) },
            { label: t('mult_home'),         onClick: () => navigate('/') },
          ]}
        />
      )}

      <div className="grid-scroll">
        <table className={`mult-grid level-${level}`}>
          <thead>
            <tr>
              <th className="corner-cell">1</th>
              {Array.from({ length: size - 1 }, (_, i) => (
                <th
                  key={i + 2}
                  className={`header-cell col-header${activeCell?.[1] === i + 2 ? ' header-highlight' : ''}`}
                >{i + 2}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: size - 1 }, (_, ri) => {
              const row = ri + 2
              return (
                <tr key={row}>
                  <th className={`header-cell row-header${activeCell?.[0] === row ? ' header-highlight' : ''}`}>
                    {row}
                  </th>
                  {Array.from({ length: size - 1 }, (_, ci) => {
                    const col      = ci + 2
                    const filled   = isPrefilled(row, col, level)
                    const isActive = !filled && activeCell?.[0] === row && activeCell?.[1] === col
                    const isDone   = filledCells[`${row},${col}`]
                    const isInLine = !isActive && activeCell && (row === activeCell[0] || col === activeCell[1])

                    let cls = 'grid-cell'
                    if (filled)                    cls += ' cell-prefilled'
                    else if (isActive && wrongFlash) cls += ' cell-wrong'
                    else if (isActive)              cls += ' cell-active'
                    else if (isDone)                cls += ' cell-correct'
                    if (isInLine)                   cls += ' cell-highlight'

                    return (
                      <td key={col} className={cls} ref={isActive ? currentCellRef : null}>
                        {filled ? (
                          <span className="prefilled-val">{row * col}</span>
                        ) : isActive ? (
                          <span className="active-val">
                            {typingValue || <span className="cursor">|</span>}
                          </span>
                        ) : isDone ? (
                          <span className="filled-val">{row * col}</span>
                        ) : null}
                      </td>
                    )
                  })}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
