import { useNavigate } from 'react-router-dom'
import { useHighScores } from '../../hooks/useHighScores'
import { useLocale } from '../../store/LocaleContext'
import { useOperatorGame } from './useOperatorGame'
import { OP_ORDER, MODES } from './operatorEngine'
import GameOver from '../../components/GameOver'
import './OperatorChallenge.css'

const OP_META = {
  '+': { symbol: '+', arrow: '→', cls: 'op-plus'  },
  '-': { symbol: '−', arrow: '←', cls: 'op-minus' },
  '×': { symbol: '×', arrow: '↑', cls: 'op-times' },
  '÷': { symbol: '÷', arrow: '↓', cls: 'op-div'   },
}

export default function OperatorChallenge() {
  const navigate              = useNavigate()
  const { scores, saveScore } = useHighScores()
  const { t, homePath }       = useLocale()

  const game = useOperatorGame({
    saveScore:        (mode, s) => saveScore(`operator_${mode}`, s),
    getExistingScore: (mode)    => scores[`operator_${mode}`],
  })

  const {
    mode, gameState, lives, correct, question, filledOps, feedback, isNewBest, crackingIdx,
    timerKey, timeCap, streak,
    ops, maxLives, correctToLevel, levelProgress, difficulty,
    selectMode, handleAnswer, playAgain, backToModes,
  } = game

  // ── Mode select ───────────────────────────────────────────────────
  if (!mode) {
    return (
      <div className="op-page op-mode-select">
        <button className="op-back-btn" onClick={() => navigate(homePath())}>{t('back')}</button>
        <div className="op-mode-header">
          <span className="op-mode-icon">❓</span>
          <h1>{t('op_title')}</h1>
          <p>{t('op_subtitle')}</p>
        </div>
        <div className="op-mode-grid">
          {Object.entries(MODES).map(([key, cfg]) => {
            const best = scores[`operator_${key}`]
            return (
              <button
                key={key}
                className={`op-mode-card op-mode-${key}`}
                onClick={() => selectMode(key)}
              >
                <span className="op-mode-name">{t(cfg.labelKey)}</span>
                <span className="op-mode-ops">{cfg.ops.join('  ')}</span>
                <span className="op-mode-desc">{t(cfg.descKey)}</span>
                {best !== undefined && (
                  <span className="op-mode-best">🏆 {best}</span>
                )}
              </button>
            )
          })}
        </div>
      </div>
    )
  }

  // ── Game over ─────────────────────────────────────────────────────
  if (gameState === 'gameover') {
    return (
      <GameOver
        title={t('op_gameover')}
        result={correct}
        resultLabel={t('op_score')}
        isNewBest={isNewBest}
        newBestLabel={t('op_new_best')}
        actions={[
          { label: t('op_play_again'),   onClick: playAgain,          primary: true },
          { label: t('op_change_mode'),  onClick: backToModes },
          { label: t('mult_home'),       onClick: () => navigate(homePath()) },
        ]}
      />
    )
  }

  // ── Game screen ───────────────────────────────────────────────────
  return (
    <div className="op-page op-game">
      <div className="op-topbar">
        <div className={`op-streak${streak >= 3 ? ' op-streak-hot' : ''}`}>
          <span className="op-streak-icon">{streak >= 3 ? '🔥' : '⚡'}</span>
          <span className="op-streak-count">{streak}</span>
        </div>
        <div className="op-lives">
          {Array.from({ length: maxLives }, (_, i) => {
            if (i === crackingIdx) return <span key={i} className="life-cracking">💔</span>
            if (i < lives)        return <span key={i} className="life-full">❤️</span>
            return                       <span key={i} className="life-lost">🖤</span>
          })}
        </div>
        <div className="op-score-display">{correct}</div>
        <div className="op-level-badge">{t('op_level')} {difficulty}</div>
      </div>

      <div className="op-timer-track">
        <div
          key={timerKey}
          className="op-timer-fill"
          style={{ animationDuration: `${timeCap}s` }}
        />
      </div>

      <div className="op-arena">
        {question && (
          <div className="op-equation">
            {question.terms.flatMap((term, i) => {
              const parts = [
                <span key={`t${i}`} className="op-operand">{term}</span>,
              ]
              if (i < question.ops.length) {
                if (i < filledOps.length) {
                  parts.push(
                    <span key={`o${i}`} className="op-op-filled">{filledOps[i]}</span>,
                  )
                } else if (i === filledOps.length) {
                  parts.push(
                    <span key={`o${i}`} className="op-blank op-blank-active">?</span>,
                  )
                } else {
                  parts.push(
                    <span key={`o${i}`} className="op-blank op-blank-dim">?</span>,
                  )
                }
              }
              return parts
            })}
            <span className="op-equals">=</span>
            <span className="op-result">{question.result}</span>
          </div>
        )}
      </div>

      {/* Cross-shaped operator buttons */}
      <div className="op-btn-cross">
        {OP_ORDER.map((op) => {
          const meta      = OP_META[op]
          const available = ops.includes(op)
          return (
            <button
              key={op}
              className={`op-btn ${meta.cls}${available ? '' : ' op-btn-hidden'}`}
              onClick={() => available && handleAnswer(op)}
              disabled={!available}
              aria-hidden={!available}
            >
              <span className="op-btn-symbol">{meta.symbol}</span>
              <span className="op-btn-arrow">{meta.arrow}</span>
            </button>
          )
        })}
      </div>

      {feedback && (
        <div className={`op-feedback op-feedback-${feedback.type}`}>
          {feedback.type === 'correct' ? (
            <span className="op-feedback-check">✓</span>
          ) : (
            <span className="op-feedback-wrong">
              <span className="op-feedback-x">✗</span>
              <span className="op-feedback-correct-op">{feedback.correctOp}</span>
            </span>
          )}
        </div>
      )}
    </div>
  )
}
