// Pure domain logic — no React, no side effects

// Colors used for pairing. Two cells per color, unless grid is odd (one wild/empty center cell).
export const PAIR_COLORS = [
  '#ef4444', // red
  '#3b82f6', // blue
  '#22c55e', // green
  '#f59e0b', // amber
  '#a855f7', // purple
  '#ec4899', // pink
  '#14b8a6', // teal
  '#f97316', // orange
  '#6366f1', // indigo
  '#84cc16', // lime
  '#06b6d4', // cyan
  '#e11d48', // rose
  '#8b5cf6', // violet
  '#10b981', // emerald
  '#d97706', // yellow-dark
  '#0ea5e9', // sky
  '#be185d', // fuchsia-dark
  '#16a34a', // green-dark
  '#7c3aed', // violet-dark
  '#b45309', // amber-dark
  '#0284c7', // blue-dark
  '#dc2626', // red-dark
  '#059669', // emerald-dark
  '#7e22ce', // purple-dark
  '#c2410c', // orange-dark
]

/**
 * Builds a flat array of cell objects for the color-pair grid.
 * - n×n grid
 * - If n*n is odd, the center cell gets color null (wild/empty)
 * - All other cells come in matched color pairs, shuffled
 */
export function buildColorGrid(n) {
  const total     = n * n
  const isOdd     = total % 2 !== 0
  const pairCount = Math.floor(total / 2)

  // Pick enough colors (cycle if needed)
  const colors = []
  for (let i = 0; i < pairCount; i++) {
    colors.push(PAIR_COLORS[i % PAIR_COLORS.length])
  }

  // Two of each color
  const flat = colors.flatMap(c => [c, c])

  // Fisher-Yates shuffle
  for (let i = flat.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [flat[i], flat[j]] = [flat[j], flat[i]]
  }

  // Insert null (wild) at the center if odd
  if (isOdd) {
    const center = Math.floor(total / 2)
    flat.splice(center, 0, null)
  }

  return flat.map((color, id) => ({ id, color, matched: false }))
}

/**
 * Returns the index of the center cell for an n×n grid (when odd).
 */
export function centerIdx(n) {
  return Math.floor((n * n) / 2)
}

/**
 * Starting grid size and the sequence of sizes for timed mode.
 * Starts at 2×2, expands by 1 each completed round, up to whatever fits in 3 min.
 */
export const TIMED_DURATION_S = 180  // 3 minutes
export const TIMED_START_SIZE = 2
