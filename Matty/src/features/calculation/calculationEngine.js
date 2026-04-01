// Pure domain logic — no React, no side effects

export const GAME_CONFIG = {
  MAX_LIVES:       3,
  TIME_PER_Q:      5,
  POINTS_TO_LEVEL: 5,
}

// O: extend by adding rows, never by modifying getDifficultyConfig
const DIFFICULTY_THRESHOLDS = [
  { minLevel: 1,  ops: ['+'] },
  { minLevel: 4,  ops: ['+', '-'] },
  { minLevel: 8,  ops: ['+', '-', '×'] },
  { minLevel: 12, ops: ['+', '-', '×', '÷'] },
]

export function getDifficultyConfig(diff) {
  const entry = [...DIFFICULTY_THRESHOLDS]
    .reverse()
    .find((d) => diff >= d.minLevel)
  return { ops: entry.ops }
}

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

export function generateQuestion(diff) {
  const { ops }  = getDifficultyConfig(diff)
  const op       = ops[Math.floor(Math.random() * ops.length)]
  const addMax   = Math.min(5 + diff * 3, 99)
  const mulMax   = Math.min(diff + 1, 12)
  const divMax   = Math.max(Math.min(diff - 7, 10), 2)
  let x, y, answer

  if (op === '+') {
    x = randInt(1, addMax); y = randInt(1, addMax); answer = x + y
  } else if (op === '-') {
    x = randInt(2, addMax); y = randInt(1, x - 1); answer = x - y
  } else if (op === '×') {
    x = randInt(2, mulMax); y = randInt(2, mulMax); answer = x * y
  } else {
    y = randInt(2, divMax); answer = randInt(2, divMax); x = y * answer
  }

  return { x, op, y, answer }
}

/** Returns the next difficulty and progress after a correct answer. */
export function computeLevelUp(diff, progress, streak, pointsToLevel) {
  const inc         = streak >= 3 ? 2 : 1
  const newProgress = progress + inc
  if (newProgress >= pointsToLevel) {
    return { nextDiff: diff + 1, nextProgress: 0, leveledUp: true }
  }
  return { nextDiff: diff, nextProgress: newProgress, leveledUp: false }
}
