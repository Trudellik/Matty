import { useState } from 'react'

const STORAGE_KEY = 'matty_highscores'

function load() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) ?? {}
  } catch {
    return {}
  }
}

export function useHighScores() {
  const [scores, setScores] = useState(load)

  function persist(next) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    setScores(next)
  }

  // For point-based challenges: higher is better
  function saveScore(challengeId, score) {
    setScores((prev) => {
      const cur = prev[challengeId]
      if (cur === undefined || score > cur) {
        const next = { ...prev, [challengeId]: score }
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
        return next
      }
      return prev
    })
  }

  // For time-based challenges: lower is better, stored per level
  // scores[challengeId] = { easy: 45, medium: 120, ... }
  function saveBestTime(challengeId, level, seconds) {
    setScores((prev) => {
      const levelScores = typeof prev[challengeId] === 'object' && prev[challengeId] !== null
        ? prev[challengeId]
        : {}
      const cur = levelScores[level]
      if (cur === undefined || seconds < cur) {
        const next = { ...prev, [challengeId]: { ...levelScores, [level]: seconds } }
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
        return next
      }
      return prev
    })
  }

  return { scores, saveScore, saveBestTime }
}
