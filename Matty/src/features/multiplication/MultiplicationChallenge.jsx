import { useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useHighScores } from '../../hooks/useHighScores'
import { useLocale } from '../../store/LocaleContext'
import { useMultiplicationGame } from './useMultiplicationGame'
import { LEVELS, isPrefilled } from './multiplicationEngine'
import { formatTime } from '../../utils/utils'
import GameOver from '../../components/GameOver'
import GameOptionsPage from '../../components/GameOptionsPage'
import ChallengePage from '../../pages/ChallengePage'
import './MultiplicationChallenge.css'

export default function MultiplicationChallenge() {
  const navigate                    = useNavigate()
  const { scores, saveBestTime, globalTimes, globalTimeHolder } = useHighScores()
  const timeBadge = (challengeId, level) => {
    const my = scores[challengeId]?.[level]
    const gl = globalTimes(challengeId)?.[level]
    const fmt = v => v !== undefined ? `⏱ ${formatTime(v)}` : undefined
    const myF = fmt(my), glF = fmt(gl)
    return (myF || glF) ? { my: myF, global: glF, globalHolder: globalTimeHolder(challengeId, level) } : undefined
  }
  const { t, homePath }             = useLocale()

  // D: inject score I/O — component doesn't know game internals
  const game = useMultiplicationGame({
    saveBestTime:    (level, time) => saveBestTime('multiplication', level, time),
    getExistingScore: (level)     => scores['multiplication']?.[level],
  })

  const {
    level, typingValue, filledCells,
    wrongFlash, wrongInfo, elapsed, completed, isNewBest,
    size, cellsToFill, activeCell, currentCellRef,
    selectLevel, playAgain, stopGame,
  } = game

  const inputRef    = useRef(null)
  const lastLevelRef = useRef(null)

  useEffect(() => {
    if (level && !completed) {
      inputRef.current?.focus()
    }
  }, [level, completed])

  // ── Level select ──────────────────────────────────────────────────
  if (!level) {
    const COLORS = { easy: '#22c55e', medium: '#f59e0b', hard: '#ef4444' }
    const options = Object.entries(LEVELS).map(([key, cfg]) => ({
      key,
      label: t(cfg.labelKey),
      desc:  t(cfg.descKey),
      badge: timeBadge('multiplication', key),
      color: COLORS[key],
    }))
    return (
      <GameOptionsPage
        icon="✖️"
        title={t('mult_title')}
        subtitle={t('mult_subtitle')}
        options={options}
        defaultSelected={lastLevelRef.current}
        onStart={(key) => { lastLevelRef.current = key; selectLevel(key) }}
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
      quitLabel={t('mult_levels')}
      score={formatTime(elapsed)}
      difficulty={t(LEVELS[level].labelKey)}
    >

      <input
        ref={inputRef}
        type="text"
        style={{ position: 'absolute', opacity: 0, pointerEvents: 'none', left: '-9999px' }}
        value=""
        readOnly
      />

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
            { label: t('mult_home'),         onClick: () => navigate(homePath()) },
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
    </ChallengePage>
  )
}
