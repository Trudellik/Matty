import { useState, useEffect, useRef } from 'react'
import { LEVELS, buildGrid } from './additionEngine'

/**
 * D: receives score I/O as injected functions — decoupled from challenge ID.
 */
export function useAdditionGame({ saveBestTime, getExistingScore }) {
  const [level,      setLevel]      = useState(null)
  const [grid,       setGrid]       = useState([])
  const [target,     setTarget]     = useState(0)
  const [selected,   setSelected]   = useState(null)
  const [wrongPair,  setWrongPair]  = useState(null)
  const [elapsed,    setElapsed]    = useState(0)
  const [running,    setRunning]    = useState(false)
  const [started,    setStarted]    = useState(false)
  const [completed,  setCompleted]  = useState(false)
  const [isNewBest,  setIsNewBest]  = useState(false)
  const [focusedIdx, setFocusedIdx] = useState(0)

  const elapsedRef   = useRef(0)
  const completedRef = useRef(false)
  const focusedIdxRef = useRef(0)

  useEffect(() => { elapsedRef.current    = elapsed    }, [elapsed])
  useEffect(() => { completedRef.current  = completed  }, [completed])
  useEffect(() => { focusedIdxRef.current = focusedIdx }, [focusedIdx])



  // Timer
  useEffect(() => {
    if (!running) return
    const id = setInterval(() => setElapsed((e) => e + 1), 1000)
    return () => clearInterval(id)
  }, [running])

  // Keyboard handler ref — updated every render for a fresh closure
  const keyHandlerRef = useRef(null)
  keyHandlerRef.current = (e) => {
    const cols  = level ? LEVELS[level].cols : 4
    const total = grid.length

    if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
      e.preventDefault()
      setFocusedIdx((prev) => {
        const row  = Math.floor(prev / cols)
        const col  = prev % cols
        const rows = total / cols
        if (e.key === 'ArrowLeft')  return row  * cols + (col === 0        ? cols - 1 : col - 1)
        if (e.key === 'ArrowRight') return row  * cols + (col === cols - 1 ? 0        : col + 1)
        if (e.key === 'ArrowUp')    return (row === 0        ? rows - 1 : row - 1) * cols + col
        if (e.key === 'ArrowDown')  return (row === rows - 1 ? 0        : row + 1) * cols + col
        return prev
      })
      return
    }

    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      if (completedRef.current) return
      const id   = focusedIdxRef.current
      const cell = grid[id]
      if (!cell || cell.matched) return

      if (selected === null) { setSelected(id); return }
      if (selected === id)   { setSelected(null); return }

      const other = grid[selected]
      setSelected(null)

      if (cell.value + other.value === target) {
        const newGrid = grid.map((c) =>
          c.id === id || c.id === selected ? { ...c, matched: true } : c,
        )
        setGrid(newGrid)
        if (newGrid.every((c) => c.matched)) {
          setRunning(false)
          setCompleted(true)
          completedRef.current = true
          const t        = elapsedRef.current
          const existing = getExistingScore(level)
          setIsNewBest(existing === undefined || t < existing)
          saveBestTime(level, t)
        }
      } else {
        setWrongPair([selected, id])
        setTimeout(() => setWrongPair(null), 600)
      }
    }
  }

  // Keyboard navigation during game
  useEffect(() => {
    if (!started || completed) return
    function onKey(e) { keyHandlerRef.current(e) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [started, completed])

  function selectLevel(selectedLevel) {
    setLevel(selectedLevel)
    setCompleted(false)
    setIsNewBest(false)
    setSelected(null)
    setWrongPair(null)
    setElapsed(0)
    setFocusedIdx(0)
    completedRef.current = false

    if (selectedLevel) {
      const cfg = LEVELS[selectedLevel]
      setTarget(cfg.target)
      setGrid(buildGrid(cfg.cols, cfg.rows, cfg.target))
      setStarted(true)
      setRunning(true)
    } else {
      setStarted(false)
      setRunning(false)
    }
  }

  function selectCell(id) {
    if (completedRef.current) return
    const cell = grid.find((c) => c.id === id)
    if (!cell || cell.matched) return

    if (selected === null) { setSelected(id); return }
    if (selected === id)   { setSelected(null); return }

    const other = grid.find((c) => c.id === selected)
    setSelected(null)

    if (cell.value + other.value === target) {
      const newGrid = grid.map((c) =>
        c.id === id || c.id === selected ? { ...c, matched: true } : c,
      )
      setGrid(newGrid)
      if (newGrid.every((c) => c.matched)) {
        setRunning(false)
        setCompleted(true)
        completedRef.current = true
        const t        = elapsedRef.current
        const existing = getExistingScore(level)
        setIsNewBest(existing === undefined || t < existing)
        saveBestTime(level, t)
      }
    } else {
      setWrongPair([selected, id])
      setTimeout(() => setWrongPair(null), 600)
    }
  }

  const cfg = level ? LEVELS[level] : null

  return {
    level, grid, target, selected, wrongPair,
    elapsed, started, completed, isNewBest,
    focusedIdx,
    cols: cfg?.cols ?? 4,
    selectLevel,
    startGame:  () => { setStarted(true); setRunning(true) },
    playAgain:  () => selectLevel(level),
    stopGame:   () => setRunning(false),
    selectCell,
  }
}
