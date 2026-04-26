import { useState, useEffect, useRef } from 'react'
import {
  generateQuestion,
  getDifficultyConfig,
  computeLevelUp,
  GAME_CONFIG,
} from './calculationEngine'

const { MAX_LIVES, TIME_PER_Q, POINTS_TO_LEVEL } = GAME_CONFIG
const ENDURANCE_SECS = 3 * 60

export function useCalculationGame({ saveScore, getExistingScore, gameMode = 'lives' }) {
  const [gameState,      setGameState]      = useState('idle')
  const [lives,          setLives]          = useState(MAX_LIVES)
  const [score,          setScore]          = useState(0)
  const [difficulty,     setDifficulty]     = useState(1)
  const [streak,         setStreak]         = useState(0)
  const [levelProgress,  setLevelProgress]  = useState(0)
  const [question,       setQuestion]       = useState(null)
  const [typingValue,    setTypingValue]    = useState('')
  const [timeLeft,       setTimeLeft]       = useState(TIME_PER_Q)
  const [gameSecsLeft,   setGameSecsLeft]   = useState(ENDURANCE_SECS)
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
  const gameModeRef      = useRef(gameMode)
  const gameSecsRef      = useRef(ENDURANCE_SECS)

  useEffect(() => { diffRef.current      = difficulty    }, [difficulty])
  useEffect(() => { streakRef.current    = streak        }, [streak])
  useEffect(() => { levelProgRef.current = levelProgress }, [levelProgress])
  useEffect(() => { scoreRef.current     = score         }, [score])
  useEffect(() => { livesRef.current     = lives         }, [lives])
  useEffect(() => { questionRef.current  = question      }, [question])
  useEffect(() => { gameModeRef.current  = gameMode      }, [gameMode])

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

  function endGame() {
    const finalScore = scoreRef.current
    const existing   = getExistingScore()
    setIsNewBest(existing === undefined || finalScore > existing)
    saveScore(finalScore)
    setGameState('gameover')
  }

  function loseLife(type, typedVal) {
    frozenRef.current = true
    streakRef.current = 0
    setStreak(0)
    setFeedback({ type, typed: typedVal, correctAnswer: questionRef.current?.answer })
    setGameState('feedback')

    if (gameModeRef.current === 'endurance') {
      // In endurance mode wrong answer just shows feedback — no life lost
      setTimeout(() => nextQuestion(), 1300)
      return
    }

    const newLives   = livesRef.current - 1
    livesRef.current = newLives
    setCrackingIdx(newLives)
    setTimeout(() => setCrackingIdx(null), 900)
    setLives(newLives)

    setTimeout(() => {
      if (newLives <= 0) {
        endGame()
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
    gameSecsRef.current = ENDURANCE_SECS
    setLives(MAX_LIVES); setScore(0); setDifficulty(1)
    setStreak(0); setLevelProgress(0); setIsNewBest(false)
    setGameSecsLeft(ENDURANCE_SECS)
    nextQuestion(1)
  }

  // ── Effects ──────────────────────────────────────────────────────

  // Per-question countdown (lives mode only)
  useEffect(() => {
    if (gameState !== 'playing' || gameMode !== 'lives') return
    const countId   = setInterval(() => setTimeLeft((tl) => Math.max(0, tl - 1)), 1000)
    const timeoutId = setTimeout(() => handleTimeoutRef.current(), TIME_PER_Q * 1000)
    return () => { clearInterval(countId); clearTimeout(timeoutId) }
  }, [gameState, question, gameMode])

  // 3-minute game timer (endurance mode only)
  useEffect(() => {
    if (gameMode !== 'endurance') return
    if (gameState !== 'playing' && gameState !== 'feedback') return
    const id = setInterval(() => {
      gameSecsRef.current -= 1
      setGameSecsLeft(gameSecsRef.current)
      if (gameSecsRef.current <= 0) {
        clearInterval(id)
        frozenRef.current = true
        endGame()
      }
    }, 1000)
    return () => clearInterval(id)
  }, [gameState, gameMode]) // eslint-disable-line react-hooks/exhaustive-deps

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
        typingRef.current = ''
        setTypingValue('')
      }
    }

    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [gameState, question]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Public interface ─────────────────────────────────────────────

  const mm  = Math.floor(gameSecsLeft / 60)
  const ss  = String(gameSecsLeft % 60).padStart(2, '0')

  return {
    gameState, lives, score, difficulty, streak, levelProgress,
    question, typingValue, timeLeft, feedback, isNewBest, crackingIdx, questionKey,
    gameMinsLeft:  `${mm}:${ss}`,
    timerDanger:   timeLeft <= 2,
    ops:           getDifficultyConfig(difficulty).ops,
    pointsToLevel: POINTS_TO_LEVEL,
    maxLives:      gameMode === 'endurance' ? 0 : MAX_LIVES,
    timePerQ:      TIME_PER_Q,
    handleStart,
  }
}
