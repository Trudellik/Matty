import { useState, useEffect, useRef } from 'react'
import { buildPairingGrid, TIMED_DURATION_S, TIMED_START_SIZE } from './pairingEngine'

/**
 * mode:      'single' | 'timed'
 * pairType:  'color' | 'number' | 'alphabet'
 * startSize: grid size for single mode (default 4)
 */
export function usePairingGame({ mode = 'single', pairType = 'color', startSize = 4, saveScore, saveBestTime, getExistingScore }) {
  const [gameState, setGameState] = useState('idle')   // 'idle' | 'playing' | 'gameover'
  const [gridSize,  setGridSize]  = useState(startSize)
  const [grid,      setGrid]      = useState([])
  const [selected,  setSelected]  = useState(null)     // id of first picked cell
  const [wrongPair, setWrongPair] = useState(null)     // [id, id] flash
  const [score,     setScore]     = useState(0)        // rounds cleared (timed)
  const [timeLeft,  setTimeLeft]  = useState(TIMED_DURATION_S)
  const [elapsed,   setElapsed]   = useState(0)
  const [completed, setCompleted] = useState(false)    // single mode done
  const [finalElapsed, setFinalElapsed] = useState(0)
  const [isNewBest, setIsNewBest] = useState(false)
  const elapsedRef = useRef(0)

  const gridSizeRef   = useRef(startSize)
  const scoreRef      = useRef(0)
  const frozenRef     = useRef(false)
  const selectedRef   = useRef(null)
  const gridRef       = useRef([])
  const completedRef  = useRef(false)
  const pairTypeRef   = useRef(pairType)
  const modeRef       = useRef(mode)

  useEffect(() => { gridRef.current = grid }, [grid])
  useEffect(() => { pairTypeRef.current = pairType }, [pairType])
  useEffect(() => { modeRef.current = mode }, [mode])

  // ── Timer ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (gameState !== 'playing') return
    if (modeRef.current === 'timed') {
      const id = setInterval(() => {
        setTimeLeft(t => {
          if (t <= 1) {
            clearInterval(id)
            const s = scoreRef.current
            const existing = getExistingScore?.()
            const newBest = existing === undefined || s > existing
            if (newBest) saveScore?.(s)
            setIsNewBest(newBest)
            setGameState('gameover')
            return 0
          }
          return t - 1
        })
      }, 1000)
      return () => clearInterval(id)
    } else {
      const id = setInterval(() => setElapsed(e => { elapsedRef.current = e + 1; return e + 1 }), 1000)
      return () => clearInterval(id)
    }
  }, [gameState])

  // ── Load a round ─────────────────────────────────────────────────────
  function loadRound(size) {
    const newGrid = buildPairingGrid(size, pairTypeRef.current)
    gridRef.current     = newGrid
    gridSizeRef.current = size
    frozenRef.current   = false
    selectedRef.current = null
    setGridSize(size)
    setGrid(newGrid)
    setSelected(null)
    setWrongPair(null)
  }

  // ── Select a cell ─────────────────────────────────────────────────────
  function selectCell(id) {
    if (frozenRef.current) return
    if (completedRef.current && modeRef.current === 'single') return

    const cell = gridRef.current.find(c => c.id === id)
    if (!cell || cell.matched || cell.value === null) return

    if (selectedRef.current === null) {
      selectedRef.current = id
      setSelected(id)
      return
    }
    if (selectedRef.current === id) {
      selectedRef.current = null
      setSelected(null)
      return
    }

    const first  = gridRef.current.find(c => c.id === selectedRef.current)
    const second = cell
    selectedRef.current = null
    setSelected(null)

    if (first.value === second.value) {
      frozenRef.current = true
      const newGrid = gridRef.current.map(c =>
        c.id === first.id || c.id === second.id ? { ...c, matched: true } : c
      )
      gridRef.current = newGrid
      setGrid(newGrid)

      const allDone = newGrid.every(c => c.matched || c.value === null)
      if (allDone) {
        if (modeRef.current === 'timed') {
          scoreRef.current += 1
          setScore(scoreRef.current)
          setTimeout(() => loadRound(gridSizeRef.current + 1), 600)
        } else {
          const t = elapsedRef.current
          const existing = getExistingScore?.()
          const newBest = existing === undefined || t < existing
          if (newBest) saveBestTime?.(t)
          completedRef.current = true
          setFinalElapsed(t)
          setIsNewBest(newBest)
          setCompleted(true)
          frozenRef.current = false
          setGameState('gameover')
        }
      } else {
        frozenRef.current = false
      }
    } else {
      frozenRef.current = true
      setWrongPair([first.id, second.id])
      setTimeout(() => {
        setWrongPair(null)
        frozenRef.current = false
      }, 600)
    }
  }

  // ── Start / restart ───────────────────────────────────────────────────
  function start(overridePairType) {
    if (overridePairType) pairTypeRef.current = overridePairType
    const size = modeRef.current === 'timed' ? TIMED_START_SIZE : startSize
    scoreRef.current     = 0
    completedRef.current = false
    frozenRef.current    = false
    selectedRef.current  = null
    setScore(0)
    setCompleted(false)
    setIsNewBest(false)
    elapsedRef.current = 0
    setElapsed(0)
    setFinalElapsed(0)
    setTimeLeft(TIMED_DURATION_S)
    loadRound(size)
    setGameState('playing')
  }

  return {
    gameState,
    gridSize,
    grid,
    selected,
    wrongPair,
    score,
    timeLeft,
    elapsed,
    finalElapsed,
    completed,
    isNewBest,
    start,
    startWithType: (type) => start(type),
    playAgain: start,
    selectCell,
  }
}
