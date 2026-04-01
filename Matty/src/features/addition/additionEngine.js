// Pure domain logic — no React, no side effects

export const LEVELS = {
  easy:   { cols: 4, rows: 4, target: 10, labelKey: 'add_level_easy',   descKey: 'add_level_easy_desc' },
  medium: { cols: 6, rows: 4, target: 15, labelKey: 'add_level_medium', descKey: 'add_level_medium_desc' },
  hard:   { cols: 6, rows: 6, target: 20, labelKey: 'add_level_hard',   descKey: 'add_level_hard_desc' },
}

/**
 * Builds a flat array of cell objects whose values are shuffled pairs
 * that all sum to `target`. Every cell has exactly one valid partner.
 */
export function buildGrid(cols, rows, target) {
  const pairCount = (cols * rows) / 2

  // All distinct pair types (a, b) where a <= b and a + b = target, a >= 1
  const pairTypes = []
  for (let a = 1; a <= Math.floor(target / 2); a++) {
    pairTypes.push([a, target - a])
  }

  // Cycle through pair types to fill the board
  const numbers = []
  for (let i = 0; i < pairCount; i++) {
    const [a, b] = pairTypes[i % pairTypes.length]
    numbers.push(a, b)
  }

  // Fisher-Yates shuffle
  for (let i = numbers.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [numbers[i], numbers[j]] = [numbers[j], numbers[i]]
  }

  return numbers.map((value, id) => ({ id, value, matched: false }))
}
