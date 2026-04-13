import { useColorPairGame } from './useColorPairGame'
import { formatTime } from '../../utils/utils'
import GameOver from '../../components/GameOver'
import ChallengePage from '../../pages/ChallengePage'
import './ColorPairChallenge.css'

/**
 * Props:
 *   duration      'single' | 'timed'
 *   setDuration   setter to change duration from idle screen
 *   setGameType   setter — calling setGameType('sum') goes back to sum mode idle
 *   t             translation function
 *   homePath      function → home path string
 *   navigate      react-router navigate
 */
export default function ColorPairChallenge({
  duration,
  setDuration,
  setGameType,
  t,
  homePath,
  navigate,
}) {
  const game = useColorPairGame({
    mode:      duration,
    startSize: 4,
  })

  const {
    gameState, gridSize, grid, selected, wrongPair,
    score, timeLeft, elapsed, completed,
    start, playAgain, selectCell,
  } = game

  // ── Idle screen ───────────────────────────────────────────────────
  if (gameState === 'idle') {
    return (
      <div className="color-pair-page">
        <button className="cp-back-btn" onClick={() => setGameType('sum')}>
          {t('back')}
        </button>

        <div className="cp-idle-content">
          <span className="cp-idle-icon">🎨</span>
          <h1>{t('cp_title')}</h1>
          <p className="cp-idle-subtitle">{t('cp_subtitle')}</p>

          <div className="cp-picker-group">
            <span className="cp-picker-label">{t('add_duration_label')}</span>
            <div className="cp-picker-row">
              <button
                className={`cp-picker-btn${duration === 'single' ? ' cp-picker-btn--active' : ''}`}
                onClick={() => setDuration('single')}
              >{t('add_duration_single')}</button>
              <button
                className={`cp-picker-btn${duration === 'timed' ? ' cp-picker-btn--active' : ''}`}
                onClick={() => setDuration('timed')}
              >{t('add_duration_timed')}</button>
            </div>
          </div>

          <ul className="cp-rules">
            <li>{t('cp_rule_pairs')}</li>
            <li>{t('cp_rule_wild')}</li>
            {duration === 'timed' && <li>{t('cp_rule_timed')}</li>}
          </ul>

          <button className="cp-start-btn" onClick={start}>
            {t('cp_start')}
          </button>
        </div>
      </div>
    )
  }

  // ── Game over (timed mode) ────────────────────────────────────────
  if (gameState === 'gameover') {
    return (
      <GameOver
        title={t('cp_gameover')}
        result={score}
        resultLabel={t('cp_score_label')}
        actions={[
          { label: t('cp_play_again'), onClick: playAgain, primary: true },
          { label: t('mult_home'),     onClick: () => navigate(homePath()) },
        ]}
      />
    )
  }

  // ── Playing screen ────────────────────────────────────────────────
  const timerDisplay = duration === 'timed'
    ? formatTime(timeLeft)
    : formatTime(elapsed)

  return (
    <ChallengePage
      onQuit={() => setGameType('sum')}
      quitLabel={t('back')}
      score={duration === 'timed' ? `${score} ${t('cp_rounds')}` : timerDisplay}
      difficulty={duration === 'timed' ? timerDisplay : undefined}
      className="color-pair-game"
    >
      {/* Single mode completion overlay */}
      {completed && (
        <GameOver
          overlay
          icon="🎉"
          title={t('cp_complete')}
          result={formatTime(elapsed)}
          actions={[
            { label: t('cp_play_again'),   onClick: playAgain,                 primary: true },
            { label: t('add_change_level'), onClick: () => setGameType('sum') },
            { label: t('mult_home'),        onClick: () => navigate(homePath()) },
          ]}
        />
      )}

      <p className="cp-instruction">{t('cp_instruction')}</p>

      <div
        className="cp-grid"
        style={{ '--cp-cols': gridSize }}
      >
        {grid.map(cell => {
          const isWild     = cell.color === null
          const isSelected = selected === cell.id
          const isWrong    = wrongPair?.includes(cell.id)

          let cls = 'cp-cell'
          if (isWild)     cls += ' cp-cell--wild'
          if (cell.matched) cls += ' cp-cell--matched'
          else if (isWrong)    cls += ' cp-cell--wrong'
          else if (isSelected) cls += ' cp-cell--selected'

          return (
            <button
              key={cell.id}
              className={cls}
              style={!isWild && !cell.matched ? { '--cell-color': cell.color } : {}}
              onClick={() => selectCell(cell.id)}
              disabled={isWild || cell.matched}
            />
          )
        })}
      </div>

      {duration === 'timed' && (
        <div className="cp-round-badge">
          {t('cp_grid_size')}: {gridSize}×{gridSize}
        </div>
      )}
    </ChallengePage>
  )
}
