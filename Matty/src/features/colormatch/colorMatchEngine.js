import blackGif    from '../../assets/gifs/colors/black.gif'
import blueGif     from '../../assets/gifs/colors/blue.gif'
import brownGif    from '../../assets/gifs/colors/brown.gif'
import grayGif     from '../../assets/gifs/colors/gray.gif'
import greenGif    from '../../assets/gifs/colors/green.gif'
import lightRedGif from '../../assets/gifs/colors/light-red.gif'
import orangeGif   from '../../assets/gifs/colors/orange.gif'
import purpleGif   from '../../assets/gifs/colors/purple.gif'
import redGif      from '../../assets/gifs/colors/red.gif'
import whiteGif    from '../../assets/gifs/colors/white.gif'
import yellowGif   from '../../assets/gifs/colors/yellow.gif'

export const COLOR_CARDS = [
  { id: 'red',       gif: redGif,      color: '#e92929' },
  { id: 'blue',      gif: blueGif,     color: '#3b82f6' },
  { id: 'green',     gif: greenGif,    color: '#16d416' },
  { id: 'yellow',    gif: yellowGif,   color: '#eadb08' },
  { id: 'orange',    gif: orangeGif,   color: '#f97316' },
  { id: 'purple',    gif: purpleGif,   color: '#a855f7' },
  { id: 'black',     gif: blackGif,    color: '#202020' },
  { id: 'brown',     gif: brownGif,    color: '#92400e' },
  { id: 'gray',      gif: grayGif,     color: '#6b7280' },
  { id: 'white',     gif: whiteGif,    color: '#ededff' },
  { id: 'light-red', gif: lightRedGif, color: '#FFC0CB' },
]

export const ALL_BG_COLORS = COLOR_CARDS.map(c => c.color)

export const LEVELS = {
  easy:   { cols: 3, rows: 4, pairs: 6,  labelKey: 'cm_level_easy',   descKey: 'cm_level_easy_desc' },
  medium: { cols: 4, rows: 4, pairs: 8,  labelKey: 'cm_level_medium', descKey: 'cm_level_medium_desc' },
  hard:   { cols: 4, rows: 5, pairs: 10, labelKey: 'cm_level_hard',   descKey: 'cm_level_hard_desc' },
}

/**
 * Builds a flat grid of cells for the Color Match game.
 * Each pair: one 'gif' cell + one 'color' cell sharing the same value (colorId).
 * { id, value, type, gif, color, matched }
 */
export function buildColorMatchGrid(pairs) {
  // Shuffle the full palette so every game picks a different set of colors
  const shuffled = [...COLOR_CARDS]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  const selected = shuffled.slice(0, pairs)

  const flat = selected.flatMap(c => [
    { value: c.id, type: 'gif',   gif: c.gif,  color: c.color },
    { value: c.id, type: 'color', gif: null,   color: c.color },
  ])

  // Fisher-Yates shuffle
  for (let i = flat.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[flat[i], flat[j]] = [flat[j], flat[i]]
  }

  return flat.map((cell, id) => ({ ...cell, id, matched: false }))
}
