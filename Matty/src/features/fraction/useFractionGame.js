import { useState, useEffect, useRef } from 'react'
import { generateFractions, biggestId, getDifficultyConfig, GAME_CONFIG } from './fractionEngine'

const { MAX_LIVES, CORRECT_TO_LEVEL } = GAME_CONFIG
const ENDURANCE_SECS = 3 * 60

export function useFractionGame({ saveScore, getExistingScore, gameMode = 'lives' }) {
  const [gameState,    setGameState]    = useState('idle')
  const [lives,        setLives]        = useState(MAX_LIVES)
  const [score,        setScore]        = useState(0)
  const [fractions,    setFractions]    = useState([])
  const [remaining,    setRemaining]    = useState([])
  const [focusedId,    setFocusedId]    = useState(null)
  const [feedback,     setFeedback]     = useState(null)
  const [isNewBest,    setIsNewBest]    = useState(false)
  const [crackingIdx,  setCrackingIdx]  = useState(null)
  const [gameSecsLeft, setGameSecsLeft] = useState(ENDURANCE_SECS)

  const frozenRef    = useRef(false)
  const livesRef     = useRef(MAX_LIVES)
  const scoreRef     = useRef(0)
  const fractionsRef = useRef([])
  const remainingRef = useRef([])
  const focusedIdRef = useRef(null)
  const gameModeRef  = useRef(gameMode)
  const gameTimerRef = useRef(null)
  const gameSecsRef  = useRef(ENDURANCE_SECS)

  useEffect(() => { livesRef.current     = lives     }, [lives])
  useEffect(() => { scoreRef.current     = score     }, [score])
  useEffect(() => { focusedIdRef.current = focusedId }, [focusedId])
  useEffect(() => { gameModeRef.current  = gameMode  }, [gameMode])

  function clearGameTimer() {
    if (gameTimerRef.current) { clearInterval(gameTimerRef.current); gameTimerRef.current = null }
  }

  function endGame() {
    clearGameTimer()
    frozenRef.current = true
    const existing = getExistingScore()
    setIsNewBest(existing === undefined || scoreRef.current > existing)
    saveScore(scoreRef.current)
    setGameState('gameover')
  }

  function setFocused(id) {
    focusedIdRef.current = id
    setFocusedId(id)
  }

  function loadQuestion(currentScore) {
    const fracs          = generateFractions(currentScore ?? scoreRef.current)
    fractionsRef.current = fracs
    remainingRef.current = fracs
    frozenRef.current    = false
    setFractions(fracs)
    setRemaining(fracs)
    setFeedback(null)
    setFocused(fracs[0].id)
  }

  function handleSelect(id) {
    if (frozenRef.current) return
    const act = remainingRef.current
    if (!act.length) return
    if (!act.some(f => f.id === id)) return
    const correct = biggestId(act)

    if (id === correct) {
      frozenRef.current = true
      setFeedback({ type: 'correct', id })

      const afterPick = act.filter(f => f.id !== id)

      setTimeout(() => {
        scoreRef.current += 1
        setScore(scoreRef.current)

        if (afterPick.length <= 1) {
          loadQuestion(scoreRef.current)
        } else {
          remainingRef.current = afterPick
          frozenRef.current    = false
          setRemaining(afterPick)
          setFeedback(null)
          setFocused(afterPick[0].id)
        }
      }, 400)
    } else {
      frozenRef.current = true

      if (gameModeRef.current === 'endurance') {
        setFeedback({ type: 'wrong', selectedId: id, correctId: correct })
        setTimeout(() => loadQuestion(), 1300)
        return
      }

      const newLives = livesRef.current - 1
      livesRef.current = newLives
      setCrackingIdx(newLives)
      setTimeout(() => setCrackingIdx(null), 900)
      setLives(newLives)
      setFeedback({ type: 'wrong', selectedId: id, correctId: correct })

      setTimeout(() => {
        if (newLives <= 0) {
          endGame()
        } else {
          loadQuestion()
        }
      }, newLives <= 0 ? 1800 : 1300)
    }
  }

  const keyHandlerRef = useRef(null)
  keyHandlerRef.current = (e) => {
    if (frozenRef.current) return
    const fracs = fractionsRef.current
    if (!fracs.length) return

    const KEY_TO_IDX = fracs.length === 3
      ? { ArrowLeft: 0, ArrowUp: 1, ArrowRight: 2 }
      : { ArrowLeft: 0, ArrowRight: 1, ArrowUp: 2, ArrowDown: 3 }

    const idx = KEY_TO_IDX[e.key]
    if (idx !== undefined) {
      e.preventDefault()
      handleSelect(fracs[idx].id)
      return
    }

    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      if (focusedIdRef.current !== null) handleSelect(focusedIdRef.current)
    }
  }

  useEffect(() => {
    if (gameState !== 'playing') return
    function onKey(e) { keyHandlerRef.current(e) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [gameState])

  function start() {
    scoreRef.current    = 0
    livesRef.current    = MAX_LIVES
    gameSecsRef.current = ENDURANCE_SECS
    clearGameTimer()
    setScore(0)
    setLives(MAX_LIVES)
    setIsNewBest(false)
    setGameSecsLeft(ENDURANCE_SECS)
    setGameState('playing')

    if (gameModeRef.current === 'endurance') {
      gameTimerRef.current = setInterval(() => {
        gameSecsRef.current -= 1
        setGameSecsLeft(gameSecsRef.current)
        if (gameSecsRef.current <= 0) endGame()
      }, 1000)
    }

    loadQuestion(0)
  }

  const cfg = getDifficultyConfig(score)

  const mm = Math.floor(gameSecsLeft / 60)
  const ss = String(gameSecsLeft % 60).padStart(2, '0')

  return {
    gameState, lives, score, fractions, remaining, focusedId, feedback, isNewBest, crackingIdx,
    maxLives:       gameMode === 'endurance' ? 0 : MAX_LIVES,
    correctToLevel: CORRECT_TO_LEVEL,
    difficulty:     Math.floor(score / CORRECT_TO_LEVEL) + 1,
    fracCount:      cfg.count,
    gameMinsLeft:   `${mm}:${ss}`,
    handleSelect,
    selectByIndex: (idx) => {
      if (frozenRef.current) return
      const fracs = fractionsRef.current
      if (idx < fracs.length) handleSelect(fracs[idx].id)
    },
    start,
    playAgain: start,
  }
}
