import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useHighScores } from '../../hooks/useHighScores'
import { useLocale } from '../../store/LocaleContext'
import { useAdditionGame } from './useAdditionGame'
import { LEVELS } from './additionEngine'
import { formatTime } from '../../utils/utils'
import GameOver from '../../components/GameOver'
import GameOptionsPage from '../../components/GameOptionsPage'
import ChallengePage from '../../pages/ChallengePage'
import './AdditionChallenge.css'

export default function AdditionChallenge() {
  const navigate                 = useNavigate()
  const { scores, saveBestTime } = useHighScores()
  const { t, homePath }          = useLocale()

  const game = useAdditionGame({
    saveBestTime:     (level, time) => saveBestTime('addition', level, time),
    getExistingScore: (level)       => scores['addition']?.[level],
  })

  const {
    level, grid, target, selected, wrongPair,
    elapsed, started, completed, isNewBest,
    focusedIdx, cols, selectLevel, playAgain, stopGame, selectCell,
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
    const COLORS = { easy: '#22c55e', medium: '#f59e0b', hard: '#ef4444' }
    const options = Object.entries(LEVELS).map(([key, cfg]) => ({
      key,
      label: t(cfg.labelKey),
      desc:  t(cfg.descKey),
      badge: addScores[key] !== undefined ? `⏱ ${formatTime(addScores[key])}` : undefined,
      color: COLORS[key],
    }))
    return (
      <GameOptionsPage
        icon="➕"
        title={t('add_title')}
        subtitle={t('add_subtitle')}
        options={options}
        onStart={(key) => selectLevel(key)}
        onBack={() => navigate(homePath())}
        backLabel={t('back')}
        startLabel={t('mult_start')}
      />
    )
  }

  // ── Game screen ───────────────────────────────────────────────────
  return (
    <ChallengePage
      onQuit={() => { stopGame(); selectLevel(null) }}
      quitLabel={t('add_levels')}
      score={formatTime(elapsed)}
      difficulty={t(LEVELS[level].labelKey)}
    >

      <div className="add-target-bar">
        {t('add_target')}: <span className="add-target-num">{target}</span>
      </div>

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
            { label: t('mult_home'),         onClick: () => navigate(homePath()) },
          ]}
        />
      )}

      <div className={`add-grid${mouseReady ? ' mouse-ready' : ''}`} style={{ '--cols': cols }}>
        {grid.map((cell) => {
          const isSelected = selected === cell.id
          const isWrong    = wrongPair?.includes(cell.id)
          const isFocused  = cell.id === focusedIdx
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
    </ChallengePage>
  )
}
