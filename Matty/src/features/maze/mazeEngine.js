// Pure domain logic — no React, no side effects

export const GRID_SIZE = 20

const DIRS = [[-1,0],[1,0],[0,-1],[0,1]]

function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// a+b = target, a and b both ≥ 1
function makeCorrectExpr(target) {
  const a = rand(1, target - 1)
  return { expr: `${a}+${target - a}`, valid: true }
}

// a+b ≠ target — kept close in value so the player can't trivially skip
function makeWrongExpr(target) {
  let a, b
  do {
    a = rand(1, Math.min(target + 4, 18))
    b = rand(1, Math.min(target + 4, 18))
  } while (a + b === target || a < 1 || b < 1)
  return { expr: `${a}+${b}`, valid: false }
}

// Random winding path from (0,0) to (N-1,N-1).
//
// Rules that guarantee "exactly one valid unvisited neighbour" at every step:
//   1. Self-avoiding: never revisit a cell.
//   2. Non-adjacent: no two non-consecutive path cells share an edge
//      (so no shortcuts appear during gameplay).
//
// Generation uses an iterative DFS with a per-position candidate stack so
// backtracking never re-tries a direction that already failed.
// Momentum: 60% chance the new cell inherits the same direction preference.
function generatePath() {
  const N       = GRID_SIZE
  const pathSet = new Set(['0,0'])
  const path    = [[0, 0]]

  // dirStack[i] = ordered list of directions still to try from path[i]
  const dirStack = [shuffle([...DIRS])]

  while (true) {
    const [r, c]    = path[path.length - 1]
    if (r === N - 1 && c === N - 1) break

    const remaining = dirStack[dirStack.length - 1]

    if (!remaining.length) {
      // Exhausted all options here — backtrack
      path.pop()
      pathSet.delete(`${r},${c}`)
      dirStack.pop()
      continue
    }

    const [dr, dc] = remaining.shift()
    const nr = r + dr, nc = c + dc

    if (nr < 0 || nr >= N || nc < 0 || nc >= N) continue

    const key = `${nr},${nc}`
    if (pathSet.has(key)) continue

    // Reject if the candidate cell touches any existing path cell other than
    // the current cell — this preserves the unique-next-step guarantee.
    const crowded = DIRS.some(([er, ec]) => {
      const ar = nr + er, ac = nc + ec
      if (ar === r && ac === c) return false   // current cell — OK
      return pathSet.has(`${ar},${ac}`)
    })
    if (crowded) continue

    // Commit the move
    pathSet.add(key)
    path.push([nr, nc])

    // Build direction order for the new cell: 60% momentum (same dir first)
    const others  = DIRS.filter(([d0, d1]) => d0 !== dr || d1 !== dc)
    const ordered = Math.random() < 0.6
      ? [[dr, dc], ...shuffle(others)]
      : shuffle([...DIRS])
    dirStack.push(ordered)
  }

  return path
}

export function generateMaze() {
  const N      = GRID_SIZE
  const target = rand(10, 18)
  const path   = generatePath()

  // Start with all cells having wrong expressions
  const grid = Array.from({ length: N }, () =>
    Array.from({ length: N }, () => makeWrongExpr(target))
  )

  // Mark every path cell as correct
  for (const [r, c] of path) {
    grid[r][c] = makeCorrectExpr(target)
  }

  return { grid, target }
}
