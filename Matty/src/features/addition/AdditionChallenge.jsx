import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useHighScores } from '../../hooks/useHighScores'
import { useLocale } from '../../store/LocaleContext'
import { useAdditionGame } from './useAdditionGame'
import { LEVELS } from './additionEngine'
import { formatTime } from '../../utils/utils'
import GameOver from '../../components/GameOver'
import './AdditionChallenge.css'

export default function AdditionChallenge() {
  const navigate                 = useNavigate()
  const { scores, saveBestTime } = useHighScores()
  const { t }                    = useLocale()

  const game = useAdditionGame({
    saveBestTime:     (level, time) => saveBestTime('addition', level, time),
    getExistingScore: (level)       => scores['addition']?.[level],
  })

  const {
    level, grid, target, selected, wrongPair,
    elapsed, started, completed, isNewBest,
    focusedIdx, cols, selectLevel, startGame, playAgain, stopGame, selectCell,
  } = game

  const [mouseReady, setMouseReady] = useState(false)
  useEffect(() => {
    if (!started || completed) return
    const onMove = () => setMouseReady(true)
    const onKey  = (e) => {
      if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key))
        setMouseReady(false)
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('keydown', onKey)
    }
  }, [started, completed])

  // ── Level select ──────────────────────────────────────────────────
  if (!level) {
    const addScores = typeof scores['addition'] === 'object' ? scores['addition'] : {}
    return (
      <div className="add-page">
        <button className="add-back-btn" onClick={() => navigate('/')}>{t('back')}</button>
        <div className="add-header">
          <span className="add-big-icon">➕</span>
          <h1>{t('add_title')}</h1>
          <p>{t('add_subtitle')}</p>
        </div>
        <div className="add-level-grid">
          {Object.entries(LEVELS).map(([key, cfg]) => (
            <button
              key={key}
              className={`add-level-card add-level-${key}`}
              onClick={() => selectLevel(key)}
            >
              <span className="add-level-name">{t(cfg.labelKey)}</span>
              <span className="add-level-desc">{t(cfg.descKey)}</span>
              {addScores[key] !== undefined && (
                <span className="add-level-best">⏱ {formatTime(addScores[key])}</span>
              )}
            </button>
          ))}
        </div>
      </div>
    )
  }

  // ── Game screen ───────────────────────────────────────────────────
  return (
    <div className="add-page add-game">
      <div className="add-topbar">
        <button
          className="add-back-btn topbar-back"
          onClick={() => { stopGame(); selectLevel(null) }}
        >
          {t('add_levels')}
        </button>
        <div className="add-timer">{formatTime(elapsed)}</div>
        <div className="add-level-badge">{t(LEVELS[level].labelKey)}</div>
      </div>

      <div className="add-target-bar">
        {t('add_target')}: <span className="add-target-num">{target}</span>
      </div>

      {/* Start overlay */}
      {!started && (
        <div className="add-overlay">
          <div className="add-overlay-card">
            <p className="add-overlay-level">{t(LEVELS[level].labelKey)}</p>
            <p className="add-overlay-hint">{t('add_hint')}</p>
            <button className="add-start-btn" onClick={startGame}>{t('mult_start')}</button>
          </div>
        </div>
      )}

      {completed && (
        <GameOver
          overlay
          icon="🎉"
          title={t('add_complete')}
          result={formatTime(elapsed)}
          isNewBest={isNewBest}
          newBestLabel={t('add_new_best')}
          actions={[
            { label: t('add_play_again'),    onClick: playAgain,              primary: true },
            { label: t('add_change_level'),  onClick: () => selectLevel(null) },
            { label: t('mult_home'),         onClick: () => navigate('/') },
          ]}
        />
      )}

      <div className={`add-grid${mouseReady ? ' mouse-ready' : ''}`} style={{ '--cols': cols }}>
        {grid.map((cell) => {
          const isSelected = selected === cell.id
          const isWrong    = wrongPair?.includes(cell.id)
          const isFocused = cell.id === focusedIdx
          let cls = 'add-cell'
          if (cell.matched)    cls += ' add-cell-matched'
          else if (isWrong)    cls += ' add-cell-wrong'
          else if (isSelected) cls += ' add-cell-selected'
          if (isFocused)       cls += ' add-cell-focused'

          return (
            <button
              key={cell.id}
              className={cls}
              onClick={() => started && !completed && selectCell(cell.id)}
              disabled={cell.matched || !started || completed}
            >
              {cell.matched ? null : cell.value}
            </button>
          )
        })}
      </div>
    </div>
  )
}
