import { useNavigate } from 'react-router-dom'
import { useLocale } from '../../store/LocaleContext'
import { useHighScores } from '../../hooks/useHighScores'
import { useNumberGame } from './useNumberGame'
import { LEVELS, BG_NUMBERS, getNumberGifUrl } from './numberEngine'
import { formatTime } from '../../utils/utils'
import GameOver from '../../components/GameOver'
import GameOptionsPage from '../../components/GameOptionsPage'
import ChallengePage from '../../pages/ChallengePage'
import './NumberChallenge.css'

function NumberBg() {
  return (
    <div className="nb-bg" aria-hidden="true">
      {Array.from({ length: 120 }, (_, i) => (
        <span key={i} className="nb-bg-cell">{BG_NUMBERS[i % BG_NUMBERS.length]}</span>
      ))}
    </div>
  )
}

export default function NumberChallenge() {
  const navigate                 = useNavigate()
  const { t, homePath }          = useLocale()
  const { scores, saveBestTime, globalTimes, globalTimeHolder } = useHighScores()

  const game = useNumberGame({
    saveBestTime:     (lvl, time) => saveBestTime('number', lvl, time),
    getExistingScore: (lvl)       => scores['number']?.[lvl],
  })

  const { level, grid, selected, wrongPair, elapsed, completed, isNewBest, selectLevel, playAgain, stopGame, selectCell } = game

  // ── Level select ──────────────────────────────────────────────────
  if (!level) {
    const nbScores = typeof scores['number'] === 'object' ? scores['number'] : {}
    const glTimes  = globalTimes('number') ?? {}
    const COLORS   = { easy: '#22c55e', medium: '#f59e0b', hard: '#ef4444' }
    const timeBadge = (key) => {
      const my = nbScores[key] !== undefined ? `⏱ ${formatTime(nbScores[key])}` : undefined
      const gl = glTimes[key]  !== undefined ? `⏱ ${formatTime(glTimes[key])}` : undefined
      return (my || gl) ? { my, global: gl, globalHolder: globalTimeHolder('number', key) } : undefined
    }
    const options = Object.entries(LEVELS).map(([key, cfg]) => ({
      key,
      label: t(cfg.labelKey),
      desc:  t(cfg.descKey),
      badge: timeBadge(key),
      color: COLORS[key],
    }))

    return (
      <GameOptionsPage
        icon="🔢"
        title={t('nb_title')}
        subtitle={t('nb_subtitle')}
        options={options}
        onStart={(key) => selectLevel(key)}
        onBack={() => navigate(homePath())}
        backLabel={t('back')}
        startLabel={t('mult_start')}
        rules={[t('nb_rule_gif'), t('nb_rule_match'), t('nb_rule_time')]}
      />
    )
  }

  // ── Game screen ───────────────────────────────────────────────────
  const cfg = LEVELS[level]

  return (
    <ChallengePage
      onQuit={() => { stopGame(); selectLevel(null) }}
      quitLabel={t('add_levels')}
      score={formatTime(elapsed)}
      difficulty={t(LEVELS[level].labelKey)}
      className="nb-game"
    >
      <NumberBg />

      {completed && (
        <GameOver
          overlay
          icon="🎉"
          title={t('nb_complete')}
          result={formatTime(elapsed)}
          isNewBest={isNewBest}
          newBestLabel={t('nb_new_best')}
          actions={[
            { label: t('nb_play_again'),    onClick: playAgain,              primary: true },
            { label: t('add_change_level'), onClick: () => selectLevel(null) },
            { label: t('mult_home'),        onClick: () => navigate(homePath()) },
          ]}
        />
      )}

      <div
        className="nb-grid"
        style={{ '--nb-cols': cfg.cols, '--nb-rows': cfg.rows }}
      >
        {grid.map(cell => {
          const isSelected = selected === cell.id
          const isWrong    = wrongPair?.includes(cell.id)

          let cls = 'nb-cell'
          if (cell.matched)    cls += ' nb-cell--matched'
          else if (isWrong)    cls += ' nb-cell--wrong'
          else if (isSelected) cls += ' nb-cell--selected'

          return (
            <button
              key={cell.id}
              className={cls}
              onClick={() => selectCell(cell.id)}
              disabled={cell.matched || completed}
            >
              {!cell.matched && (cell.type === 'gif' ? (
                <img src={getNumberGifUrl(cell.value)} alt={cell.value} draggable="false" />
              ) : (
                <span className="nb-cell-text">{cell.value}</span>
              ))}
            </button>
          )
        })}
      </div>
    </ChallengePage>
  )
}
