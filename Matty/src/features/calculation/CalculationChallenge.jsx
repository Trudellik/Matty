import { useNavigate } from 'react-router-dom'
import { useHighScores } from '../../hooks/useHighScores'
import { useLocale } from '../../store/LocaleContext'
import { useCalculationGame } from './useCalculationGame'
import GameOptionsPage from '../../components/GameOptionsPage'
import GameOver from '../../components/GameOver'
import ChallengePage from '../../pages/ChallengePage'
import './CalculationChallenge.css'

export default function CalculationChallenge() {
  const navigate              = useNavigate()
  const { scores, saveScore } = useHighScores()
  const { t, homePath }       = useLocale()

  // D: inject score I/O — component doesn't know game internals
  const game = useCalculationGame({
    saveScore:        (score) => saveScore('calculation', score),
    getExistingScore: ()      => scores['calculation'],
  })

  const {
    gameState, lives, score, difficulty, streak, levelProgress,
    question, typingValue, timeLeft, feedback, isNewBest, crackingIdx, questionKey,
    timerDanger, ops, pointsToLevel, maxLives, timePerQ,
    handleStart,
  } = game

  // ── Idle ──────────────────────────────────────────────────────────
  if (gameState === 'idle') {
    return (
      <GameOptionsPage
        icon="⚡"
        title={t('calc_title')}
        subtitle={t('calc_subtitle')}
        rules={[
          `❤️❤️❤️ ${t('calc_rule_lives')}`,
          `⏱ ${t('calc_rule_time')}`,
          `🔥 ${t('calc_rule_streak')}`,
        ]}
        onStart={handleStart}
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
        title={t('calc_gameover')}
        result={score}
        resultLabel={t('calc_score')}
        isNewBest={isNewBest}
        newBestLabel={t('calc_new_best')}
        actions={[
          { label: t('calc_play_again'), onClick: handleStart, primary: true },
          { label: t('mult_home'),       onClick: () => navigate(homePath()) },
        ]}
      />
    )
  }

  // ── Game screen ───────────────────────────────────────────────────
  return (
    <ChallengePage
      onQuit={() => handleStart()}
      quitLabel="✕"
      lives={lives}
      maxLives={maxLives}
      crackingIdx={crackingIdx}
      score={score}
      difficulty={`${ops.join(' ')}  ${t('calc_level')} ${difficulty}`}
      timerKey={questionKey}
      timerDuration={timePerQ}
      timerDanger={timerDanger}
    >

      <div className="calc-progress-track">
        <div
          className="calc-progress-fill"
          style={{ width: `${(levelProgress / pointsToLevel) * 100}%` }}
        />
      </div>

      <div className="calc-arena">
        {question && (
          <div className="calc-question">
            <span className="calc-operand">{question.x}</span>
            <span className="calc-operator">{question.op}</span>
            <span className="calc-operand">{question.y}</span>
            <span className="calc-equals">=</span>
            <span className="calc-input-box">
              {typingValue || <span className="calc-cursor">|</span>}
            </span>
          </div>
        )}
        {streak >= 3 && <div className="calc-streak">🔥 ×{streak}</div>}
        <div className="calc-timer-num">{timeLeft}</div>
      </div>

      {feedback && (
        <div className={`calc-feedback calc-feedback-${feedback.type}`}>
          {feedback.type === 'correct' ? (
            <div className="calc-feedback-check">✓</div>
          ) : (
            <div className="calc-feedback-body">
              <div className="calc-feedback-x">✗</div>
              <div className="calc-feedback-equation">
                {feedback.type === 'wrong'   && <span className="calc-feedback-typed">{feedback.typed}</span>}
                {feedback.type === 'timeout' && <span className="calc-feedback-timeout">⏱</span>}
                <span className="calc-feedback-sep">→</span>
                <span className="calc-feedback-answer">{feedback.correctAnswer}</span>
              </div>
            </div>
          )}
        </div>
      )}
    </ChallengePage>
  )
}
