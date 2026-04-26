import { useState, useEffect, useCallback, useRef } from 'react'
import { LEVELS } from './algebraEngine'
import { useGameLogger } from '../../hooks/useGameLogger'

const ENDURANCE_SECS = 3 * 60

export function useAlgebraGame({ saveScore, getExistingScore, gameMode = 'lives' }) {
  const log = useGameLogger('algebra')

  const [level,        setLevel]        = useState(null)
  const [gameState,    setGameState]    = useState('idle') // idle | playing | gameover
  const [lives,        setLives]        = useState(3)
  const [score,        setScore]        = useState(0)
  const [question,     setQuestion]     = useState(null)
  const [typingValue,  setTypingValue]  = useState('')
  const [feedback,     setFeedback]     = useState(null)
  const [timeLeft,     setTimeLeft]     = useState(0)
  const [gameSecsLeft, setGameSecsLeft] = useState(ENDURANCE_SECS)
  const [isNewBest,    setIsNewBest]    = useState(false)
  const [crackingIdx,  setCrackingIdx]  = useState(null)

  const timerRef    = useRef(null)
  const gameTimerRef = useRef(null)
  const livesRef    = useRef(3)
  const scoreRef    = useRef(0)
  const levelRef    = useRef(null)
  const gameModeRef = useRef(gameMode)
  const gameSecsRef = useRef(ENDURANCE_SECS)

  useEffect(() => { gameModeRef.current = gameMode }, [gameMode])

  const maxLives = gameMode === 'endurance' ? 0 : (LEVELS[level]?.MAX_LIVES ?? 3)

  const nextQuestion = useCallback(() => {
    if (!levelRef.current) return
    const q = LEVELS[levelRef.current].generate()
    setQuestion(q)
    setTypingValue('')
    setFeedback(null)
    setTimeLeft(LEVELS[levelRef.current].timePerQ)
    log('question', q)
  }, [log])

  const endGame = useCallback(() => {
    clearInterval(timerRef.current)
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
      // No lives in endurance — just move to next question after showing feedback
      setTimeout(() => nextQuestion(), 900)
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

  // Per-question timer tick (lives mode only)
  useEffect(() => {
    if (gameState !== 'playing' || feedback || gameMode !== 'lives') return
    clearInterval(timerRef.current)
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(timerRef.current)
          setFeedback({ type: 'timeout', correctAnswer: question?.answer })
          log('timeout', { correctAnswer: question?.answer })
          setTimeout(() => loseLife(), 900)
          return 0
        }
        return t - 1
      })
    }, 1000)
    return () => clearInterval(timerRef.current)
  }, [gameState, question, feedback, gameMode, loseLife, log])

  // 3-minute game timer (endurance mode only)
  useEffect(() => {
    if (gameMode !== 'endurance') return
    if (gameState !== 'playing' && gameState !== 'feedback') return
    clearInterval(gameTimerRef.current)
    gameTimerRef.current = setInterval(() => {
      gameSecsRef.current -= 1
      setGameSecsLeft(gameSecsRef.current)
      if (gameSecsRef.current <= 0) {
        clearInterval(gameTimerRef.current)
        endGame()
      }
    }, 1000)
    return () => clearInterval(gameTimerRef.current)
  }, [gameState, gameMode, endGame])

  // Keyboard input
  useEffect(() => {
    if (gameState !== 'playing' || feedback) return
    const onKey = (e) => {
      if (e.key === 'Backspace') {
        e.preventDefault()
        setTypingValue('')
      } else if (e.key === '-' && typingValue === '') {
        setTypingValue('-')
      } else if (/^\d$/.test(e.key)) {
        const next = typingValue + e.key
        setTypingValue(next)
        const parsed = parseInt(next, 10)
        if (!isNaN(parsed) && parsed === question?.answer) {
          clearInterval(timerRef.current)
          scoreRef.current += 1
          setScore(scoreRef.current)
          setFeedback({ type: 'correct' })
          log('correct', { typed: next, answer: question.answer, score: scoreRef.current })
          setTimeout(() => nextQuestion(), 600)
        }
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [gameState, feedback, typingValue, question, nextQuestion, log])

  const startGame = useCallback((lvl) => {
    const cfg = LEVELS[lvl]
    livesRef.current  = cfg.MAX_LIVES
    scoreRef.current  = 0
    levelRef.current  = lvl
    gameSecsRef.current = ENDURANCE_SECS
    setLevel(lvl)
    setLives(cfg.MAX_LIVES)
    setScore(0)
    setGameSecsLeft(ENDURANCE_SECS)
    setIsNewBest(false)
    setGameState('playing')
    log('start', { level: lvl, timePerQ: cfg.timePerQ, maxLives: cfg.MAX_LIVES, gameMode })
    const q = cfg.generate()
    setQuestion(q)
    setTypingValue('')
    setFeedback(null)
    setTimeLeft(cfg.timePerQ)
  }, [log])

  const playAgain   = useCallback(() => startGame(level),  [startGame, level])
  const selectLevel = useCallback((lvl) => { setLevel(lvl); setGameState('idle') }, [])

  const mm = Math.floor(gameSecsLeft / 60)
  const ss = String(gameSecsLeft % 60).padStart(2, '0')

  return {
    level, gameState, lives, maxLives, score, question, typingValue,
    feedback, timeLeft, gameMinsLeft: `${mm}:${ss}`, isNewBest, crackingIdx,
    startGame, playAgain, selectLevel,
  }
}
