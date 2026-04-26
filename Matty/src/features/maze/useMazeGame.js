import { useState, useEffect, useRef } from 'react'
import { generateMaze, GRID_SIZE } from './mazeEngine'

const N = GRID_SIZE

export function useMazeGame({ saveScore, getExistingScore }) {
  const [gameState,  setGameState]  = useState('idle')
  const [maze,       setMaze]       = useState(null)
  const [position,   setPosition]   = useState({ r: 0, c: 0 })
  const [visited,    setVisited]    = useState(new Set(['0,0']))
  const [wrongCells, setWrongCells] = useState(new Set())
  const [elapsed,    setElapsed]    = useState(0)
  const [isNewBest,  setIsNewBest]  = useState(false)

  const mazeRef       = useRef(null)
  const posRef        = useRef({ r: 0, c: 0 })
  const visitedRef    = useRef(new Set(['0,0']))
  const wrongRef      = useRef(new Set())
  const elapsedRef    = useRef(0)
  const timerRef      = useRef(null)
  const lastTargetRef = useRef(null)

  useEffect(() => () => clearInterval(timerRef.current), [])

  function start(target) {
    const tgt = target ?? null
    lastTargetRef.current = tgt
    clearInterval(timerRef.current)
    const m           = generateMaze(tgt ?? undefined)
    const initVisited = new Set(['0,0'])

    mazeRef.current    = m
    posRef.current     = { r: 0, c: 0 }
    visitedRef.current = initVisited
    wrongRef.current   = new Set()
    elapsedRef.current = 0

    setMaze(m)
    setPosition({ r: 0, c: 0 })
    setVisited(new Set(initVisited))
    setWrongCells(new Set())
    setElapsed(0)
    setIsNewBest(false)
    setGameState('playing')

    timerRef.current = setInterval(() => {
      elapsedRef.current += 1
      setElapsed(elapsedRef.current)
    }, 1000)
  }

  function handleMove(dr, dc) {
    const m   = mazeRef.current
    const pos = posRef.current
    if (!m) return

    const nr = pos.r + dr
    const nc = pos.c + dc
    if (nr < 0 || nr >= N || nc < 0 || nc >= N) return

    const key  = `${nr},${nc}`
    const cell = m.grid[nr][nc]

    // Already visited or invalid → blocked
    if (visitedRef.current.has(key)) return 'blocked'

    if (cell.valid) {
      visitedRef.current.add(key)
      posRef.current = { r: nr, c: nc }
      setVisited(new Set(visitedRef.current))
      setPosition({ r: nr, c: nc })

      if (nr === N - 1 && nc === N - 1) {
        clearInterval(timerRef.current)
        const score    = Math.max(0, 10000 - elapsedRef.current * 10 - wrongRef.current.size * 50)
        const existing = getExistingScore()
        setIsNewBest(existing === undefined || score > existing)
        saveScore(score)
        setGameState('won')
      }
    } else {
      wrongRef.current.add(key)
      setWrongCells(new Set(wrongRef.current))
      return 'blocked'
    }
  }

  const MOVE_MAP = { ArrowUp: [-1, 0], ArrowDown: [1, 0], ArrowLeft: [0, -1], ArrowRight: [0, 1] }

  return {
    gameState, maze, position, visited, wrongCells,
    elapsed, isNewBest,
    handleMove, start, playAgain: () => start(lastTargetRef.current),
    MOVE_MAP,
  }
}
