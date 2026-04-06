import { useState, useEffect, useCallback, useRef } from 'react'
import { LEVELS, generateQuestion } from './geometryEngine'
import { useGameLogger } from '../../hooks/useGameLogger'

export function useGeometryGame({ saveScore, getExistingScore }) {
  const log = useGameLogger('geometry')

  const [level,      setLevel]      = useState(null)
  const [gameState,  setGameState]  = useState('idle')
  const [lives,      setLives]      = useState(3)
  const [score,      setScore]      = useState(0)
  const [question,   setQuestion]   = useState(null)
  const [feedback,   setFeedback]   = useState(null)
  const [isNewBest,  setIsNewBest]  = useState(false)
  const [crackingIdx,setCrackingIdx]= useState(null)

  const livesRef = useRef(3)
  const scoreRef = useRef(0)
  const levelRef = useRef(null)

  const maxLives = LEVELS[level]?.MAX_LIVES ?? 3

  const nextQuestion = useCallback(() => {
    if (!levelRef.current) return
    const q = generateQuestion(levelRef.current)
    setQuestion(q)
    setFeedback(null)
    log('question', { label: q.label, answer: q.answer })
  }, [log])

  const endGame = useCallback(() => {
    const finalScore = scoreRef.current
    const existing   = getExistingScore()
    const newBest    = existing === undefined || finalScore > existing
    if (newBest) saveScore(finalScore)
    setIsNewBest(newBest)
    setGameState('gameover')
    log('end', { score: finalScore, newBest })
  }, [getExistingScore, saveScore, log])

  const loseLife = useCallback(() => {
    const idx = livesRef.current - 1
    setCrackingIdx(idx)
    setTimeout(() => {
      setCrackingIdx(null)
      livesRef.current -= 1
      setLives(livesRef.current)
      if (livesRef.current <= 0) { endGame(); return }
      nextQuestion()
    }, 600)
  }, [endGame, nextQuestion])

  const handleSelect = useCallback((choice) => {
    if (feedback) return
    if (choice === question.answer) {
      scoreRef.current += 1
      setScore(scoreRef.current)
      setFeedback({ type: 'correct' })
      log('correct', { choice, score: scoreRef.current })
      setTimeout(() => nextQuestion(), 600)
    } else {
      setFeedback({ type: 'wrong', selected: choice, correct: question.answer })
      log('wrong', { choice, correct: question.answer })
      setTimeout(() => loseLife(), 900)
    }
  }, [feedback, question, nextQuestion, loseLife, log])

  // Keyboard 1-4
  useEffect(() => {
    if (gameState !== 'playing' || feedback) return
    const onKey = (e) => {
      const idx = ['1','2','3','4'].indexOf(e.key)
      if (idx !== -1 && question?.choices[idx] !== undefined) {
        handleSelect(question.choices[idx])
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [gameState, feedback, question, handleSelect])

  const startGame = useCallback((lvl) => {
    const cfg = LEVELS[lvl]
    livesRef.current = cfg.MAX_LIVES
    scoreRef.current = 0
    levelRef.current = lvl
    setLevel(lvl)
    setLives(cfg.MAX_LIVES)
    setScore(0)
    setIsNewBest(false)
    setGameState('playing')
    log('start', { level: lvl, maxLives: cfg.MAX_LIVES })
    const q = generateQuestion(lvl)
    setQuestion(q)
    setFeedback(null)
  }, [log])

  const playAgain   = useCallback(() => startGame(level),  [startGame, level])
  const selectLevel = useCallback((lvl) => { setLevel(lvl); setGameState('idle') }, [])

  return {
    level, gameState, lives, maxLives, score, question,
    feedback, isNewBest, crackingIdx,
    handleSelect, startGame, playAgain, selectLevel,
  }
}
