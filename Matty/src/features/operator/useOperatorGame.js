import { useState, useEffect, useRef } from 'react'
import {
  generateQuestion, getDifficultyConfig,
  applyOp, canReach,
  GAME_CONFIG, KEY_TO_OP,
} from './operatorEngine'

const { MAX_LIVES, CORRECT_TO_LEVEL } = GAME_CONFIG
const TIME_PER_BLANK  = 5
const ENDURANCE_SECS  = 3 * 60

export function useOperatorGame({ saveScore, getExistingScore, gameMode = 'lives' }) {
  const [mode,        setMode]        = useState(null)
  const [gameState,   setGameState]   = useState('playing')
  const [lives,       setLives]       = useState(MAX_LIVES)
  const [correct,     setCorrect]     = useState(0)
  const [question,    setQuestion]    = useState(null)
  const [filledOps,   setFilledOps]   = useState([])
  const [feedback,    setFeedback]    = useState(null)
  const [isNewBest,   setIsNewBest]   = useState(false)
  const [crackingIdx, setCrackingIdx] = useState(null)
  const [streak,      setStreak]      = useState(0)
  const [gameSecsLeft, setGameSecsLeft] = useState(ENDURANCE_SECS)

  const frozenRef      = useRef(false)
  const livesRef       = useRef(MAX_LIVES)
  const correctRef     = useRef(0)
  const questionRef    = useRef(null)
  const filledOpsRef   = useRef([])
  const runningValRef  = useRef(null)
  const modeRef      = useRef(null)
  const gameModeRef  = useRef(gameMode)
  const timerRef     = useRef(null)
  const timerKeyRef  = useRef(0)
  const gameTimerRef = useRef(null)
  const gameSecsRef  = useRef(ENDURANCE_SECS)
  const [timerKey,   setTimerKey]   = useState(0)

  useEffect(() => { livesRef.current    = lives     }, [lives])
  useEffect(() => { correctRef.current  = correct   }, [correct])
  useEffect(() => { questionRef.current = question  }, [question])
  useEffect(() => { filledOpsRef.current = filledOps }, [filledOps])
  useEffect(() => { modeRef.current     = mode      }, [mode])
  useEffect(() => { gameModeRef.current = gameMode  }, [gameMode])

  useEffect(() => () => { clearTimer(); clearGameTimer() }, [])

  function clearTimer() {
    if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null }
  }

  function clearGameTimer() {
    if (gameTimerRef.current) { clearInterval(gameTimerRef.current); gameTimerRef.current = null }
  }

  function startGameTimer() {
    clearGameTimer()
    gameTimerRef.current = setInterval(() => {
      gameSecsRef.current -= 1
      setGameSecsLeft(gameSecsRef.current)
      if (gameSecsRef.current <= 0) {
        clearGameTimer()
        frozenRef.current = true
        const final    = correctRef.current
        const existing = getExistingScore(modeRef.current)
        setIsNewBest(existing === undefined || final > existing)
        saveScore(modeRef.current, final)
        setGameState('gameover')
      }
    }, 1000)
  }

  function startTimer() {
    if (gameModeRef.current === 'endurance') return  // no per-blank timer in endurance
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
    setStreak(0)

    if (gameModeRef.current === 'endurance') {
      setFeedback({ type: 'wrong', correctOp })
      setTimeout(() => nextQuestion(), 1300)
      return
    }

    const newLives = livesRef.current - 1
    livesRef.current = newLives
    setCrackingIdx(newLives)
    setTimeout(() => setCrackingIdx(null), 900)
    setLives(newLives)
    setFeedback({ type: 'wrong', correctOp })

    setTimeout(() => {
      if (newLives <= 0) {
        clearGameTimer()
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
    runningValRef.current = q.terms[0]
    setQuestion(q)
    setFilledOps([])
    setFeedback(null)
    frozenRef.current = false
    setGameState('playing')
    startTimer()
  }

  function handleAnswer(op) {
    if (frozenRef.current) return
    const q = questionRef.current
    if (!q) return
    const blankIdx  = filledOpsRef.current.length
    const correctOp = q.ops[blankIdx]

    const newRunning     = applyOp(runningValRef.current, op, q.terms[blankIdx + 1])
    const remainingTerms = q.terms.slice(blankIdx + 2)
    const allowedOps     = getDifficultyConfig(correctRef.current, modeRef.current).ops
    const isValid        = newRunning !== null && newRunning > 0 && Number.isInteger(newRunning) &&
                           canReach(newRunning, remainingTerms, q.result, allowedOps)

    if (isValid) {
      runningValRef.current = newRunning
      const newFilled = [...filledOpsRef.current, op]
      filledOpsRef.current = newFilled
      setFilledOps(newFilled)

      if (newFilled.length === q.ops.length) {
        frozenRef.current = true
        clearTimer()
        correctRef.current += 1
        setCorrect(correctRef.current)
        setStreak(s => s + 1)
        setFeedback({ type: 'correct' })
        setTimeout(nextQuestion, 500)
      } else {
        startTimer()
      }
    } else {
      handleWrong(correctOp)
    }
  }

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
    gameSecsRef.current  = ENDURANCE_SECS
    setMode(selectedMode)
    setCorrect(0)
    setLives(MAX_LIVES)
    setIsNewBest(false)
    setFilledOps([])
    setStreak(0)
    setGameSecsLeft(ENDURANCE_SECS)
    if (gameModeRef.current === 'endurance') startGameTimer()
    nextQuestion()
  }

  const cfg     = mode ? getDifficultyConfig(correct, mode) : { blanks: 1, maxN: 10, ops: [] }
  const modeOps = cfg.ops

  const mm = Math.floor(gameSecsLeft / 60)
  const ss = String(gameSecsLeft % 60).padStart(2, '0')

  return {
    mode, gameState, lives, correct, question, filledOps, feedback, isNewBest, crackingIdx,
    timerKey, timeCap: TIME_PER_BLANK, streak,
    ops:            modeOps,
    maxLives:       gameMode === 'endurance' ? 0 : MAX_LIVES,
    correctToLevel: CORRECT_TO_LEVEL,
    levelProgress:  correct % CORRECT_TO_LEVEL,
    difficulty:     Math.floor(correct / CORRECT_TO_LEVEL) + 1,
    blanks:         cfg.blanks,
    gameMinsLeft:   `${mm}:${ss}`,
    selectMode,
    handleAnswer,
    playAgain:   () => selectMode(mode),
    backToModes: () => { clearTimer(); clearGameTimer(); setMode(null) },
  }
}
