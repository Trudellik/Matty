import { useNavigate } from 'react-router-dom'
import { useLocale } from '../../store/LocaleContext'
import { useHighScores } from '../../hooks/useHighScores'
import { useColorMatchGame } from './useColorMatchGame'
import { LEVELS, ALL_BG_COLORS } from './colorMatchEngine'
import { formatTime } from '../../utils/utils'
import GameOver from '../../components/GameOver'
import GameOptionsPage from '../../components/GameOptionsPage'
import ChallengePage from '../../pages/ChallengePage'
import './ColorMatchChallenge.css'

function ColorBg() {
  return (
    <div className="cm-bg" aria-hidden="true">
      {Array.from({ length: 120 }, (_, i) => (
        <div
          key={i}
          className="cm-bg-cell"
          style={{ background: ALL_BG_COLORS[i % ALL_BG_COLORS.length] }}
        />
      ))}
    </div>
  )
}

export default function ColorMatchChallenge() {
  const navigate                 = useNavigate()
  const { t, homePath }          = useLocale()
  const { scores, saveBestTime } = useHighScores()

  const game = useColorMatchGame({
    saveBestTime:     (lvl, time) => saveBestTime('colormatch', lvl, time),
    getExistingScore: (lvl)       => scores['colormatch']?.[lvl],
  })

  const { level, grid, selected, wrongPair, elapsed, completed, isNewBest, selectLevel, playAgain, stopGame, selectCell } = game

  // ── Level select ──────────────────────────────────────────────────
  if (!level) {
    const cmScores = typeof scores['colormatch'] === 'object' ? scores['colormatch'] : {}
    const COLORS = { easy: '#22c55e', medium: '#f59e0b', hard: '#ef4444' }
    const options = Object.entries(LEVELS).map(([key, cfg]) => ({
      key,
      label: t(cfg.labelKey),
      desc:  t(cfg.descKey),
      badge: cmScores[key] !== undefined ? `⏱ ${formatTime(cmScores[key])}` : undefined,
      color: COLORS[key],
    }))

    return (
      <GameOptionsPage
        icon="🎨"
        title={t('cm_title')}
        subtitle={t('cm_subtitle')}
        options={options}
        onStart={(key) => selectLevel(key)}
        onBack={() => navigate(homePath())}
        backLabel={t('back')}
        startLabel={t('mult_start')}
        rules={[t('cm_rule_flip'), t('cm_rule_match'), t('cm_rule_time')]}
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
      className="cm-game"
    >
      <ColorBg />

      {completed && (
        <GameOver
          overlay
          icon="🎉"
          title={t('cm_complete')}
          result={formatTime(elapsed)}
          isNewBest={isNewBest}
          newBestLabel={t('cm_new_best')}
          actions={[
            { label: t('cm_play_again'),    onClick: playAgain,              primary: true },
            { label: t('add_change_level'), onClick: () => selectLevel(null) },
            { label: t('mult_home'),        onClick: () => navigate(homePath()) },
          ]}
        />
      )}

      <div
        className="cm-grid"
        style={{ '--cm-cols': cfg.cols, '--cm-rows': cfg.rows }}
      >
        {grid.map(cell => {
          const isSelected = selected === cell.id
          const isWrong    = wrongPair?.includes(cell.id)

          let cls = 'cm-cell'
          if (cell.matched)  cls += ' cm-cell--matched'
          else if (isWrong)  cls += ' cm-cell--wrong'
          else if (isSelected) cls += ' cm-cell--selected'

          return (
            <button
              key={cell.id}
              className={cls}
              onClick={() => selectCell(cell.id)}
              disabled={cell.matched || completed}
            >
              {cell.gif ? (
                <img src={cell.gif} alt={cell.value} draggable="false" />
              ) : (
                <span className="cm-cell-color" style={{ background: cell.color }} />
              )}
            </button>
          )
        })}
      </div>
    </ChallengePage>
  )
}
