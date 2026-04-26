import { useState, useEffect, useCallback, useRef } from 'react'
import { LEVELS, generateQuestion } from './sequenceEngine'
import { useGameLogger } from '../../hooks/useGameLogger'

const ENDURANCE_SECS = 3 * 60

export function useSequenceGame({ saveScore, getExistingScore, gameMode = 'lives' }) {
  const log = useGameLogger('sequence')

  const [level,       setLevel]       = useState(null)
  const [gameState,   setGameState]   = useState('idle')
  const [lives,       setLives]       = useState(3)
  const [score,       setScore]       = useState(0)
  const [question,    setQuestion]    = useState(null)
  const [feedback,    setFeedback]    = useState(null)
  const [isNewBest,   setIsNewBest]   = useState(false)
  const [crackingIdx, setCrackingIdx] = useState(null)
  const [gameSecsLeft, setGameSecsLeft] = useState(ENDURANCE_SECS)

  const livesRef    = useRef(3)
  const scoreRef    = useRef(0)
  const levelRef    = useRef(null)
  const frozenRef   = useRef(false)
  const gameModeRef = useRef(gameMode)
  const gameSecsRef = useRef(ENDURANCE_SECS)

  useEffect(() => { gameModeRef.current = gameMode }, [gameMode])

  const maxLives = LEVELS[level]?.MAX_LIVES ?? 3

  const nextQuestion = useCallback(() => {
    if (!levelRef.current) return
    const q = generateQuestion(levelRef.current)
    frozenRef.current = false
    setQuestion(q)
    setFeedback(null)
    log('question', { answer: q.answer, pattern: q.pattern })
  }, [log])

  const endGame = useCallback(() => {
    frozenRef.current = true
    const finalScore = scoreRef.current
    const existing   = getExistingScore(levelRef.current)
    const newBest    = existing === undefined || finalScore > existing
    if (newBest) saveScore(levelRef.current, finalScore)
    setIsNewBest(newBest)
    setGameState('gameover')
    log('end', { score: finalScore, newBest })
  }, [getExistingScore, saveScore, log])

  const loseLife = useCallback(() => {
    if (gameModeRef.current === 'endurance') {
      setTimeout(() => nextQuestion(), 1000)
      return
    }
    const idx = livesRef.current - 1
    setCrackingIdx(idx)
    setTimeout(() => {
      setCrackingIdx(null)
      livesRef.current -= 1
      setLives(livesRef.current)
      if (livesRef.current <= 0) { endGame(); return }
      nextQuestion()
    }, 600)
  }, [endGame, nextQuestion])

  const handleSelect = useCallback((choice) => {
    if (feedback || frozenRef.current) return
    if (choice === question.answer) {
      scoreRef.current += 1
      setScore(scoreRef.current)
      setFeedback({ type: 'correct' })
      log('correct', { choice, score: scoreRef.current })
      setTimeout(() => nextQuestion(), 600)
    } else {
      frozenRef.current = true
      setFeedback({ type: 'wrong', selected: choice, correct: question.answer })
      log('wrong', { choice, correct: question.answer })
      setTimeout(() => loseLife(), 900)
    }
  }, [feedback, question, nextQuestion, loseLife, log])

  // Keyboard 1-4
  useEffect(() => {
    if (gameState !== 'playing' || feedback) return
    const onKey = (e) => {
      const idx = ['1','2','3','4'].indexOf(e.key)
      if (idx !== -1 && question?.choices[idx] !== undefined) {
        handleSelect(question.choices[idx])
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [gameState, feedback, question, handleSelect])

  // 3-minute game timer (endurance mode only)
  useEffect(() => {
    if (gameMode !== 'endurance') return
    if (gameState !== 'playing') return
    const id = setInterval(() => {
      gameSecsRef.current -= 1
      setGameSecsLeft(gameSecsRef.current)
      if (gameSecsRef.current <= 0) {
        clearInterval(id)
        endGame()
      }
    }, 1000)
    return () => clearInterval(id)
  }, [gameState, gameMode, endGame])

  const startGame = useCallback((lvl) => {
    const cfg = LEVELS[lvl]
    livesRef.current  = cfg.MAX_LIVES
    scoreRef.current  = 0
    levelRef.current  = lvl
    frozenRef.current = false
    gameSecsRef.current = ENDURANCE_SECS
    setLevel(lvl)
    setLives(cfg.MAX_LIVES)
    setScore(0)
    setIsNewBest(false)
    setGameSecsLeft(ENDURANCE_SECS)
    setGameState('playing')
    log('start', { level: lvl, maxLives: cfg.MAX_LIVES })
    const q = generateQuestion(lvl)
    setQuestion(q)
    setFeedback(null)
  }, [log])

  const playAgain   = useCallback(() => startGame(level),  [startGame, level])
  const selectLevel = useCallback((lvl) => { setLevel(lvl); setGameState('idle') }, [])

  const mm = Math.floor(gameSecsLeft / 60)
  const ss = String(gameSecsLeft % 60).padStart(2, '0')

  return {
    level, gameState, lives, maxLives, score, question,
    feedback, isNewBest, crackingIdx,
    gameMinsLeft: `${mm}:${ss}`,
    maxLives: gameMode === 'endurance' ? 0 : maxLives,
    handleSelect, startGame, playAgain, selectLevel,
  }
}
