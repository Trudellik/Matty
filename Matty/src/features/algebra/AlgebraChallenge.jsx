import { useNavigate } from 'react-router-dom'
import { useHighScores } from '../../hooks/useHighScores'
import { useLocale } from '../../store/LocaleContext'
import { useAlgebraGame } from './useAlgebraGame'
import { LEVELS } from './algebraEngine'
import GameIdle from '../../components/GameIdle'
import GameOver from '../../components/GameOver'
import GameHeader from '../../components/GameHeader'
import './AlgebraChallenge.css'

export default function AlgebraChallenge() {
  const navigate              = useNavigate()
  const { scores, saveScore } = useHighScores()
  const { t }                 = useLocale()

  const game = useAlgebraGame({
    saveScore:        (s) => saveScore('algebra', s),
    getExistingScore: ()  => scores['algebra'],
  })

  const {
    level, gameState, lives, maxLives, score, question, typingValue,
    feedback, timeLeft, isNewBest, crackingIdx,
    startGame, playAgain, selectLevel,
  } = game

  // ── Level select ──────────────────────────────────────────────────
  if (gameState === 'idle' && !level) {
    const algScores = typeof scores['algebra'] === 'object' ? scores['algebra'] : {}
    return (
      <div className="alg-page">
        <button className="alg-back-btn" onClick={() => navigate('/')}>{t('back')}</button>
        <div className="alg-header">
          <span className="alg-big-icon">𝑥</span>
          <h1>{t('alg_title')}</h1>
          <p>{t('alg_subtitle')}</p>
        </div>
        <div className="alg-level-grid">
          {Object.entries(LEVELS).map(([key, cfg]) => (
            <button
              key={key}
              className={`alg-level-card alg-level-${key}`}
              onClick={() => startGame(key)}
            >
              <span className="alg-level-name">{t(cfg.labelKey)}</span>
              <span className="alg-level-desc">{t(cfg.descKey)}</span>
              {algScores[key] !== undefined && (
                <span className="alg-level-best">🏆 {algScores[key]}</span>
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
        title={t('alg_gameover')}
        result={score}
        resultLabel={t('alg_score')}
        isNewBest={isNewBest}
        newBestLabel={t('alg_new_best')}
        actions={[
          { label: t('alg_play_again'),    onClick: playAgain,                primary: true },
          { label: t('alg_change_level'),  onClick: () => selectLevel(null) },
          { label: t('mult_home'),         onClick: () => navigate('/') },
        ]}
      />
    )
  }

  // ── Game screen ───────────────────────────────────────────────────
  return (
    <div className="alg-page alg-game">
      <GameHeader
        onQuit={() => { selectLevel(null) }}
        quitLabel={t('alg_levels')}
        lives={lives}
        maxLives={maxLives}
        crackingIdx={crackingIdx}
        score={score}
        difficulty={level ? t(LEVELS[level].labelKey) : ''}
      />

      <div className="alg-arena">
        {question && (
          <>
            <div className="alg-equation">
              <span className="alg-lhs">{question.lhs}</span>
              <span className="alg-equals">=</span>
              <span className="alg-rhs">{question.rhs}</span>
            </div>
            <div className="alg-answer-row">
              <span className="alg-x-label">x</span>
              <span className="alg-eq">=</span>
              <span className="alg-input-box">
                {typingValue || <span className="alg-cursor">|</span>}
              </span>
            </div>
          </>
        )}
        <div className="alg-timer-num">{timeLeft}s</div>
      </div>

      {feedback && (
        <div className="alg-feedback">
          {feedback.type === 'correct' ? (
            <div className="alg-feedback-correct">✓</div>
          ) : (
            <div className="alg-feedback-wrong">
              <div className="alg-feedback-x">✗</div>
              {feedback.type === 'timeout'
                ? <div className="alg-feedback-timeout-icon">⏱</div>
                : null}
              <span className="alg-feedback-sep">→</span>
              <span className="alg-feedback-answer">{feedback.correctAnswer}</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
