import { useNavigate } from 'react-router-dom'
import { useHighScores } from '../../hooks/useHighScores'
import { useLocale } from '../../store/LocaleContext'
import { useSequenceGame } from './useSequenceGame'
import { LEVELS } from './sequenceEngine'
import GameOver from '../../components/GameOver'
import GameHeader from '../../components/GameHeader'
import './SequenceChallenge.css'

export default function SequenceChallenge() {
  const navigate              = useNavigate()
  const { scores, saveScore } = useHighScores()
  const { t }                 = useLocale()

  const game = useSequenceGame({
    saveScore:        (s) => saveScore('sequence', s),
    getExistingScore: ()  => scores['sequence'],
  })

  const {
    level, gameState, lives, maxLives, score, question,
    feedback, isNewBest, crackingIdx,
    handleSelect, startGame, playAgain, selectLevel,
  } = game

  // ── Level select ──────────────────────────────────────────────────
  if (gameState === 'idle') {
    const seqScores = typeof scores['sequence'] === 'object' ? scores['sequence'] : {}
    return (
      <div className="seq-page">
        <button className="seq-back-btn" onClick={() => navigate('/')}>{t('back')}</button>
        <div className="seq-header">
          <span className="seq-big-icon">🔢</span>
          <h1>{t('seq_title')}</h1>
          <p>{t('seq_subtitle')}</p>
        </div>
        <div className="seq-level-grid">
          {Object.entries(LEVELS).map(([key, cfg]) => (
            <button
              key={key}
              className={`seq-level-card seq-level-${key}`}
              onClick={() => startGame(key)}
            >
              <span className="seq-level-name">{t(cfg.labelKey)}</span>
              <span className="seq-level-desc">{t(cfg.descKey)}</span>
              {seqScores[key] !== undefined && (
                <span className="seq-level-best">🏆 {seqScores[key]}</span>
              )}
            </button>
          ))}
        </div>
      </div>
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
          { label: t('mult_home'),        onClick: () => navigate('/') },
        ]}
      />
    )
  }

  // ── Game screen ───────────────────────────────────────────────────
  return (
    <div className="seq-page seq-game">
      <GameHeader
        onQuit={() => selectLevel(null)}
        quitLabel={t('seq_levels')}
        lives={lives}
        maxLives={maxLives}
        crackingIdx={crackingIdx}
        score={score}
        difficulty={level ? t(LEVELS[level].labelKey) : ''}
      />

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
    </div>
  )
}
