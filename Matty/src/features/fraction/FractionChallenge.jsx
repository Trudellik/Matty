import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useHighScores } from '../../hooks/useHighScores'
import { useLocale } from '../../store/LocaleContext'
import { useFractionGame } from './useFractionGame'
import GameOptionsPage from '../../components/GameOptionsPage'
import GameModePicker from '../../components/GameModePicker'
import ScoreBadges from '../../components/ScoreBadges'
import GameOver from '../../components/GameOver'
import ChallengePage from '../../pages/ChallengePage'
import './FractionChallenge.css'

export default function FractionChallenge() {
  const navigate              = useNavigate()
  const { scores, saveScore, globalScore, globalScoreHolder } = useHighScores()
  const { t, homePath }       = useLocale()
  const [gameMode, setGameMode] = useState('lives')

  const scoreKey = `fractions_${gameMode}`
  const myBest = scores[scoreKey] !== undefined ? String(scores[scoreKey]) : undefined
  const glBest = globalScore(scoreKey) !== undefined ? String(globalScore(scoreKey)) : undefined

  const game = useFractionGame({
    saveScore:        (s) => saveScore(scoreKey, s),
    getExistingScore: ()  => scores[scoreKey],
    gameMode,
  })

  const {
    gameState, lives, score, fractions, remaining, focusedId, feedback, isNewBest, crackingIdx,
    maxLives, gameMinsLeft,
    handleSelect,
    start, playAgain,
  } = game

  // Idle screen
  if (gameState === 'idle') {
    return (
      <GameOptionsPage
        icon="½"
        title={t('frac_title')}
        subtitle={t('frac_subtitle')}
        extra={<>
          <ScoreBadges my={myBest} global={glBest} globalHolder={globalScoreHolder(scoreKey)} />
          <GameModePicker value={gameMode} onChange={setGameMode} />
        </>}
        onStart={start}
        onBack={() => navigate(homePath())}
        backLabel={t('back')}
        startLabel={t('frac_start')}
      />
    )
  }

  // Game over screen
  if (gameState === 'gameover') {
    return (
      <GameOver
        title={t('frac_gameover')}
        result={score}
        resultLabel={t('frac_score')}
        isNewBest={isNewBest}
        newBestLabel={t('frac_new_best')}
        actions={[
          { label: t('frac_play_again'), onClick: playAgain,          primary: true },
          { label: t('mult_home'),       onClick: () => navigate(homePath()) },
        ]}
      />
    )
  }

  // Playing screen
  return (
    <ChallengePage
      onQuit={() => navigate(homePath())}
      quitLabel={t('back')}
      lives={gameMode === 'endurance' ? undefined : lives}
      maxLives={maxLives}
      crackingIdx={crackingIdx}
      score={score}
      difficulty={gameMode === 'endurance' ? `⏱ ${gameMinsLeft}` : undefined}
    >

      <p className="frac-instruction">{t('frac_instruction')}</p>

      <div className="frac-arena">
        {fractions.map((f, i) => {
          const arrows        = fractions.length === 3 ? ['◀', '▲', '▶'] : ['◀', '▶', '▲', '▼']
          const isPicked      = !remaining.some(r => r.id === f.id)
          const isCorrectPick = feedback?.type === 'correct' && feedback.id === f.id
          const isWrongPick   = feedback?.type === 'wrong'   && feedback.selectedId === f.id
          const isCorrectHint = feedback?.type === 'wrong'   && feedback.correctId  === f.id
          const isFocused     = f.id === focusedId && !feedback && !isPicked

          return (
            <button
              key={f.id}
              className={[
                'frac-card',
                isFocused || isCorrectPick || isPicked ? 'frac-card-focused' : '',
                isCorrectPick || isPicked              ? 'frac-card-correct'  : '',
                isWrongPick                            ? 'frac-card-wrong'    : '',
                isCorrectHint                          ? 'frac-card-correct'  : '',
              ].filter(Boolean).join(' ')}
              onClick={() => handleSelect(f.id)}
              disabled={!!feedback || isPicked}
            >
              <span className="frac-card-arrow">{arrows[i]}</span>
              <span className="frac-numer">{f.numer}</span>
              <span className="frac-line" />
              <span className="frac-denom">{f.denom}</span>
            </button>
          )
        })}
      </div>
    </ChallengePage>
  )
}
