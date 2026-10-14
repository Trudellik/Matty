import blackGif    from '../../assets/colors/gifs/black.gif'
import blueGif     from '../../assets/colors/gifs/blue.gif'
import brownGif    from '../../assets/colors/gifs/brown.gif'
import grayGif     from '../../assets/colors/gifs/gray.gif'
import greenGif    from '../../assets/colors/gifs/green.gif'
import lightRedGif from '../../assets/colors/gifs/light-red.gif'
import orangeGif   from '../../assets/colors/gifs/orange.gif'
import purpleGif   from '../../assets/colors/gifs/purple.gif'
import redGif      from '../../assets/colors/gifs/red.gif'
import whiteGif    from '../../assets/colors/gifs/white.gif'
import yellowGif   from '../../assets/colors/gifs/yellow.gif'
import goldGif     from '../../assets/colors/gifs/gold.gif'
import silverGif   from '../../assets/colors/gifs/silver.gif'

export const COLOR_CARDS = [
  { id: 'red',       gif: redGif,      color: '#e92929' },
  { id: 'blue',      gif: blueGif,     color: '#3b82f6' },
  { id: 'green',     gif: greenGif,    color: '#16d416' },
  { id: 'yellow',    gif: yellowGif,   color: '#eadb08' },
  { id: 'orange',    gif: orangeGif,   color: '#f97316' },
  { id: 'purple',    gif: purpleGif,   color: '#a855f7' },
  { id: 'black',     gif: blackGif,    color: '#202020' },
  { id: 'brown',     gif: brownGif,    color: '#92400e' },
  { id: 'gray',      gif: grayGif,     color: '#555555' },
  { id: 'white',     gif: whiteGif,    color: '#fdfdfd' },
  { id: 'light-red', gif: lightRedGif, color: '#FFC0CB' },
  { id: 'gold',      gif: goldGif,     color: '#FFD700', gradient: 'linear-gradient(135deg, #a17a1a 0%, #ffe9a8 22%, #d4a017 45%, #fff6d5 60%, #b8860b 78%, #ffdf7e 100%)' },
  { id: 'silver',    gif: silverGif,   color: '#C0C0C0', gradient: 'linear-gradient(135deg, #6b6b6b 0%, #f2f2f2 22%, #a8a8a8 45%, #ffffff 60%, #8c8c8c 78%, #e6e6e6 100%)' },
]

export const ALL_BG_COLORS = COLOR_CARDS.map(c => c.color)

// LEVELS store pairs count; grid dimensions are computed at build time
export const LEVELS = {
  easy:   { pairs: 4,  labelKey: 'cm_level_easy',   descKey: 'cm_level_easy_desc'   },
  medium: { pairs: 6,  labelKey: 'cm_level_medium', descKey: 'cm_level_medium_desc' },
  hard:   { pairs: 8,  labelKey: 'cm_level_hard',   descKey: 'cm_level_hard_desc'   },
}

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/** Returns { cols, rows } for a given cell count, preferring wider layouts */
export function gridDims(count) {
  // Try to keep rows >= cols and reasonably square
  for (let cols = Math.ceil(Math.sqrt(count)); cols <= count; cols++) {
    if (count % cols === 0) return { cols, rows: count / cols }
  }
  // Fallback: one row
  return { cols: count, rows: 1 }
}

/**
 * Builds a flat grid for Color Match.
 * selectedTypes: subset of ['gif','color','word'] (at least 2)
 * Each color gets one card per selected type.
 * { id, value, type, gif, color, word, matched }
 */
export function buildColorMatchGrid(pairs, selectedTypes) {
  const types    = selectedTypes ?? ['gif', 'color']
  const selected = shuffle(COLOR_CARDS).slice(0, pairs)

  const flat = selected.flatMap(c =>
    types.map(type => ({ value: c.id, type, gif: c.gif, color: c.color, gradient: c.gradient, word: c.word }))
  )

  return shuffle(flat).map((cell, id) => ({ ...cell, id, matched: false }))
}
