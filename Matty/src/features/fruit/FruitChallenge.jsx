import { useNavigate } from 'react-router-dom'
import { useLocale } from '../../store/LocaleContext'
import { useHighScores } from '../../hooks/useHighScores'
import { useFruitGame } from './useFruitGame'
import { LEVELS, BG_FRUITS, getFruitGifUrl, getFruitPhotoUrl } from './fruitEngine'
import { formatTime } from '../../utils/utils'
import GameOver from '../../components/GameOver'
import GameOptionsPage from '../../components/GameOptionsPage'
import ChallengePage from '../../pages/ChallengePage'
import './FruitChallenge.css'

function FruitBg() {
  return (
    <div className="ft-bg" aria-hidden="true">
      {Array.from({ length: 120 }, (_, i) => (
        <img
          key={i}
          className="ft-bg-cell"
          src={getFruitPhotoUrl(BG_FRUITS[i % BG_FRUITS.length])}
          alt=""
          draggable="false"
        />
      ))}
    </div>
  )
}

export default function FruitChallenge() {
  const navigate                 = useNavigate()
  const { t, homePath }          = useLocale()
  const { scores, saveBestTime, globalTimes, globalTimeHolder } = useHighScores()

  const game = useFruitGame({
    saveBestTime:     (lvl, time) => saveBestTime('fruit', lvl, time),
    getExistingScore: (lvl)       => scores['fruit']?.[lvl],
  })

  const { level, grid, selected, wrongPair, elapsed, completed, isNewBest, selectLevel, playAgain, stopGame, selectCell } = game

  // ── Level select ──────────────────────────────────────────────────
  if (!level) {
    const ftScores = typeof scores['fruit'] === 'object' ? scores['fruit'] : {}
    const glTimes  = globalTimes('fruit') ?? {}
    const COLORS   = { easy: '#22c55e', medium: '#f59e0b', hard: '#ef4444' }
    const timeBadge = (key) => {
      const my = ftScores[key] !== undefined ? `⏱ ${formatTime(ftScores[key])}` : undefined
      const gl = glTimes[key]  !== undefined ? `⏱ ${formatTime(glTimes[key])}` : undefined
      return (my || gl) ? { my, global: gl, globalHolder: globalTimeHolder('fruit', key) } : undefined
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
        icon="🍎"
        title={t('ft_title')}
        subtitle={t('ft_subtitle')}
        options={options}
        onStart={(key) => selectLevel(key)}
        onBack={() => navigate(homePath())}
        backLabel={t('back')}
        startLabel={t('mult_start')}
        rules={[t('ft_rule_gif'), t('ft_rule_match'), t('ft_rule_time')]}
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
      className="ft-game"
    >
      <FruitBg />

      {completed && (
        <GameOver
          overlay
          icon="🎉"
          title={t('ft_complete')}
          result={formatTime(elapsed)}
          isNewBest={isNewBest}
          newBestLabel={t('ft_new_best')}
          actions={[
            { label: t('ft_play_again'),    onClick: playAgain,              primary: true },
            { label: t('add_change_level'), onClick: () => selectLevel(null) },
            { label: t('mult_home'),        onClick: () => navigate(homePath()) },
          ]}
        />
      )}

      <div
        className="ft-grid"
        style={{ '--ft-cols': cfg.cols, '--ft-rows': cfg.rows }}
      >
        {grid.map(cell => {
          const isSelected = selected === cell.id
          const isWrong    = wrongPair?.includes(cell.id)

          let cls = 'ft-cell'
          if (cell.matched)    cls += ' ft-cell--matched'
          else if (isWrong)    cls += ' ft-cell--wrong'
          else if (isSelected) cls += ' ft-cell--selected'

          return (
            <button
              key={cell.id}
              className={cls}
              onClick={() => selectCell(cell.id)}
              disabled={cell.matched || completed}
            >
              {!cell.matched && (
                <img
                  src={cell.type === 'gif' ? getFruitGifUrl(cell.fruit.id) : getFruitPhotoUrl(cell.fruit.id)}
                  alt={cell.fruit.en}
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
