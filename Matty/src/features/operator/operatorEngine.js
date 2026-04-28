// Pure domain logic — no React, no side effects

export const GAME_CONFIG = { MAX_LIVES: 3, CORRECT_TO_LEVEL: 20 }

export const MODES = {
  basic: { ops: ['+', '-'],           labelKey: 'op_mode_basic', descKey: 'op_mode_basic_desc' },
  full:  { ops: ['+', '-', '×', '÷'], labelKey: 'op_mode_full',  descKey: 'op_mode_full_desc'  },
}

// basic — levels unlock bigger numbers then more blanks:
//   L1: ops=[+,-]  blanks=1 maxN=10
//   L2: ops=[+,-]  blanks=1 maxN=20
//   L3: ops=[+,-]  blanks=2 maxN=20  (+1 blank each level from here)
//
// full — levels progressively unlock operators, then blanks:
//   L1: ops=[+,-]       blanks=1
//   L2: ops=[+,-,×]     blanks=1
//   L3: ops=[+,-,×,÷]   blanks=1
//   L4: ops=[+,-,×,÷]   blanks=1 maxN=20 (bigger numbers)
//   L5: ops=[+,-,×,÷]   blanks=2  (+1 blank each level from here)

export const KEY_TO_OP = {
  ArrowRight: '+',
  ArrowLeft:  '-',
  ArrowUp:    '×',
  ArrowDown:  '÷',
}

export const OP_ORDER = ['+', '-', '×', '÷']

function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

export function applyOp(a, op, b) {
  if (op === '+') return a + b
  if (op === '-') return a - b
  if (op === '×') return a * b
  if (op === '÷') return (b !== 0 && a % b === 0) ? a / b : null
  return null
}

// Returns true if any sequence of allowedOps applied left-to-right over
// remainingTerms starting from `current` can reach `target`.
// Only paths through positive integers are considered (consistent with generation).
export function canReach(current, remainingTerms, target, allowedOps) {
  if (remainingTerms.length === 0) return current === target
  const [next, ...rest] = remainingTerms
  return allowedOps.some(op => {
    const val = applyOp(current, op, next)
    return val !== null && val > 0 && Number.isInteger(val) &&
      canReach(val, rest, target, allowedOps)
  })
}

export function getDifficultyConfig(correct, mode) {
  const level = Math.floor(correct / GAME_CONFIG.CORRECT_TO_LEVEL) + 1

  if (mode === 'full') {
    if (level === 1) return { blanks: 1, maxN: 10, ops: ['+', '-'] }
    if (level === 2) return { blanks: 1, maxN: 10, ops: ['+', '-', '×'] }
    if (level === 3) return { blanks: 1, maxN: 10, ops: ['+', '-', '×', '÷'] }
    if (level === 4) return { blanks: 1, maxN: 20, ops: ['+', '-', '×', '÷'] }
    return                  { blanks: level - 3,   maxN: 20, ops: ['+', '-', '×', '÷'] }
  }

  // basic
  if (level === 1) return { blanks: level, maxN: 10, ops: ['+', '-'] }
  if (level === 2) return { blanks: level, maxN: 20, ops: ['+', '-'] }
  return                  { blanks: level, maxN: 20, ops: ['+', '-'] }
}

function buildQuestion(blanks, ops, maxN) {
  for (let attempt = 0; attempt < 50; attempt++) {
    const pickedOps = []
    const terms     = [rand(1, maxN)]
    let result      = terms[0]
    let valid       = true

    for (let i = 0; i < blanks; i++) {
      const op = ops[rand(0, ops.length - 1)]

      if (op === '+') {
        const b = rand(1, maxN)
        pickedOps.push(op); terms.push(b); result += b
      } else if (op === '-') {
        if (result <= 1) { valid = false; break }
        const b = rand(1, result - 1)
        pickedOps.push(op); terms.push(b); result -= b
      } else if (op === '×') {
        const maxB = Math.min(10, Math.floor(99 / result))
        if (maxB < 2) { valid = false; break }
        const b = rand(2, maxB)
        pickedOps.push(op); terms.push(b); result *= b
      } else { // ÷ — whole-number result only
        const divisors = []
        for (let d = 2; d <= Math.min(10, result); d++) {
          if (result % d === 0) divisors.push(d)
        }
        if (divisors.length === 0) { valid = false; break }
        const b = divisors[rand(0, divisors.length - 1)]
        pickedOps.push(op); terms.push(b); result /= b
      }
    }

    if (valid && result > 0 && Number.isInteger(result)) {
      return { terms, ops: pickedOps, result }
    }
  }

  // Fallback: simple addition
  const a = rand(1, maxN), b = rand(1, maxN)
  return { terms: [a, b], ops: [ops.includes('+') ? '+' : ops[0]], result: a + b }
}

function isSameQuestion(q1, q2) {
  if (!q1 || !q2 || q1.terms.length !== q2.terms.length) return false
  return (
    q1.terms.every((t, i) => t === q2.terms[i]) &&
    q1.ops.every((o, i)   => o === q2.ops[i])
  )
}

export function generateQuestion(correct, mode, lastQuestion) {
  const { blanks, maxN, ops } = getDifficultyConfig(correct, mode)
  let q, tries = 0
  do { q = buildQuestion(blanks, ops, maxN); tries++ }
  while (isSameQuestion(q, lastQuestion) && tries < 10)
  return q
}
