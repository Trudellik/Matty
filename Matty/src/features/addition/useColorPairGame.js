import { useState, useEffect, useRef } from 'react'
import { buildColorGrid, TIMED_DURATION_S, TIMED_START_SIZE } from './colorPairEngine'

/**
 * Manages color-pair game state for both 'single' and 'timed' modes.
 *
 * single: one round on a fixed n×n grid (default 4×4). Round ends when all
 *         pairs are matched. Shows a completion overlay.
 *
 * timed:  3-minute countdown. Grid starts 2×2 and grows by 1 each cleared
 *         round. Score = number of completed rounds.
 */
export function useColorPairGame({ mode = 'single', startSize = 4 }) {
  const [gameState,  setGameState]  = useState('idle')   // 'idle' | 'playing' | 'gameover'
  const [gridSize,   setGridSize]   = useState(startSize)
  const [grid,       setGrid]       = useState([])
  const [selected,   setSelected]   = useState(null)     // id of first picked cell
  const [wrongPair,  setWrongPair]  = useState(null)     // [id, id] flash
  const [score,      setScore]      = useState(0)        // rounds cleared (timed) or 1 (single)
  const [timeLeft,   setTimeLeft]   = useState(TIMED_DURATION_S)
  const [elapsed,    setElapsed]    = useState(0)        // for single mode
  const [completed,  setCompleted]  = useState(false)    // single mode done
  const [frozen,     setFrozen]     = useState(false)

  const gridSizeRef  = useRef(startSize)
  const scoreRef     = useRef(0)
  const frozenRef    = useRef(false)
  const selectedRef  = useRef(null)
  const gridRef      = useRef([])
  const completedRef = useRef(false)

  useEffect(() => { gridRef.current = grid }, [grid])

  // ── Timer ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (gameState !== 'playing') return
    if (mode === 'timed') {
      const id = setInterval(() => {
        setTimeLeft(t => {
          if (t <= 1) {
            clearInterval(id)
            setGameState('gameover')
            return 0
          }
          return t - 1
        })
      }, 1000)
      return () => clearInterval(id)
    } else {
      const id = setInterval(() => setElapsed(e => e + 1), 1000)
      return () => clearInterval(id)
    }
  }, [gameState, mode])

  // ── Load a new round grid ──────────────────────────────────────────
  function loadRound(size) {
    const newGrid = buildColorGrid(size)
    gridRef.current      = newGrid
    gridSizeRef.current  = size
    frozenRef.current    = false
    selectedRef.current  = null
    setGridSize(size)
    setGrid(newGrid)
    setSelected(null)
    setFrozen(false)
    setWrongPair(null)
  }

  // ── Select a cell ──────────────────────────────────────────────────
  function selectCell(id) {
    if (frozenRef.current) return
    if (completedRef.current && mode === 'single') return

    const cell = gridRef.current.find(c => c.id === id)
    if (!cell || cell.matched || cell.color === null) return  // null = wild cell

    // First pick
    if (selectedRef.current === null) {
      selectedRef.current = id
      setSelected(id)
      return
    }
    // Deselect same cell
    if (selectedRef.current === id) {
      selectedRef.current = null
      setSelected(null)
      return
    }

    const first  = gridRef.current.find(c => c.id === selectedRef.current)
    const second = cell
    selectedRef.current = null
    setSelected(null)

    if (first.color === second.color) {
      // Match!
      frozenRef.current = true
      setFrozen(true)
      const newGrid = gridRef.current.map(c =>
        c.id === first.id || c.id === second.id ? { ...c, matched: true } : c
      )
      gridRef.current = newGrid
      setGrid(newGrid)

      const allDone = newGrid.every(c => c.matched || c.color === null)
      if (allDone) {
        if (mode === 'timed') {
          scoreRef.current += 1
          setScore(scoreRef.current)
          // Expand grid by 1
          const nextSize = gridSizeRef.current + 1
          setTimeout(() => loadRound(nextSize), 600)
        } else {
          completedRef.current = true
          setCompleted(true)
          frozenRef.current = false
          setFrozen(false)
        }
      } else {
        frozenRef.current = false
        setFrozen(false)
      }
    } else {
      // Wrong pair
      frozenRef.current = true
      setFrozen(true)
      setWrongPair([first.id, second.id])
      setTimeout(() => {
        setWrongPair(null)
        frozenRef.current = false
        setFrozen(false)
      }, 600)
    }
  }

  // ── Start / restart ───────────────────────────────────────────────
  function start() {
    const size = mode === 'timed' ? TIMED_START_SIZE : startSize
    scoreRef.current    = 0
    completedRef.current = false
    setScore(0)
    setCompleted(false)
    setElapsed(0)
    setTimeLeft(TIMED_DURATION_S)
    loadRound(size)
    setGameState('playing')
  }

  function playAgain() { start() }

  return {
    gameState,
    gridSize,
    grid,
    selected,
    wrongPair,
    score,
    timeLeft,
    elapsed,
    completed,
    frozen,
    start,
    playAgain,
    selectCell,
  }
}
