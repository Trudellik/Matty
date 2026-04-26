import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useHighScores } from '../../hooks/useHighScores'
import { useLocale } from '../../store/LocaleContext'
import { useOperatorGame } from './useOperatorGame'
import { OP_ORDER, MODES } from './operatorEngine'
import GameOver from '../../components/GameOver'
import GameOptionsPage from '../../components/GameOptionsPage'
import GameModePicker from '../../components/GameModePicker'
import ChallengePage from '../../pages/ChallengePage'
import './OperatorChallenge.css'

const OP_META = {
  '+': { symbol: '+', arrow: '→', cls: 'op-plus'  },
  '-': { symbol: '−', arrow: '←', cls: 'op-minus' },
  '×': { symbol: '×', arrow: '↑', cls: 'op-times' },
  '÷': { symbol: '÷', arrow: '↓', cls: 'op-div'   },
}

export default function OperatorChallenge() {
  const navigate              = useNavigate()
  const { scores, saveScore, globalScore, globalScoreHolder } = useHighScores()
  const scoreBadge = (key) => {
    const my = scores[key] !== undefined ? String(scores[key]) : undefined
    const gl = globalScore(key) !== undefined ? String(globalScore(key)) : undefined
    return (my || gl) ? { my, global: gl, globalHolder: globalScoreHolder(key) } : undefined
  }
  const { t, homePath }       = useLocale()

  const lastModeRef = useRef(null)
  const [gameMode, setGameMode] = useState('lives')

  const game = useOperatorGame({
    saveScore:        (mode, s) => saveScore(`operator_${gameMode}_${mode}`, s),
    getExistingScore: (mode)    => scores[`operator_${gameMode}_${mode}`],
    gameMode,
  })

  const {
    mode, gameState, lives, correct, question, filledOps, feedback, isNewBest, crackingIdx,
    timerKey, timeCap, streak, gameMinsLeft,
    ops, maxLives, correctToLevel, levelProgress, difficulty,
    selectMode, handleAnswer, playAgain, backToModes,
  } = game

  // ── Mode select ───────────────────────────────────────────────────
  if (!mode) {
    const COLORS = { basic: '#3b82f6', full: '#a855f7' }
    const options = Object.entries(MODES).map(([key, cfg]) => ({
      key,
      label: t(cfg.labelKey),
      desc:  `${cfg.ops.join('  ')}  —  ${t(cfg.descKey)}`,
      badge: scoreBadge(`operator_${gameMode}_${key}`),
      color: COLORS[key],
    }))
    return (
      <GameOptionsPage
        icon="❓"
        title={t('op_title')}
        subtitle={t('op_subtitle')}
        options={options}
        extra={<GameModePicker value={gameMode} onChange={setGameMode} />}
        defaultSelected={lastModeRef.current}
        onStart={(key) => { lastModeRef.current = key; selectMode(key) }}
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
    <ChallengePage
      onQuit={backToModes}
      quitLabel={t('op_change_mode')}
      lives={gameMode === 'endurance' ? undefined : lives}
      maxLives={maxLives}
      crackingIdx={crackingIdx}
      streak={streak}
      score={correct}
      difficulty={
        gameMode === 'endurance'
          ? `${t('op_level')} ${difficulty}  ⏱ ${gameMinsLeft}`
          : `${t('op_level')} ${difficulty}`
      }
      timerKey={gameMode === 'lives' ? timerKey : undefined}
      timerDuration={gameMode === 'lives' ? timeCap : undefined}
    >

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
    </ChallengePage>
  )
}
