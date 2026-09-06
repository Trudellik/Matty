import { useState } from 'react'
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
          src={getAnimalJpgUrl(BG_ANIMALS[i % BG_ANIMALS.length])}
          alt=""
          draggable="false"
        />
      ))}
    </div>
  )
}

const ALL_TYPES = ['gif', 'photo', 'word']

function TypePicker({ selected, onChange, t }) {
  function toggle(type) {
    if (selected.includes(type)) {
      if (selected.length <= 2) return
      onChange(selected.filter(x => x !== type))
    } else {
      onChange([...selected, type])
    }
  }

  return (
    <div className="an-type-picker">
      <span className="an-type-picker-label">{t('match_mode_label')}</span>
      <div className="an-type-picker-row">
        {ALL_TYPES.map(type => (
          <button
            key={type}
            className={`an-type-btn${selected.includes(type) ? ' an-type-btn--active' : ''}`}
            onClick={() => toggle(type)}
          >
            {t(`match_type_${type}`)}
          </button>
        ))}
      </div>
      <span className="an-type-picker-hint">
        {selected.length === 3 ? t('match_mode_triple') : t('match_mode_pair')}
      </span>
    </div>
  )
}

export default function AnimalChallenge() {
  const navigate                 = useNavigate()
  const { t, homePath, locale }  = useLocale()
  const { scores, saveBestTime, globalTimes, globalTimeHolder } = useHighScores()

  const [pendingTypes, setPendingTypes] = useState(['gif', 'photo'])

  const game = useAnimalGame({
    saveBestTime:     (lvl, time) => saveBestTime('animal', lvl, time),
    getExistingScore: (lvl)       => scores['animal']?.[lvl],
  })

  const { level, grid, selected, wrongGroup, elapsed, completed, isNewBest, dims, selectLevel, playAgain, stopGame, selectCell } = game

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

    const extra = <TypePicker selected={pendingTypes} onChange={setPendingTypes} t={t} />

    return (
      <GameOptionsPage
        icon="🦁"
        title={t('an_title')}
        subtitle={t('an_subtitle')}
        options={options}
        extra={extra}
        onStart={(key) => selectLevel(key, pendingTypes)}
        onBack={() => navigate(homePath())}
        backLabel={t('back')}
        startLabel={t('mult_start')}
        rules={[t('an_rule_gif'), t('an_rule_match'), t('an_rule_time')]}
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
        style={{ '--an-cols': dims.cols, '--an-rows': dims.rows }}
      >
        {grid.map(cell => {
          const isSelected = selected.includes(cell.id)
          const isWrong    = wrongGroup?.includes(cell.id)

          let cls = 'an-cell'
          if (cell.matched)    cls += ' an-cell--matched'
          else if (isWrong)    cls += ' an-cell--wrong'
          else if (isSelected) cls += ' an-cell--selected'
          if (cell.type === 'word') cls += ' an-cell--word'

          return (
            <button
              key={cell.id}
              className={cls}
              onClick={() => selectCell(cell.id)}
              disabled={cell.matched || completed}
            >
              {!cell.matched && cell.type === 'gif' && (
                <img src={getAnimalGifUrl(cell.animal.id)} alt={cell.animal.en} draggable="false" />
              )}
              {!cell.matched && cell.type === 'photo' && (
                <img src={getAnimalJpgUrl(cell.animal.id)} alt={cell.animal.en} draggable="false" />
              )}
              {!cell.matched && cell.type === 'word' && (
                <span className="an-cell-name">{locale === 'da' ? cell.animal.da : cell.animal.en}</span>
              )}
            </button>
          )
        })}
      </div>
    </ChallengePage>
  )
}
