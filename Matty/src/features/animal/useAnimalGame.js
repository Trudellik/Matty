import { useState, useEffect, useRef } from 'react'
import { buildAnimalGrid, LEVELS } from './animalEngine'

export function useAnimalGame({ saveBestTime, getExistingScore }) {
  const [level,     setLevel]     = useState(null)
  const [grid,      setGrid]      = useState([])
  const [selected,  setSelected]  = useState(null)
  const [wrongPair, setWrongPair] = useState(null)
  const [elapsed,   setElapsed]   = useState(0)
  const [completed, setCompleted] = useState(false)
  const [isNewBest, setIsNewBest] = useState(false)

  const elapsedRef  = useRef(0)
  const frozenRef   = useRef(false)
  const gridRef     = useRef([])
  const selectedRef = useRef(null)
  const levelRef    = useRef(null)

  useEffect(() => { gridRef.current = grid }, [grid])

  // ── Timer ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!level || completed) return
    const id = setInterval(() => {
      elapsedRef.current += 1
      setElapsed(elapsedRef.current)
    }, 1000)
    return () => clearInterval(id)
  }, [level, completed])

  // ── Select a cell ─────────────────────────────────────────────────
  function selectCell(id) {
    if (frozenRef.current) return
    if (completed) return

    const cell = gridRef.current.find(c => c.id === id)
    if (!cell || cell.matched) return

    if (selectedRef.current === id) {
      selectedRef.current = null
      setSelected(null)
      return
    }

    if (selectedRef.current === null) {
      selectedRef.current = id
      setSelected(id)
      return
    }

    const first  = gridRef.current.find(c => c.id === selectedRef.current)
    const second = cell
    selectedRef.current = null
    setSelected(null)

    if (first.value === second.value && first.type !== second.type) {
      const newGrid = gridRef.current.map(c =>
        c.id === first.id || c.id === second.id ? { ...c, matched: true } : c
      )
      gridRef.current = newGrid
      setGrid(newGrid)

      if (newGrid.every(c => c.matched)) {
        const t        = elapsedRef.current
        const existing = getExistingScore?.(levelRef.current)
        const nb       = existing === undefined || t < existing
        if (nb) saveBestTime?.(levelRef.current, t)
        setIsNewBest(nb)
        setCompleted(true)
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

  // ── Level select & restart ────────────────────────────────────────
  function selectLevel(key) {
    levelRef.current    = key
    frozenRef.current   = false
    selectedRef.current = null
    setSelected(null)
    setWrongPair(null)
    setLevel(key)
    if (!key) { setGrid([]); return }
    const cfg = LEVELS[key]
    elapsedRef.current = 0
    setElapsed(0)
    setCompleted(false)
    setIsNewBest(false)
    const newGrid = buildAnimalGrid(cfg.pairs, key)
    gridRef.current = newGrid
    setGrid(newGrid)
  }

  function playAgain() { selectLevel(levelRef.current) }
  function stopGame()  { frozenRef.current = false; selectedRef.current = null; setLevel(null) }

  return {
    level, grid, selected, wrongPair, elapsed, completed, isNewBest,
    selectLevel, playAgain, stopGame, selectCell,
  }
}
