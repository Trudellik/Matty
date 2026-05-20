import { useRef, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useHighScores } from '../../hooks/useHighScores'
import { useLocale } from '../../store/LocaleContext'
import { useMazeGame } from './useMazeGame'
import { GRID_SIZE } from './mazeEngine'
import { formatTime } from '../../utils/utils'
import GameOptionsPage from '../../components/GameOptionsPage'
import GameOver from '../../components/GameOver'
import ChallengePage from '../../pages/ChallengePage'
import './MazeChallenge.css'

const N = GRID_SIZE

export default function MazeChallenge() {
  const navigate              = useNavigate()
  const { scores, saveScore } = useHighScores()
  const { t, homePath }       = useLocale()

  const game = useMazeGame({
    saveScore:        (s) => saveScore('maze', s),
    getExistingScore: ()  => scores['maze'],
  })

  const {
    gameState, maze, position, visited, wrongCells,
    elapsed, score, isNewBest,
    handleMove, start, playAgain, MOVE_MAP,
  } = game

  const [targetMode,   setTargetMode]   = useState('random')
  const [customTarget, setCustomTarget] = useState(12)
  const [bumpDir,      setBumpDir]      = useState(null)

  const currentCellRef = useRef(null)
  const bumpTimerRef   = useRef(null)
  const touchStartRef  = useRef(null)

  useEffect(() => {
    currentCellRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' })
  }, [position.r, position.c])

  function tryMove(dr, dc) {
    const result = handleMove(dr, dc)
    if (result === 'blocked') {
      const dir = dr === -1 ? 'up' : dr === 1 ? 'down' : dc === -1 ? 'left' : 'right'
      clearTimeout(bumpTimerRef.current)
      setBumpDir(dir)
      bumpTimerRef.current = setTimeout(() => setBumpDir(null), 300)
    }
  }

  function onTouchStart(e) {
    const t = e.touches[0]
    touchStartRef.current = { x: t.clientX, y: t.clientY }
  }

  function onTouchEnd(e) {
    if (!touchStartRef.current) return
    const t  = e.changedTouches[0]
    const dx = t.clientX - touchStartRef.current.x
    const dy = t.clientY - touchStartRef.current.y
    touchStartRef.current = null
    if (Math.max(Math.abs(dx), Math.abs(dy)) < 20) return
    if (Math.abs(dx) > Math.abs(dy)) tryMove(0, dx > 0 ? 1 : -1)
    else                              tryMove(dy > 0 ? 1 : -1, 0)
  }

  const tryMoveRef = useRef(null)
  tryMoveRef.current = tryMove

  useEffect(() => {
    if (gameState !== 'playing') return
    function onKey(e) {
      const move = MOVE_MAP[e.key]
      if (move) { e.preventDefault(); tryMoveRef.current(...move) }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [gameState])

  if (gameState === 'idle') {
    return (
      <GameOptionsPage
        icon="🧩"
        title={t('maze_title')}
        subtitle={t('maze_subtitle')}
        rules={[
          t('maze_rule_nav'),
          t('maze_rule_valid'),
          t('maze_rule_red'),
          t('maze_rule_score'),
        ]}
        extra={
          <div className="maze-target-picker">
            <div className="maze-target-label">{t('maze_target_label')}</div>
            <div className="maze-target-toggle">
              <button
                className={`maze-target-btn${targetMode === 'random' ? ' maze-target-btn--active' : ''}`}
                onClick={() => setTargetMode('random')}
              >{t('maze_random')}</button>
              <button
                className={`maze-target-btn${targetMode === 'custom' ? ' maze-target-btn--active' : ''}`}
                onClick={() => setTargetMode('custom')}
              >{t('maze_custom')}</button>
            </div>
            {targetMode === 'custom' && (
              <div className="maze-target-stepper">
                <button className="maze-step-btn maze-step-btn--jump" onClick={() => setCustomTarget(v => Math.max(3, v - 10))}>−10</button>
                <button className="maze-step-btn" onClick={() => setCustomTarget(v => Math.max(3, v - 1))}>−</button>
                <span className="maze-step-val">{customTarget}</span>
                <button className="maze-step-btn" onClick={() => setCustomTarget(v => Math.min(100, v + 1))}>+</button>
                <button className="maze-step-btn maze-step-btn--jump" onClick={() => setCustomTarget(v => Math.min(100, v + 10))}>+10</button>
              </div>
            )}
          </div>
        }
        onStart={() => start(targetMode === 'custom' ? customTarget : undefined)}
        onBack={() => navigate(homePath())}
        backLabel={t('back')}
        startLabel={t('maze_start')}
      />
    )
  }

  if (gameState === 'won') {
    return (
      <GameOver
        icon="🎉"
        title={t('maze_complete')}
        result={score}
        resultLabel={t('maze_score_label')}
        isNewBest={isNewBest}
        newBestLabel={t('maze_new_best')}
        actions={[
          { label: t('maze_play_again'), onClick: playAgain, primary: true },
          { label: t('mult_home'),       onClick: () => navigate(homePath()) },
        ]}
      />
    )
  }

  return (
    <ChallengePage
      onQuit={() => navigate(homePath())}
      quitLabel={t('back')}
      score={formatTime(elapsed)}
      difficulty={String(maze.target)}
    >

      {/* Grid */}
      <div
        className="maze-grid-viewport"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <div className="maze-grid" style={{ gridTemplateColumns: `repeat(${N}, var(--maze-cell))` }}>
          {maze.grid.map((row, r) =>
            row.map((cell, c) => {
              const key       = `${r},${c}`
              const isCurrent = position.r === r && position.c === c
              const isVisited = visited.has(key)
              const isWrong   = wrongCells.has(key)
              const isEntry   = r === 0 && c === 0
              const isExit    = r === N - 1 && c === N - 1

              const cls = [
                'maze-cell',
                isCurrent                               ? 'maze-cell-current' : '',
                isCurrent && bumpDir                    ? `maze-cell-bump-${bumpDir}` : '',
                !isCurrent && isVisited                 ? 'maze-cell-path'    : '',
                !isCurrent && !isVisited && isWrong     ? 'maze-cell-wrong'   : '',
                isEntry && !isCurrent                   ? 'maze-cell-entry'   : '',
                isExit  && !isCurrent                   ? 'maze-cell-exit'    : '',
              ].filter(Boolean).join(' ')

              return (
                <div
                  key={key}
                  ref={isCurrent ? currentCellRef : null}
                  className={cls}
                >
                  {isEntry && !isCurrent ? '▶' : isExit && !isCurrent ? '★' : cell.expr}
                </div>
              )
            })
          )}
        </div>
      </div>

    </ChallengePage>
  )
}
