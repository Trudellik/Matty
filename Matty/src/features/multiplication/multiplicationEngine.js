// Pure domain logic — no React, no side effects

// O: add levels here without touching game or rendering logic
export const LEVELS = {
  easy:   { size: 10, labelKey: 'mult_level_easy',   descKey: 'mult_level_easy_desc' },
  medium: { size: 10, labelKey: 'mult_level_medium', descKey: 'mult_level_medium_desc' },
  hard:   { size: 15, labelKey: 'mult_level_hard',   descKey: 'mult_level_hard_desc' },
}

export function isPrefilled(row, col, level) {
  return level === 'easy' && row >= 6 && col >= 6
}

/** Returns a Fisher-Yates–shuffled list of cells to fill for the given level.
 *  Row 1 and col 1 are the shared header axes (1×n=n, n×1=n), so cells
 *  start at row=2, col=2. */
export function buildCellsToFill(size, level) {
  const cells = []
  for (let r = 2; r <= size; r++)
    for (let c = 2; c <= size; c++)
      if (!isPrefilled(r, c, level)) cells.push([r, c])

  for (let i = cells.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [cells[i], cells[j]] = [cells[j], cells[i]]
  }
  return cells
}
