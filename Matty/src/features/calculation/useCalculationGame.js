import { useState, useEffect, useRef } from 'react'
import {
  generateQuestion,
  getDifficultyConfig,
  computeLevelUp,
  GAME_CONFIG,
} from './calculationEngine'

const { MAX_LIVES, TIME_PER_Q, POINTS_TO_LEVEL } = GAME_CONFIG

/**
 * D: receives score I/O as injected functions — decoupled from challenge ID
 *    and from the shape of useHighScores.
 * I: only the two functions this hook actually needs are required.
 */
export function useCalculationGame({ saveScore, getExistingScore }) {
  const [gameState,      setGameState]      = useState('idle')
  const [lives,          setLives]          = useState(MAX_LIVES)
  const [score,          setScore]          = useState(0)
  const [difficulty,     setDifficulty]     = useState(1)
  const [streak,         setStreak]         = useState(0)
  const [levelProgress,  setLevelProgress]  = useState(0)
  const [question,       setQuestion]       = useState(null)
  const [typingValue,    setTypingValue]    = useState('')
  const [timeLeft,       setTimeLeft]       = useState(TIME_PER_Q)
  const [feedback,       setFeedback]       = useState(null)
  const [isNewBest,      setIsNewBest]      = useState(false)
  const [crackingIdx,    setCrackingIdx]    = useState(null)
  const [questionKey,    setQuestionKey]    = useState(0)

  // Refs — always-current values for use inside async callbacks
  const frozenRef        = useRef(false)
  const diffRef          = useRef(1)
  const streakRef        = useRef(0)
  const levelProgRef     = useRef(0)
  const scoreRef         = useRef(0)
  const livesRef         = useRef(MAX_LIVES)
  const questionRef      = useRef(null)
  const typingRef        = useRef('')
  const handleTimeoutRef = useRef(null)

  useEffect(() => { diffRef.current      = difficulty    }, [difficulty])
  useEffect(() => { streakRef.current    = streak        }, [streak])
  useEffect(() => { levelProgRef.current = levelProgress }, [levelProgress])
  useEffect(() => { scoreRef.current     = score         }, [score])
  useEffect(() => { livesRef.current     = lives         }, [lives])
  useEffect(() => { questionRef.current  = question      }, [question])

  // ── Actions ──────────────────────────────────────────────────────

  function nextQuestion(diff) {
    const q = generateQuestion(diff ?? diffRef.current)
    questionRef.current = q
    typingRef.current   = ''
    setQuestion(q)
    setTypingValue('')
    setTimeLeft(TIME_PER_Q)
    setFeedback(null)
    setQuestionKey((k) => k + 1)
    frozenRef.current = false
    setGameState('playing')
  }

  function handleCorrect() {
    frozenRef.current = true
    const { nextDiff, nextProgress } = computeLevelUp(
      diffRef.current, levelProgRef.current, streakRef.current, POINTS_TO_LEVEL,
    )
    const newScore  = scoreRef.current + diffRef.current
    const newStreak = streakRef.current + 1

    scoreRef.current     = newScore
    streakRef.current    = newStreak
    diffRef.current      = nextDiff
    levelProgRef.current = nextProgress

    setScore(newScore)
    setStreak(newStreak)
    setDifficulty(nextDiff)
    setLevelProgress(nextProgress)
    setFeedback({ type: 'correct', correctAnswer: questionRef.current.answer })
    setGameState('feedback')
    setTimeout(() => nextQuestion(nextDiff), 500)
  }

  function loseLife(type, typedVal) {
    frozenRef.current = true
    const newLives    = livesRef.current - 1
    livesRef.current  = newLives
    streakRef.current = 0

    setCrackingIdx(newLives)
    setTimeout(() => setCrackingIdx(null), 900)

    setLives(newLives)
    setStreak(0)
    setFeedback({ type, typed: typedVal, correctAnswer: questionRef.current?.answer })
    setGameState('feedback')

    setTimeout(() => {
      if (newLives <= 0) {
        const finalScore = scoreRef.current
        const existing   = getExistingScore()
        setIsNewBest(existing === undefined || finalScore > existing)
        saveScore(finalScore)
        setGameState('gameover')
      } else {
        nextQuestion()
      }
    }, newLives <= 0 ? 1800 : 1300)
  }

  // Updated every render so the timer closure always has the latest loseLife
  handleTimeoutRef.current = () => { if (!frozenRef.current) loseLife('timeout', '') }

  function handleStart() {
    diffRef.current = 1; streakRef.current = 0
    levelProgRef.current = 0; scoreRef.current = 0; livesRef.current = MAX_LIVES
    setLives(MAX_LIVES); setScore(0); setDifficulty(1)
    setStreak(0); setLevelProgress(0); setIsNewBest(false)
    nextQuestion(1)
  }

  // ── Effects ──────────────────────────────────────────────────────

  useEffect(() => {
    if (gameState !== 'playing') return
    const countId   = setInterval(() => setTimeLeft((tl) => Math.max(0, tl - 1)), 1000)
    const timeoutId = setTimeout(() => handleTimeoutRef.current(), TIME_PER_Q * 1000)
    return () => { clearInterval(countId); clearTimeout(timeoutId) }
  }, [gameState, question])

  useEffect(() => {
    if (gameState !== 'playing') return

    function onKey(e) {
      if (frozenRef.current) return
      const q = questionRef.current
      if (!q) return

      if (e.key >= '0' && e.key <= '9') {
        e.preventDefault()
        if (typingRef.current.length >= 4) return
        const next = typingRef.current + e.key
        const ans  = String(q.answer)
        typingRef.current = next
        setTypingValue(next)

        if (next === ans) {
          frozenRef.current = true
          handleCorrect()
        } else if (!ans.startsWith(next)) {
          frozenRef.current = true
          loseLife('wrong', next)
        }
      } else if (e.key === 'Backspace') {
        e.preventDefault()
        const next = typingRef.current.slice(0, -1)
        typingRef.current = next
        setTypingValue(next)
      }
    }

    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [gameState, question]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Public interface ─────────────────────────────────────────────

  return {
    gameState, lives, score, difficulty, streak, levelProgress,
    question, typingValue, timeLeft, feedback, isNewBest, crackingIdx, questionKey,
    timerDanger:   timeLeft <= 2,
    ops:           getDifficultyConfig(difficulty).ops,
    pointsToLevel: POINTS_TO_LEVEL,
    maxLives:      MAX_LIVES,
    timePerQ:      TIME_PER_Q,
    handleStart,
  }
}
