import { useRef, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useHighScores } from '../../hooks/useHighScores'
import { useLocale } from '../../store/LocaleContext'
import { useAlgebraGame } from './useAlgebraGame'
import { LEVELS } from './algebraEngine'
import GameOver from '../../components/GameOver'
import GameOptionsPage from '../../components/GameOptionsPage'
import GameModePicker from '../../components/GameModePicker'
import ChallengePage from '../../pages/ChallengePage'
import './AlgebraChallenge.css'

export default function AlgebraChallenge() {
  const navigate              = useNavigate()
  const { scores, saveScore, globalScore } = useHighScores()
  const scoreBadge = (key) => {
    const my = scores[key] !== undefined ? `🏆 ${scores[key]}` : undefined
    const gl = globalScore(key) !== undefined ? `🏆 ${globalScore(key)}` : undefined
    return (my || gl) ? { my, global: gl } : undefined
  }
  const { t, homePath }       = useLocale()
  const [gameMode, setGameMode] = useState('lives')

  const game = useAlgebraGame({
    saveScore:        (lvl, s) => saveScore(`algebra_${gameMode}_${lvl}`, s),
    getExistingScore: (lvl)   => scores[`algebra_${gameMode}_${lvl}`],
    gameMode,
  })

  const {
    level, gameState, lives, maxLives, score, question, typingValue,
    feedback, timeLeft, gameMinsLeft, isNewBest, crackingIdx,
    startGame, playAgain, selectLevel,
  } = game

  const inputRef    = useRef(null)
  const lastLevelRef = useRef(null)

  useEffect(() => {
    if (gameState === 'playing' && !feedback) {
      inputRef.current?.focus()
    }
  }, [gameState, feedback])

  // ── Level select ──────────────────────────────────────────────────
  if (gameState === 'idle' && !level) {
    const COLORS = { easy: '#22c55e', medium: '#f59e0b', hard: '#ef4444' }
    const options = Object.entries(LEVELS).map(([key, cfg]) => ({
      key,
      label: t(cfg.labelKey),
      desc:  t(cfg.descKey),
      badge: scoreBadge(`algebra_${gameMode}_${key}`),
      color: COLORS[key],
    }))
    return (
      <GameOptionsPage
        icon="𝑥"
        title={t('alg_title')}
        subtitle={t('alg_subtitle')}
        options={options}
        defaultSelected={lastLevelRef.current}
        extra={<GameModePicker value={gameMode} onChange={setGameMode} />}
        onStart={(key) => { lastLevelRef.current = key; startGame(key) }}
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
        title={t('alg_gameover')}
        result={score}
        resultLabel={t('alg_score')}
        isNewBest={isNewBest}
        newBestLabel={t('alg_new_best')}
        actions={[
          { label: t('alg_play_again'),    onClick: playAgain,                primary: true },
          { label: t('alg_change_level'),  onClick: () => selectLevel(null) },
          { label: t('mult_home'),         onClick: () => navigate(homePath()) },
        ]}
      />
    )
  }

  // ── Game screen ───────────────────────────────────────────────────
  return (
    <ChallengePage
      onQuit={() => { selectLevel(null) }}
      quitLabel={t('alg_levels')}
      lives={gameMode === 'endurance' ? undefined : lives}
      maxLives={maxLives}
      crackingIdx={crackingIdx}
      score={score}
      difficulty={
        gameMode === 'endurance' && level
          ? `${t(LEVELS[level].labelKey)}  ⏱ ${gameMinsLeft}`
          : level ? t(LEVELS[level].labelKey) : ''
      }
    >

      <input
        ref={inputRef}
        type="text"
        style={{ position: 'absolute', opacity: 0, pointerEvents: 'none', left: '-9999px' }}
        value=""
        readOnly
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
        {gameMode === 'lives' && <div className="alg-timer-num">{timeLeft}s</div>}
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
    </ChallengePage>
  )
}
