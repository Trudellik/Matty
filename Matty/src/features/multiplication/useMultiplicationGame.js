import { useState, useEffect, useRef, useMemo } from 'react'
import { LEVELS, buildCellsToFill } from './multiplicationEngine'

/**
 * D: receives score I/O as injected functions — decoupled from challenge ID.
 * I: only the two functions this hook actually needs are required.
 */
export function useMultiplicationGame({ saveBestTime, getExistingScore }) {
  const [level,       setLevel]       = useState(null)
  const [started,     setStarted]     = useState(false)
  const [currentIdx,  setCurrentIdx]  = useState(0)
  const [typingValue, setTypingValue] = useState('')
  const [filledCells, setFilledCells] = useState({})
  const [wrongFlash,  setWrongFlash]  = useState(false)
  const [wrongInfo,   setWrongInfo]   = useState(null)
  const [elapsed,     setElapsed]     = useState(0)
  const [running,     setRunning]     = useState(false)
  const [completed,   setCompleted]   = useState(false)
  const [isNewBest,   setIsNewBest]   = useState(false)

  const typingRef      = useRef('')
  const idxRef         = useRef(0)
  const elapsedRef     = useRef(0)
  const completedRef   = useRef(false)
  const frozenRef      = useRef(false)
  const currentCellRef = useRef(null)

  const size        = level ? LEVELS[level].size : 10
  const cellsToFill = useMemo(
    () => (level ? buildCellsToFill(LEVELS[level].size, level) : []),
    [level],
  )

  useEffect(() => { typingRef.current    = typingValue }, [typingValue])
  useEffect(() => { idxRef.current       = currentIdx  }, [currentIdx])
  useEffect(() => { elapsedRef.current   = elapsed     }, [elapsed])
  useEffect(() => { completedRef.current = completed   }, [completed])

  // Enter on start overlay
  useEffect(() => {
    if (!level || started) return
    function onKey(e) { if (e.key === 'Enter') { setStarted(true); setRunning(true) } }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [level, started])

  // Timer
  useEffect(() => {
    if (!running) return
    const id = setInterval(() => setElapsed((e) => e + 1), 1000)
    return () => clearInterval(id)
  }, [running])

  // Scroll active cell into view
  useEffect(() => {
    currentCellRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' })
  }, [currentIdx])

  // Keyboard
  useEffect(() => {
    if (!started || !running) return

    function advance(idx, row, col) {
      const newIdx = idx + 1
      typingRef.current = ''
      idxRef.current    = newIdx
      setTypingValue('')
      setCurrentIdx(newIdx)
      setFilledCells((prev) => ({ ...prev, [`${row},${col}`]: true }))

      if (newIdx >= cellsToFill.length) {
        setRunning(false)
        setCompleted(true)
        const t        = elapsedRef.current
        const existing = getExistingScore(level)
        setIsNewBest(existing === undefined || t < existing)
        saveBestTime(level, t)
      }
    }

    function onKey(e) {
      if (completedRef.current || frozenRef.current) return

      if (e.key >= '0' && e.key <= '9') {
        e.preventDefault()
        if (typingRef.current.length >= 3) return

        const idx    = idxRef.current
        if (idx >= cellsToFill.length) return

        const [row, col] = cellsToFill[idx]
        const answer     = String(row * col)
        const next       = typingRef.current + e.key

        if (next === answer) {
          advance(idx, row, col)
        } else if (!answer.startsWith(next)) {
          typingRef.current = ''
          frozenRef.current = true
          setTypingValue('')
          setWrongFlash(true)
          setWrongInfo({ typed: next, row, col })
          setTimeout(() => {
            frozenRef.current = false
            setWrongFlash(false)
            setWrongInfo(null)
          }, 2000)
        } else {
          typingRef.current = next
          setTypingValue(next)
        }

      } else if (e.key === 'Backspace') {
        e.preventDefault()
        const next = typingRef.current.slice(0, -1)
        typingRef.current = next
        setTypingValue(next)
      }
    }

    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [started, running, cellsToFill, level]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Actions ──────────────────────────────────────────────────────

  function selectLevel(selectedLevel) {
    setLevel(selectedLevel)
    setStarted(false)
    setCurrentIdx(0)
    setTypingValue('')
    setFilledCells({})
    setWrongFlash(false)
    setElapsed(0)
    setRunning(false)
    setCompleted(false)
    setIsNewBest(false)
    typingRef.current    = ''
    idxRef.current       = 0
    completedRef.current = false
  }

  // ── Public interface ─────────────────────────────────────────────

  return {
    level, started, currentIdx, typingValue, filledCells,
    wrongFlash, wrongInfo, elapsed, completed, isNewBest,
    size, cellsToFill, activeCell: cellsToFill[currentIdx],
    currentCellRef,
    selectLevel,
    startGame:  () => { setStarted(true); setRunning(true) },
    playAgain:  () => selectLevel(level),
    stopGame:   () => setRunning(false),
  }
}
