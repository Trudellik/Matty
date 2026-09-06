import { useState } from 'react'
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

const ALL_TYPES = ['gif', 'color', 'word']

function TypePicker({ selected, onChange, t }) {
  function toggle(type) {
    if (selected.includes(type)) {
      if (selected.length <= 2) return  // must keep at least 2
      onChange(selected.filter(x => x !== type))
    } else {
      onChange([...selected, type])
    }
  }

  return (
    <div className="cm-type-picker">
      <span className="cm-type-picker-label">{t('match_mode_label')}</span>
      <div className="cm-type-picker-row">
        {ALL_TYPES.map(type => (
          <button
            key={type}
            className={`cm-type-btn${selected.includes(type) ? ' cm-type-btn--active' : ''}`}
            onClick={() => toggle(type)}
          >
            {t(`match_type_${type}`)}
          </button>
        ))}
      </div>
      <span className="cm-type-picker-hint">
        {selected.length === 3 ? t('match_mode_triple') : t('match_mode_pair')}
      </span>
    </div>
  )
}

export default function ColorMatchChallenge() {
  const navigate                 = useNavigate()
  const { t, homePath }          = useLocale()
  const { scores, saveBestTime, globalTimes, globalTimeHolder } = useHighScores()

  const [pendingTypes, setPendingTypes] = useState(['gif', 'color'])

  const game = useColorMatchGame({
    saveBestTime:     (lvl, time) => saveBestTime('colormatch', lvl, time),
    getExistingScore: (lvl)       => scores['colormatch']?.[lvl],
  })

  const { level, grid, selected, wrongGroup, elapsed, completed, isNewBest, dims, selectLevel, playAgain, stopGame, selectCell } = game

  // ── Level select ──────────────────────────────────────────────────
  if (!level) {
    const cmScores = typeof scores['colormatch'] === 'object' ? scores['colormatch'] : {}
    const glTimes  = globalTimes('colormatch') ?? {}
    const COLORS   = { easy: '#22c55e', medium: '#f59e0b', hard: '#ef4444' }
    const timeBadge = (key) => {
      const my = cmScores[key] !== undefined ? `⏱ ${formatTime(cmScores[key])}` : undefined
      const gl = glTimes[key]  !== undefined ? `⏱ ${formatTime(glTimes[key])}` : undefined
      return (my || gl) ? { my, global: gl, globalHolder: globalTimeHolder('colormatch', key) } : undefined
    }
    const options = Object.entries(LEVELS).map(([key, cfg]) => ({
      key,
      label: t(cfg.labelKey),
      desc:  t(cfg.descKey),
      badge: timeBadge(key),
      color: COLORS[key],
    }))

    const extra = <TypePicker selected={pendingTypes} onChange={setPendingTypes} t={t} />

    return (
      <GameOptionsPage
        icon="🎨"
        title={t('cm_title')}
        subtitle={t('cm_subtitle')}
        options={options}
        extra={extra}
        onStart={(key) => selectLevel(key, pendingTypes)}
        onBack={() => navigate(homePath())}
        backLabel={t('back')}
        startLabel={t('mult_start')}
        rules={[t('cm_rule_flip'), t('cm_rule_match'), t('cm_rule_time')]}
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
        style={{ '--cm-cols': dims.cols, '--cm-rows': dims.rows }}
      >
        {grid.map(cell => {
          const isSelected = selected.includes(cell.id)
          const isWrong    = wrongGroup?.includes(cell.id)

          let cls = 'cm-cell'
          if (cell.matched)    cls += ' cm-cell--matched'
          else if (isWrong)    cls += ' cm-cell--wrong'
          else if (isSelected) cls += ' cm-cell--selected'
          if (cell.type === 'word') cls += ' cm-cell--word'

          return (
            <button
              key={cell.id}
              className={cls}
              onClick={() => selectCell(cell.id)}
              disabled={cell.matched || completed}
            >
              {!cell.matched && cell.type === 'gif' && (
                <img src={cell.gif} alt={cell.word} draggable="false" />
              )}
              {!cell.matched && cell.type === 'color' && (
                <span className="cm-cell-color" style={{ background: cell.color }} />
              )}
              {!cell.matched && cell.type === 'word' && (
                <span className="cm-cell-word">{cell.word}</span>
              )}
            </button>
          )
        })}
      </div>
    </ChallengePage>
  )
}
