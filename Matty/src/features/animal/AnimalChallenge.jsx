import { useNavigate } from 'react-router-dom'
import { useLocale } from '../../store/LocaleContext'
import { useHighScores } from '../../hooks/useHighScores'
import { useAnimalGame } from './useAnimalGame'
import { LEVELS, BG_ANIMALS, getAnimalGifUrl, getAnimalJpgUrl } from './animalEngine'
import { formatTime } from '../../utils/utils'
import GameOver from '../../components/GameOver'
import GameOptionsPage from '../../components/GameOptionsPage'
import ChallengePage from '../../pages/ChallengePage'
import './AnimalChallenge.css'

function AnimalBg() {
  return (
    <div className="an-bg" aria-hidden="true">
      {Array.from({ length: 120 }, (_, i) => (
        <img
          key={i}
          className="an-bg-cell"
          src={getAnimalGifUrl(BG_ANIMALS[i % BG_ANIMALS.length])}
          alt=""
          draggable="false"
        />
      ))}
    </div>
  )
}

export default function AnimalChallenge() {
  const navigate                 = useNavigate()
  const { t, homePath }          = useLocale()
  const { scores, saveBestTime, globalTimes, globalTimeHolder } = useHighScores()

  const game = useAnimalGame({
    saveBestTime:     (lvl, time) => saveBestTime('animal', lvl, time),
    getExistingScore: (lvl)       => scores['animal']?.[lvl],
  })

  const { level, grid, selected, wrongPair, elapsed, completed, isNewBest, selectLevel, playAgain, stopGame, selectCell } = game

  // ── Level select ──────────────────────────────────────────────────
  if (!level) {
    const anScores = typeof scores['animal'] === 'object' ? scores['animal'] : {}
    const glTimes  = globalTimes('animal') ?? {}
    const COLORS   = { easy: '#22c55e', medium: '#f59e0b', hard: '#ef4444' }
    const timeBadge = (key) => {
      const my = anScores[key] !== undefined ? `⏱ ${formatTime(anScores[key])}` : undefined
      const gl = glTimes[key]  !== undefined ? `⏱ ${formatTime(glTimes[key])}` : undefined
      return (my || gl) ? { my, global: gl, globalHolder: globalTimeHolder('animal', key) } : undefined
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
        icon="🦁"
        title={t('an_title')}
        subtitle={t('an_subtitle')}
        options={options}
        onStart={(key) => selectLevel(key)}
        onBack={() => navigate(homePath())}
        backLabel={t('back')}
        startLabel={t('mult_start')}
        rules={[t('an_rule_gif'), t('an_rule_match'), t('an_rule_time')]}
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
      className="an-game"
    >
      <AnimalBg />

      {completed && (
        <GameOver
          overlay
          icon="🎉"
          title={t('an_complete')}
          result={formatTime(elapsed)}
          isNewBest={isNewBest}
          newBestLabel={t('an_new_best')}
          actions={[
            { label: t('an_play_again'),    onClick: playAgain,              primary: true },
            { label: t('add_change_level'), onClick: () => selectLevel(null) },
            { label: t('mult_home'),        onClick: () => navigate(homePath()) },
          ]}
        />
      )}

      <div
        className="an-grid"
        style={{ '--an-cols': cfg.cols, '--an-rows': cfg.rows }}
      >
        {grid.map(cell => {
          const isSelected = selected === cell.id
          const isWrong    = wrongPair?.includes(cell.id)

          let cls = 'an-cell'
          if (cell.matched)    cls += ' an-cell--matched'
          else if (isWrong)    cls += ' an-cell--wrong'
          else if (isSelected) cls += ' an-cell--selected'

          return (
            <button
              key={cell.id}
              className={cls}
              onClick={() => selectCell(cell.id)}
              disabled={cell.matched || completed}
            >
              {!cell.matched && (
                <img
                  src={cell.type === 'gif' ? getAnimalGifUrl(cell.animal.id) : getAnimalJpgUrl(cell.animal.id)}
                  alt={cell.animal.en}
                  draggable="false"
                />
              )}
            </button>
          )
        })}
      </div>
    </ChallengePage>
  )
}
