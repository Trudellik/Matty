// Pure domain logic — no React, no side effects

export const GAME_CONFIG = { MAX_LIVES: 3, CORRECT_TO_LEVEL: 10 }

// Difficulty ramps: more fractions and bigger numbers over time
export const DIFFICULTY = [
  { minCorrect: 0,   count: 2, maxDenom: 6  },
  { minCorrect: 10,  count: 3, maxDenom: 6  },
  { minCorrect: 20,  count: 4, maxDenom: 8  },
  { minCorrect: 30,  count: 4, maxDenom: 10 },
  { minCorrect: 40,  count: 4, maxDenom: 12 },
  { minCorrect: 50,  count: 4, maxDenom: 18 },
]

export function getDifficultyConfig(correct) {
  return [...DIFFICULTY].reverse().find(d => correct >= d.minCorrect) ?? DIFFICULTY[0]
}

function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function gcd(a, b) { return b === 0 ? a : gcd(b, a % b) }

// Canonical key for a fraction — e.g. 2/4 and 1/2 both → "1/2"
function fracKey(numer, denom) {
  const g = gcd(numer, denom)
  return `${numer / g}/${denom / g}`
}

export function generateFractions(correct) {
  const { count, maxDenom } = getDifficultyConfig(correct)
  for (let attempt = 0; attempt < 100; attempt++) {
    const fracs = []
    const seen  = new Set()
    let ok = true
    for (let i = 0; i < count; i++) {
      let numer, denom, key, tries = 0
      do {
        denom = rand(2, maxDenom)
        numer = rand(1, denom - 1)
        key   = fracKey(numer, denom)
        tries++
      } while (seen.has(key) && tries < 30)
      if (seen.has(key)) { ok = false; break }
      seen.add(key)
      fracs.push({ id: i, numer, denom })
    }
    if (ok) return fracs
  }
  // Fallback — always returns `count` fractions with guaranteed distinct values
  const fallbacks = [
    { numer: 1, denom: 2 },
    { numer: 1, denom: 3 },
    { numer: 2, denom: 3 },
    { numer: 1, denom: 4 },
    { numer: 3, denom: 4 },
    { numer: 1, denom: 5 },
    { numer: 2, denom: 5 },
    { numer: 3, denom: 5 },
    { numer: 4, denom: 5 },
    { numer: 1, denom: 6 },
    { numer: 5, denom: 6 },
    { numer: 1, denom: 7 },
    { numer: 2, denom: 7 },
    { numer: 3, denom: 7 },
    { numer: 4, denom: 7 },
    { numer: 5, denom: 7 },
    { numer: 6, denom: 7 },
    { numer: 1, denom: 8 },
    { numer: 3, denom: 8 },
    { numer: 5, denom: 8 },
    { numer: 7, denom: 8 },
    { numer: 1, denom: 9 },
    { numer: 2, denom: 9 },
    { numer: 4, denom: 9 },
    { numer: 5, denom: 9 },
    { numer: 7, denom: 9 },
    { numer: 8, denom: 9 },
    { numer: 1, denom: 10 },
    { numer: 3, denom: 10 },
    { numer: 7, denom: 10 },
    { numer: 9, denom: 10 },
  ]
  return fallbacks.slice(0, count).map((f, i) => ({ id: i, ...f }))
}

// Compare fractions using cross-multiplication — no floating point
export function biggestId(fractions) {
  return fractions.reduce((best, f) =>
    f.numer * best.denom > best.numer * f.denom ? f : best
  ).id
}
