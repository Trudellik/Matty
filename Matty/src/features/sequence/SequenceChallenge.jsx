import { useNavigate } from 'react-router-dom'
import { useHighScores } from '../../hooks/useHighScores'
import { useLocale } from '../../store/LocaleContext'
import { useSequenceGame } from './useSequenceGame'
import { LEVELS } from './sequenceEngine'
import GameOver from '../../components/GameOver'
import GameOptionsPage from '../../components/GameOptionsPage'
import ChallengePage from '../../pages/ChallengePage'
import './SequenceChallenge.css'

export default function SequenceChallenge() {
  const navigate              = useNavigate()
  const { scores, saveScore } = useHighScores()
  const { t, homePath }       = useLocale()

  const game = useSequenceGame({
    saveScore:        (lvl, s) => saveScore(`sequence_${lvl}`, s),
    getExistingScore: (lvl)   => scores[`sequence_${lvl}`],
  })

  const {
    level, gameState, lives, maxLives, score, question,
    feedback, isNewBest, crackingIdx,
    handleSelect, startGame, playAgain, selectLevel,
  } = game

  // ── Level select ──────────────────────────────────────────────────
  if (gameState === 'idle') {
    const COLORS = { easy: '#22c55e', medium: '#f59e0b', hard: '#ef4444' }
    const options = Object.entries(LEVELS).map(([key, cfg]) => ({
      key,
      label: t(cfg.labelKey),
      desc:  t(cfg.descKey),
      badge: scores[`sequence_${key}`] !== undefined ? `🏆 ${scores[`sequence_${key}`]}` : undefined,
      color: COLORS[key],
    }))
    return (
      <GameOptionsPage
        icon="🔢"
        title={t('seq_title')}
        subtitle={t('seq_subtitle')}
        options={options}
        onStart={(key) => startGame(key)}
        onBack={() => navigate(homePath())}
        backLabel={t('back')}
        startLabel={t('mult_start')}
      />
    )
  }

  // ── Game over ─────────────────────────────────────────────────────
  if (gameState === 'gameover') {
    return (
      <GameOver
        title={t('seq_gameover')}
        result={score}
        resultLabel={t('seq_score')}
        isNewBest={isNewBest}
        newBestLabel={t('seq_new_best')}
        actions={[
          { label: t('seq_play_again'),   onClick: playAgain,              primary: true },
          { label: t('seq_change_level'), onClick: () => selectLevel(null) },
          { label: t('mult_home'),        onClick: () => navigate(homePath()) },
        ]}
      />
    )
  }

  // ── Game screen ───────────────────────────────────────────────────
  return (
    <ChallengePage
      onQuit={() => selectLevel(null)}
      quitLabel={t('seq_levels')}
      lives={lives}
      maxLives={maxLives}
      crackingIdx={crackingIdx}
      score={score}
      difficulty={level ? t(LEVELS[level].labelKey) : ''}
    >

      <div className="seq-arena">
        <div className="seq-question-label">{t('seq_question')}</div>

        {question && (
          <>
            <div className="seq-tiles">
              {question.display.map((val, i) => (
                <div
                  key={i}
                  className={`seq-tile${val === null ? ' seq-tile-blank' : ''}`}
                >
                  {val === null ? '?' : val}
                </div>
              ))}
            </div>

            <div className="seq-choices">
              {question.choices.map((c, i) => {
                const isCorrect = feedback && c === question.answer
                const isWrong   = feedback?.type === 'wrong' && c === feedback.selected
                return (
                  <button
                    key={i}
                    className={[
                      'seq-choice-btn',
                      isCorrect ? 'seq-choice-correct' : '',
                      isWrong   ? 'seq-choice-wrong'   : '',
                    ].filter(Boolean).join(' ')}
                    onClick={() => handleSelect(c)}
                    disabled={!!feedback}
                  >
                    {c}
                  </button>
                )
              })}
            </div>
          </>
        )}
      </div>
    </ChallengePage>
  )
}
