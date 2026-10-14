import { useState, useEffect, useRef } from 'react'
import { buildAnimalGrid, gridDims, LEVELS } from './animalEngine'

export function useAnimalGame({ saveBestTime, getExistingScore }) {
  const [level,          setLevel]         = useState(null)
  const [selectedTypes,  setSelectedTypes] = useState(['gif', 'photo'])
  const [grid,           setGrid]          = useState([])
  const [selected,       setSelected]      = useState([])   // array of ids
  const [wrongGroup,     setWrongGroup]    = useState(null)
  const [elapsed,        setElapsed]       = useState(0)
  const [completed,      setCompleted]     = useState(false)
  const [isNewBest,      setIsNewBest]     = useState(false)
  const [dims,           setDims]          = useState({ cols: 3, rows: 4 })

  const elapsedRef       = useRef(0)
  const frozenRef        = useRef(false)
  const gridRef          = useRef([])
  const selectedRef      = useRef([])
  const levelRef         = useRef(null)
  const selectedTypesRef = useRef(['gif', 'photo'])

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

    const cur       = selectedRef.current
    const groupSize = selectedTypesRef.current.length  // 2 or 3

    // Deselect if tapping already-selected cell
    if (cur.includes(id)) {
      const next = cur.filter(x => x !== id)
      selectedRef.current = next
      setSelected(next)
      return
    }

    const next = [...cur, id]

    if (next.length < groupSize) {
      selectedRef.current = next
      setSelected(next)
      return
    }

    // Full group — evaluate
    selectedRef.current = []
    setSelected([])

    const cells       = next.map(i => gridRef.current.find(c => c.id === i))
    const allSameValue = cells.every(c => c.value === cells[0].value)
    const allDiffTypes = new Set(cells.map(c => c.type)).size === cells.length

    if (allSameValue && allDiffTypes) {
      const newGrid = gridRef.current.map(c =>
        next.includes(c.id) ? { ...c, matched: true } : c
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
      setWrongGroup(next)
      setTimeout(() => {
        setWrongGroup(null)
        frozenRef.current = false
      }, 600)
    }
  }

  // ── Start a game ──────────────────────────────────────────────────
  function startGame(lvl, types) {
    const resolvedTypes    = types ?? selectedTypesRef.current
    levelRef.current       = lvl
    selectedTypesRef.current = resolvedTypes
    frozenRef.current      = false
    selectedRef.current    = []

    const cfg     = LEVELS[lvl]
    const newGrid = buildAnimalGrid(cfg.pairs, resolvedTypes)
    const d       = gridDims(newGrid.length)

    gridRef.current    = newGrid
    elapsedRef.current = 0

    setSelectedTypes(resolvedTypes)
    setLevel(lvl)
    setGrid(newGrid)
    setDims(d)
    setSelected([])
    setWrongGroup(null)
    setElapsed(0)
    setCompleted(false)
    setIsNewBest(false)
  }

  function selectLevel(key, types) {
    if (!key) {
      levelRef.current    = null
      frozenRef.current   = false
      selectedRef.current = []
      setLevel(null)
      setGrid([])
      return
    }
    startGame(key, types)
  }

  function playAgain() { startGame(levelRef.current, selectedTypesRef.current) }
  function stopGame()  { frozenRef.current = false; selectedRef.current = []; setLevel(null) }

  return {
    level, selectedTypes, grid, selected, wrongGroup, elapsed, completed, isNewBest, dims,
    selectLevel, playAgain, stopGame, selectCell,
  }
}
