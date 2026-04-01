import { useState, useEffect, useRef } from 'react'
import { generateFractions, biggestId, getDifficultyConfig, GAME_CONFIG } from './fractionEngine'

const { MAX_LIVES, CORRECT_TO_LEVEL } = GAME_CONFIG

export function useFractionGame({ saveScore, getExistingScore }) {
  const [gameState,   setGameState]   = useState('idle')
  const [lives,       setLives]       = useState(MAX_LIVES)
  const [score,       setScore]       = useState(0)
  const [fractions,   setFractions]   = useState([])  // all cards in the round (display)
  const [remaining,   setRemaining]   = useState([])  // not yet correctly picked (logic)
  const [focusedId,   setFocusedId]   = useState(null)
  const [feedback,    setFeedback]    = useState(null)
  const [isNewBest,   setIsNewBest]   = useState(false)
  const [crackingIdx, setCrackingIdx] = useState(null)

  const frozenRef    = useRef(false)
  const livesRef     = useRef(MAX_LIVES)
  const scoreRef     = useRef(0)
  const fractionsRef = useRef([])  // stable fixed-position map for key handler
  const remainingRef = useRef([])  // current active fractions for selection logic
  const focusedIdRef = useRef(null)

  useEffect(() => { livesRef.current     = lives     }, [lives])
  useEffect(() => { scoreRef.current     = score     }, [score])
  useEffect(() => { focusedIdRef.current = focusedId }, [focusedId])

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
    if (!act.some(f => f.id === id)) return  // already correctly picked this round
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
      const newLives = livesRef.current - 1
      livesRef.current = newLives
      setCrackingIdx(newLives)
      setTimeout(() => setCrackingIdx(null), 900)
      setLives(newLives)
      setFeedback({ type: 'wrong', selectedId: id, correctId: correct })

      setTimeout(() => {
        if (newLives <= 0) {
          const existing = getExistingScore()
          setIsNewBest(existing === undefined || scoreRef.current > existing)
          saveScore(scoreRef.current)
          setGameState('gameover')
        } else {
          loadQuestion()
        }
      }, newLives <= 0 ? 1800 : 1300)
    }
  }

  // Arrow keys map to fixed card positions (0–3), regardless of which are already picked
  const KEY_TO_IDX = { ArrowLeft: 0, ArrowRight: 1, ArrowUp: 2, ArrowDown: 3 }

  const keyHandlerRef = useRef(null)
  keyHandlerRef.current = (e) => {
    if (frozenRef.current) return
    const fracs = fractionsRef.current
    if (!fracs.length) return

    const idx = KEY_TO_IDX[e.key]
    if (idx !== undefined) {
      e.preventDefault()
      if (idx < fracs.length) handleSelect(fracs[idx].id)
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
    scoreRef.current  = 0
    livesRef.current  = MAX_LIVES
    setScore(0)
    setLives(MAX_LIVES)
    setIsNewBest(false)
    setGameState('playing')
    loadQuestion(0)
  }

  const cfg = getDifficultyConfig(score)

  return {
    gameState, lives, score, fractions, remaining, focusedId, feedback, isNewBest, crackingIdx,
    maxLives:       MAX_LIVES,
    correctToLevel: CORRECT_TO_LEVEL,
    difficulty:     Math.floor(score / CORRECT_TO_LEVEL) + 1,
    fracCount:      cfg.count,
    handleSelect,
    selectByIndex: (idx) => {
      if (!frozenRef.current) keyHandlerRef.current({ key: ['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'][idx], preventDefault: () => {} })
    },
    start,
    playAgain: start,
  }
}
