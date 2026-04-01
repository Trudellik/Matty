import { useState, useEffect, useRef } from 'react'
import {
  generateQuestion, getDifficultyConfig,
  GAME_CONFIG, KEY_TO_OP,
} from './operatorEngine'

const { MAX_LIVES, CORRECT_TO_LEVEL } = GAME_CONFIG
const TIME_PER_BLANK = 5

export function useOperatorGame({ saveScore, getExistingScore }) {
  const [mode,        setMode]        = useState(null)   // null = mode select screen
  const [gameState,   setGameState]   = useState('playing')
  const [lives,       setLives]       = useState(MAX_LIVES)
  const [correct,     setCorrect]     = useState(0)
  const [question,    setQuestion]    = useState(null)
  const [filledOps,   setFilledOps]   = useState([])     // ops filled so far in current question
  const [feedback,    setFeedback]    = useState(null)
  const [isNewBest,   setIsNewBest]   = useState(false)
  const [crackingIdx, setCrackingIdx] = useState(null)
  const [streak,      setStreak]      = useState(0)

  const frozenRef    = useRef(false)
  const livesRef     = useRef(MAX_LIVES)
  const correctRef   = useRef(0)
  const questionRef  = useRef(null)
  const filledOpsRef = useRef([])
  const modeRef      = useRef(null)
  const timerRef     = useRef(null)
  const timerKeyRef  = useRef(0)
  const [timerKey,   setTimerKey]   = useState(0)

  useEffect(() => { livesRef.current    = lives     }, [lives])
  useEffect(() => { correctRef.current  = correct   }, [correct])
  useEffect(() => { questionRef.current = question  }, [question])
  useEffect(() => { filledOpsRef.current = filledOps }, [filledOps])
  useEffect(() => { modeRef.current     = mode      }, [mode])

  // Clean up timer on unmount
  useEffect(() => () => clearTimer(), [])

  function clearTimer() {
    if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null }
  }

  function startTimer() {
    clearTimer()
    timerKeyRef.current += 1
    setTimerKey(timerKeyRef.current)
    timerRef.current = setTimeout(() => {
      if (!frozenRef.current) {
        const q = questionRef.current
        const blankIdx = filledOpsRef.current.length
        handleWrong(q?.ops[blankIdx] ?? null)
      }
    }, TIME_PER_BLANK * 1000)
  }

  function handleWrong(correctOp) {
    frozenRef.current = true
    clearTimer()
    const newLives = livesRef.current - 1
    livesRef.current = newLives
    setCrackingIdx(newLives)
    setTimeout(() => setCrackingIdx(null), 900)
    setLives(newLives)
    setStreak(0)
    setFeedback({ type: 'wrong', correctOp })

    setTimeout(() => {
      if (newLives <= 0) {
        const final    = correctRef.current
        const existing = getExistingScore(modeRef.current)
        setIsNewBest(existing === undefined || final > existing)
        saveScore(modeRef.current, final)
        setGameState('gameover')
      } else {
        nextQuestion()
      }
    }, newLives <= 0 ? 1800 : 1300)
  }

  function nextQuestion() {
    const q = generateQuestion(correctRef.current, modeRef.current, questionRef.current)
    questionRef.current  = q
    filledOpsRef.current = []
    setQuestion(q)
    setFilledOps([])
    setFeedback(null)
    frozenRef.current = false
    setGameState('playing')
    startTimer()
  }

  function handleAnswer(op) {
    if (frozenRef.current) return
    const q        = questionRef.current
    if (!q) return
    const blankIdx  = filledOpsRef.current.length
    const correctOp = q.ops[blankIdx]

    if (op === correctOp) {
      const newFilled = [...filledOpsRef.current, op]
      filledOpsRef.current = newFilled
      setFilledOps(newFilled)

      if (newFilled.length === q.ops.length) {
        // All blanks done — full question correct
        frozenRef.current = true
        clearTimer()
        correctRef.current += 1
        setCorrect(correctRef.current)
        setStreak(s => s + 1)
        setFeedback({ type: 'correct' })
        setTimeout(nextQuestion, 500)
      } else {
        // More blanks remain — reset timer for next blank
        startTimer()
      }
    } else {
      handleWrong(correctOp)
    }
  }

  // Keyboard handler ref — updated every render for fresh closure
  const keyHandlerRef = useRef(null)
  keyHandlerRef.current = (e) => {
    const op = KEY_TO_OP[e.key]
    if (!op) return
    e.preventDefault()
    if (!modeRef.current) return
    const { ops } = getDifficultyConfig(correctRef.current, modeRef.current)
    if (!ops.includes(op)) return
    handleAnswer(op)
  }

  useEffect(() => {
    if (gameState !== 'playing') return
    function onKey(e) { keyHandlerRef.current(e) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [gameState])

  function selectMode(selectedMode) {
    modeRef.current      = selectedMode
    correctRef.current   = 0
    livesRef.current     = MAX_LIVES
    filledOpsRef.current = []
    setMode(selectedMode)
    setCorrect(0)
    setLives(MAX_LIVES)
    setIsNewBest(false)
    setFilledOps([])
    setStreak(0)
    nextQuestion()
  }

  const cfg     = mode ? getDifficultyConfig(correct, mode) : { blanks: 1, maxN: 10, ops: [] }
  const modeOps = cfg.ops

  return {
    mode, gameState, lives, correct, question, filledOps, feedback, isNewBest, crackingIdx,
    timerKey, timeCap: TIME_PER_BLANK, streak,
    ops:            modeOps,
    maxLives:       MAX_LIVES,
    correctToLevel: CORRECT_TO_LEVEL,
    levelProgress:  correct % CORRECT_TO_LEVEL,
    difficulty:     Math.floor(correct / CORRECT_TO_LEVEL) + 1,
    blanks:         cfg.blanks,
    selectMode,
    handleAnswer,
    playAgain:      () => selectMode(mode),
    backToModes:    () => { clearTimer(); setMode(null) },
  }
}
