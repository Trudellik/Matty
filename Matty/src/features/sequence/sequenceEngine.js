const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min

function makeChoices(answer, spread = 10) {
  const choices = new Set([answer])
  while (choices.size < 4) {
    const delta = rand(1, spread)
    const sign  = Math.random() < 0.5 ? -1 : 1
    choices.add(answer + sign * delta)
  }
  return [...choices].sort(() => Math.random() - 0.5)
}

function blankAt(seq) {
  const idx = rand(1, seq.length - 2)
  const answer = seq[idx]
  const display = seq.map((v, i) => (i === idx ? null : v))
  return { display, answer, blankIdx: idx }
}

// ── Easy ──────────────────────────────────────────────────────────
function genArithAsc() {
  const start = rand(1, 20), step = rand(2, 9)
  const seq = Array.from({ length: 6 }, (_, i) => start + i * step)
  return { ...blankAt(seq), pattern: `+${step}` }
}
function genArithDesc() {
  const start = rand(30, 80), step = rand(2, 9)
  const seq = Array.from({ length: 6 }, (_, i) => start - i * step)
  return { ...blankAt(seq), pattern: `-${step}` }
}
function genDoubling() {
  const start = rand(1, 5)
  const seq = Array.from({ length: 6 }, (_, i) => start * Math.pow(2, i))
  return { ...blankAt(seq), pattern: '×2' }
}

// ── Medium ────────────────────────────────────────────────────────
function genGeometric() {
  const start = rand(1, 4), ratio = rand(3, 5)
  const seq = Array.from({ length: 6 }, (_, i) => start * Math.pow(ratio, i))
  return { ...blankAt(seq), pattern: `×${ratio}` }
}
function genSquares() {
  const offset = rand(0, 5)
  const seq = Array.from({ length: 6 }, (_, i) => (i + 1 + offset) ** 2)
  return { ...blankAt(seq), pattern: 'n²' }
}
function genFibLike() {
  const a = rand(1, 5), b = rand(1, 5)
  const seq = [a, b]
  while (seq.length < 7) seq.push(seq[seq.length - 1] + seq[seq.length - 2])
  return { ...blankAt(seq.slice(0, 6)), pattern: 'Fibonacci-like' }
}
function genGrowingStep() {
  const start = rand(1, 10)
  const seq = [start]
  for (let i = 1; i < 6; i++) seq.push(seq[seq.length - 1] + i * 2)
  return { ...blankAt(seq), pattern: 'growing step' }
}

// ── Hard ──────────────────────────────────────────────────────────
function genAlternating() {
  const a0 = rand(1, 10), stepA = rand(2, 6)
  const b0 = rand(50, 80), stepB = rand(3, 8)
  const seq = Array.from({ length: 6 }, (_, i) =>
    i % 2 === 0 ? a0 + (i / 2) * stepA : b0 - ((i - 1) / 2) * stepB
  )
  return { ...blankAt(seq), pattern: 'two interleaved' }
}
function genCubes() {
  const offset = rand(0, 3)
  const seq = Array.from({ length: 6 }, (_, i) => (i + 1 + offset) ** 3)
  return { ...blankAt(seq), pattern: 'n³' }
}
function genPow2() {
  const start = rand(0, 4)
  const seq = Array.from({ length: 6 }, (_, i) => Math.pow(2, i + start))
  return { ...blankAt(seq), pattern: '2ⁿ' }
}
function genTriangular() {
  const offset = rand(0, 5)
  const seq = Array.from({ length: 6 }, (_, i) => {
    const n = i + 1 + offset
    return (n * (n + 1)) / 2
  })
  return { ...blankAt(seq), pattern: 'triangular' }
}

const EASY_GEN   = [genArithAsc, genArithDesc, genDoubling]
const MEDIUM_GEN = [genGeometric, genSquares, genFibLike, genGrowingStep]
const HARD_GEN   = [genAlternating, genCubes, genPow2, genTriangular]

export const LEVELS = {
  easy:   { labelKey: 'seq_level_easy',   descKey: 'seq_level_easy_desc',   generators: EASY_GEN,   MAX_LIVES: 3 },
  medium: { labelKey: 'seq_level_medium', descKey: 'seq_level_medium_desc', generators: MEDIUM_GEN, MAX_LIVES: 3 },
  hard:   { labelKey: 'seq_level_hard',   descKey: 'seq_level_hard_desc',   generators: HARD_GEN,   MAX_LIVES: 3 },
}

export function generateQuestion(level) {
  const gens = LEVELS[level].generators
  const q    = gens[rand(0, gens.length - 1)]()
  return { ...q, choices: makeChoices(q.answer, level === 'hard' ? 20 : 10) }
}
