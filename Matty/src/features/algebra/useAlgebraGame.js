import { useState, useEffect, useCallback, useRef } from 'react'
import { LEVELS } from './algebraEngine'
import { useGameLogger } from '../../hooks/useGameLogger'

export function useAlgebraGame({ saveScore, getExistingScore }) {
  const log = useGameLogger('algebra')

  const [level,       setLevel]       = useState(null)
  const [gameState,   setGameState]   = useState('idle') // idle | playing | gameover
  const [lives,       setLives]       = useState(3)
  const [score,       setScore]       = useState(0)
  const [question,    setQuestion]    = useState(null)
  const [typingValue, setTypingValue] = useState('')
  const [feedback,    setFeedback]    = useState(null) // { type: 'correct'|'wrong', correctAnswer }
  const [timeLeft,    setTimeLeft]    = useState(0)
  const [isNewBest,   setIsNewBest]   = useState(false)
  const [crackingIdx, setCrackingIdx] = useState(null)

  const timerRef    = useRef(null)
  const livesRef    = useRef(3)
  const scoreRef    = useRef(0)
  const levelRef    = useRef(null)

  const maxLives = LEVELS[level]?.MAX_LIVES ?? 3

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

  // Timer tick
  useEffect(() => {
    if (gameState !== 'playing' || feedback) return
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
  }, [gameState, question, feedback, loseLife, log])

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
    setLevel(lvl)
    setLives(cfg.MAX_LIVES)
    setScore(0)
    setIsNewBest(false)
    setGameState('playing')
    log('start', { level: lvl, timePerQ: cfg.timePerQ, maxLives: cfg.MAX_LIVES })
    const q = cfg.generate()
    setQuestion(q)
    setTypingValue('')
    setFeedback(null)
    setTimeLeft(cfg.timePerQ)
  }, [log])

  const playAgain   = useCallback(() => startGame(level),  [startGame, level])
  const selectLevel = useCallback((lvl) => { setLevel(lvl); setGameState('idle') }, [])

  return {
    level, gameState, lives, maxLives, score, question, typingValue,
    feedback, timeLeft, isNewBest, crackingIdx,
    startGame, playAgain, selectLevel,
  }
}
