import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLocale } from '../../store/LocaleContext'
import { useHighScores } from '../../hooks/useHighScores'
import { usePairingGame } from './usePairingGame'
import { formatTime } from '../../utils/utils'
import GameOver from '../../components/GameOver'
import GameOptionsPage from '../../components/GameOptionsPage'
import ChallengePage from '../../pages/ChallengePage'
import './PairingChallenge.css'

export default function PairingChallenge() {
  const navigate                        = useNavigate()
  const { t, homePath }                 = useLocale()
  const { scores, saveScore, saveBestTime, globalScore, globalTimes } = useHighScores()

  const [pairType, setPairType] = useState('color')   // 'color' | 'number' | 'alphabet'
  const [duration, setDuration] = useState('single')  // 'single' | 'timed'

  const scoreKey = `pairing_${duration}_${pairType}`

  const game = usePairingGame({
    mode: duration,
    pairType,
    startSize: 4,
    saveScore:        (s)    => saveScore(scoreKey, s),
    saveBestTime:     (time) => saveBestTime('pairing_single', pairType, time),
    getExistingScore: ()     => duration === 'single'
      ? scores['pairing_single']?.[pairType]
      : scores[scoreKey],
  })

  const {
    gameState, gridSize, grid, selected, wrongPair,
    score, timeLeft, elapsed, finalElapsed, completed, isNewBest,
    start, playAgain, selectCell,
  } = game

  // ── Idle screen ────────────────────────────────────────────────────
  if (gameState === 'idle') {
    const pairBadge = (key) => {
      if (duration === 'single') {
        const my = scores['pairing_single']?.[key]
        const gl = globalTimes('pairing_single')?.[key]
        const fmt = v => v !== undefined ? `⏱ ${formatTime(v)}` : undefined
        const myF = fmt(my), glF = fmt(gl)
        return (myF || glF) ? { my: myF, global: glF } : undefined
      }
      const scoreKey = `pairing_timed_${key}`
      const my = scores[scoreKey]
      const gl = globalScore(scoreKey)
      const myF = my !== undefined ? `🏆 ${my}` : undefined
      const glF = gl !== undefined ? `🏆 ${gl}` : undefined
      return (myF || glF) ? { my: myF, global: glF } : undefined
    }
    const PAIR_OPTIONS = [
      { key: 'color',    label: t('pair_type_color'),    desc: t('pair_type_color_desc'),    color: '#a855f7', badge: pairBadge('color') },
      { key: 'number',   label: t('pair_type_number'),   desc: t('pair_type_number_desc'),   color: '#3b82f6', badge: pairBadge('number') },
      { key: 'alphabet', label: t('pair_type_alphabet'), desc: t('pair_type_alphabet_desc'), color: '#22c55e', badge: pairBadge('alphabet') },
    ]

    const durationExtra = (
      <div className="pair-duration-picker">
        <span className="pair-picker-label">{t('add_duration_label')}</span>
        <div className="pair-picker-row">
          <button
            className={`pair-picker-btn${duration === 'single' ? ' pair-picker-btn--active' : ''}`}
            onClick={() => setDuration('single')}
          >{t('add_duration_single')}</button>
          <button
            className={`pair-picker-btn${duration === 'timed' ? ' pair-picker-btn--active' : ''}`}
            onClick={() => setDuration('timed')}
          >{t('add_duration_timed')}</button>
        </div>
      </div>
    )

    return (
      <GameOptionsPage
        icon="🔀"
        title={t('pair_title')}
        subtitle={t('pair_subtitle')}
        options={PAIR_OPTIONS}
        defaultSelected={pairType}
        extra={durationExtra}
        onStart={(key) => { setPairType(key); game.startWithType(key) }}
        onBack={() => navigate(homePath())}
        backLabel={t('back')}
        startLabel={t('pair_start')}
        rules={[
          t('pair_rule_match'),
          t('pair_rule_wild'),
          duration === 'timed' ? t('pair_rule_timed') : t('pair_rule_single'),
        ]}
      />
    )
  }

  // ── Game over ──────────────────────────────────────────────────────
  if (gameState === 'gameover') {
    if (completed) {
      return (
        <GameOver
          icon="🎉"
          title={t('pair_complete')}
          result={formatTime(finalElapsed)}
          isNewBest={isNewBest}
          newBestLabel={t('pair_new_best_time')}
          actions={[
            { label: t('pair_play_again'), onClick: playAgain,                primary: true },
            { label: t('mult_home'),       onClick: () => navigate(homePath()) },
          ]}
        />
      )
    }
    return (
      <GameOver
        title={t('pair_gameover')}
        result={score}
        resultLabel={t('pair_score_label')}
        isNewBest={isNewBest}
        newBestLabel={t('pair_new_best_score')}
        actions={[
          { label: t('pair_play_again'), onClick: playAgain,                primary: true },
          { label: t('mult_home'),       onClick: () => navigate(homePath()) },
        ]}
      />
    )
  }

  // ── Playing screen ─────────────────────────────────────────────────
  const timerDisplay = duration === 'timed' ? formatTime(timeLeft) : formatTime(elapsed)

  return (
    <ChallengePage
      onQuit={() => navigate(homePath())}
      quitLabel={t('back')}
      score={duration === 'timed' ? `${score} ${t('pair_rounds')}` : timerDisplay}
      difficulty={duration === 'timed' ? timerDisplay : t(`pair_type_${pairType}`)}
      className="pairing-game"
    >
      <p className="pair-instruction">
        {t(`pair_instruction_${pairType}`)}
      </p>

      <div className="pair-grid" style={{ '--pair-cols': gridSize }}>
        {grid.map(cell => {
          const isWild     = cell.value === null
          const isSelected = selected === cell.id
          const isWrong    = wrongPair?.includes(cell.id)
          const isColor    = pairType === 'color'

          // Color mode: replace matched cells with an invisible placeholder
          if (isColor && cell.matched) {
            return <div key={cell.id} className="pair-cell-gone" />
          }

          let cls = 'pair-cell'
          if (isWild)          cls += ' pair-cell--wild'
          if (cell.matched)    cls += ' pair-cell--matched'
          else if (isWrong)    cls += ' pair-cell--wrong'
          else if (isSelected) cls += ' pair-cell--selected'
          if (isColor)         cls += ' pair-cell--color'

          const style = {}
          if (isColor && !isWild) style['--cell-color'] = cell.value

          return (
            <button
              key={cell.id}
              className={cls}
              style={style}
              onClick={() => selectCell(cell.id)}
              disabled={isWild || cell.matched}
            >
              {!isColor && !isWild && (
                <span className="pair-cell-label">{cell.value}</span>
              )}
            </button>
          )
        })}
      </div>

      {duration === 'timed' && (
        <div className="pair-round-badge">
          {t('pair_grid_size')}: {gridSize}×{gridSize}
        </div>
      )}
    </ChallengePage>
  )
}
