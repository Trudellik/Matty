export const NUMBERS = [
  '0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
  '10', '11', '20', '21', '22', '25', '30', '33', '40', '44',
  '50', '55', '60', '66', '70', '75', '77', '80', '88', '90',
  '99', '100',
]

export const LEVELS = {
  easy:   { cols: 3, rows: 4, pairs: 6,  labelKey: 'nb_level_easy',   descKey: 'nb_level_easy_desc' },
  medium: { cols: 4, rows: 4, pairs: 8,  labelKey: 'nb_level_medium', descKey: 'nb_level_medium_desc' },
  hard:   { cols: 4, rows: 5, pairs: 10, labelKey: 'nb_level_hard',   descKey: 'nb_level_hard_desc' },
}

export const BG_NUMBERS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10']

const gifModules = import.meta.glob('../../assets/number/*.gif', { eager: true })

const gifUrls = Object.fromEntries(
  Object.entries(gifModules).map(([path, mod]) => [path.split('/').pop().replace('.gif', ''), mod.default])
)

export function getNumberGifUrl(id) { return gifUrls[id] ?? '' }

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/**
 * Builds a flat grid of cells for the Number Match game.
 * Each pair: one 'gif' cell (sign) + one 'text' cell (digit) sharing the same value.
 * { id, value, type, matched }
 */
export function buildNumberGrid(pairs) {
  const selected = shuffle(NUMBERS).slice(0, pairs)
  const flat = selected.flatMap(n => [
    { value: n, type: 'gif' },
    { value: n, type: 'text' },
  ])
  return shuffle(flat).map((cell, id) => ({ ...cell, id, matched: false }))
}
