const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min
const coef = (n) => (Math.abs(n) === 1 ? (n < 0 ? '-' : '') : `${n}`)

function generateEasy() {
  const type = rand(0, 2)
  if (type === 0) {
    // x + a = b
    const a = rand(1, 20)
    const x = rand(1, 20)
    const b = x + a
    return { lhs: `x + ${a}`, rhs: `${b}`, answer: x }
  } else if (type === 1) {
    // x - a = b
    const a = rand(1, 20)
    const x = rand(1, 20)
    const b = x - a
    return { lhs: `x - ${a}`, rhs: `${b}`, answer: x }
  } else {
    // ax = b
    const a = rand(2, 12)
    const x = rand(1, 12)
    return { lhs: `${a}x`, rhs: `${a * x}`, answer: x }
  }
}

function generateMedium() {
  // ax + b = c  or  ax - b = c
  const a   = rand(2, 9)
  const b   = rand(1, 15)
  const x   = rand(1, 10)
  const sign = rand(0, 1)
  const c   = sign === 0 ? a * x + b : a * x - b
  const lhs = sign === 0 ? `${a}x + ${b}` : `${a}x - ${b}`
  return { lhs, rhs: `${c}`, answer: x }
}

function generateHard() {
  // ax + b = cx + d  (a ≠ c)
  let a, c
  do { a = rand(2, 9); c = rand(1, 8) } while (a === c)
  const x = rand(-10, 10)
  const b = rand(-15, 15)
  const d = (a - c) * x + b
  const lhs = `${coef(a)}x + ${b}`
  const rhs = `${coef(c)}x + ${d}`
  return { lhs, rhs, answer: x }
}

export const LEVELS = {
  easy:   { labelKey: 'alg_level_easy',   descKey: 'alg_level_easy_desc',   generate: generateEasy,   timePerQ: 15, MAX_LIVES: 3 },
  medium: { labelKey: 'alg_level_medium', descKey: 'alg_level_medium_desc', generate: generateMedium, timePerQ: 20, MAX_LIVES: 3 },
  hard:   { labelKey: 'alg_level_hard',   descKey: 'alg_level_hard_desc',   generate: generateHard,   timePerQ: 25, MAX_LIVES: 3 },
}
