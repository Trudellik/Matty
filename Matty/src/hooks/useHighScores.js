import { useUser } from '../store/UserContext'

export function useHighScores() {
  const { activeUser, updateScores, users } = useUser()
  const scores = activeUser?.scores ?? {}

  function saveScore(challengeId, score) {
    const cur = scores[challengeId]
    if (cur === undefined || score > cur) {
      updateScores({ ...scores, [challengeId]: score })
    }
  }

  function saveBestTime(challengeId, level, seconds) {
    const levelScores = typeof scores[challengeId] === 'object' && scores[challengeId] !== null
      ? scores[challengeId]
      : {}
    const cur = levelScores[level]
    if (cur === undefined || seconds < cur) {
      updateScores({ ...scores, [challengeId]: { ...levelScores, [level]: seconds } })
    }
  }

  // Best numeric score across all users (higher is better)
  function globalScore(challengeId) {
    const vals = users
      .map(u => u.scores?.[challengeId])
      .filter(v => typeof v === 'number')
    return vals.length ? Math.max(...vals) : undefined
  }

  // Returns the name initial of the user holding the global best for a score key.
  // Returns null if the active user holds it (or only one user exists).
  function globalScoreHolder(challengeId) {
    let best = undefined, holder = null
    for (const u of users) {
      const v = u.scores?.[challengeId]
      if (typeof v !== 'number') continue
      if (best === undefined || v > best) { best = v; holder = u.name }
    }
    if (holder === null || holder === activeUser?.name) return null
    return holder[0].toUpperCase()
  }

  // Same but for time-based (lower is better), per level
  function globalTimeHolder(challengeId, level) {
    let best = undefined, holder = null
    for (const u of users) {
      const v = u.scores?.[challengeId]?.[level]
      if (typeof v !== 'number') continue
      if (best === undefined || v < best) { best = v; holder = u.name }
    }
    if (holder === null || holder === activeUser?.name) return null
    return holder[0].toUpperCase()
  }

  // Best time across all users for a time-based challenge (lower is better)
  // Returns { level: bestSeconds } object with per-level global bests
  function globalTimes(challengeId) {
    const merged = {}
    for (const u of users) {
      const d = u.scores?.[challengeId]
      if (typeof d !== 'object' || d === null) continue
      for (const [lvl, t] of Object.entries(d)) {
        if (typeof t !== 'number') continue
        if (merged[lvl] === undefined || t < merged[lvl]) merged[lvl] = t
      }
    }
    return Object.keys(merged).length ? merged : undefined
  }

  return { scores, saveScore, saveBestTime, globalScore, globalTimes, globalScoreHolder, globalTimeHolder }
}
