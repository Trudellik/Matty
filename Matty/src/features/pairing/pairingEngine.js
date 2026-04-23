// Pure domain logic — no React, no side effects

// ── Color mode ────────────────────────────────────────────────────────────────

// Base set of origin colors; additional shades are derived from these when more pairs are needed.
export const PAIR_COLORS_BASE = [
  '#ef4444', // red
  '#3b82f6', // blue
  '#facc15', // yellow
  '#22c55e', // green
  '#a855f7', // purple
  '#f97316', // orange
  '#1f2937', // black
  '#f3f4f6', // white
  '#92400e', // brown
]

// Derived shades used when the grid requires more colors than the base set.
const PAIR_COLORS_EXTENDED = [
  '#fca5a5', '#93c5fd', '#fde68a', '#86efac', '#d8b4fe',
  '#fdba74', '#6b7280', '#d1d5db', '#b45309',
]

export const PAIR_COLORS = [...PAIR_COLORS_BASE, ...PAIR_COLORS_EXTENDED]

// ── Number mode ───────────────────────────────────────────────────────────────
// Each pair shares the same number (1–50, cycling). Cell shows the number as text.

// ── Alphabet mode ─────────────────────────────────────────────────────────────
// Each pair shares the same letter (A–Z, cycling). Cell shows the letter.

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'

// ── Generic grid builder ──────────────────────────────────────────────────────

/**
 * Builds a flat array of cell objects for an n×n pairing grid.
 *
 * type: 'color' | 'number' | 'alphabet'
 *
 * Each cell: { id, value, matched }
 *   color    → value is a hex color string (null for wild center)
 *   number   → value is a number string  (null for wild center)
 *   alphabet → value is a letter string  (null for wild center)
 *
 * If n*n is odd the center cell gets value=null (rendered as striped wild cell).
 */
export function buildPairingGrid(n, type) {
  const total     = n * n
  const isOdd     = total % 2 !== 0
  const pairCount = Math.floor(total / 2)

  // Generate pair values
  const pairValues = []
  for (let i = 0; i < pairCount; i++) {
    let v
    if (type === 'color') {
      v = PAIR_COLORS[i % PAIR_COLORS.length]
    } else if (type === 'number') {
      v = String((i % 50) + 1)
    } else {
      // alphabet
      v = ALPHABET[i % ALPHABET.length]
    }
    pairValues.push(v)
  }

  // Two of each value
  const flat = pairValues.flatMap(v => [v, v])

  // Fisher-Yates shuffle
  for (let i = flat.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [flat[i], flat[j]] = [flat[j], flat[i]]
  }

  // Insert null wild cell at center if odd
  if (isOdd) {
    flat.splice(Math.floor(total / 2), 0, null)
  }

  return flat.map((value, id) => ({ id, value, matched: false }))
}

export const TIMED_DURATION_S = 180  // 3 minutes
export const TIMED_START_SIZE = 2
