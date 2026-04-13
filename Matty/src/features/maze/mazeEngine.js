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

// Single attempt at a winding self-avoiding path with the non-adjacency
// constraint. Returns the path array on success, or null if the step budget
// is exhausted (caller retries with fresh randomness).
function attemptPath() {
  const N       = GRID_SIZE
  const pathSet = new Set(['0,0'])
  const path    = [[0, 0]]
  const dirStack = [shuffle([...DIRS])]

  for (let steps = 0; steps < 300_000; steps++) {
    const top = path[path.length - 1]
    if (!top) return null                        // backtracked past start

    const [r, c] = top
    if (r === N - 1 && c === N - 1) return path // reached exit ✓

    const remaining = dirStack[dirStack.length - 1]

    if (!remaining.length) {
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

    // Non-adjacency: candidate must not touch any path cell except current
    const crowded = DIRS.some(([er, ec]) => {
      const ar = nr + er, ac = nc + ec
      if (ar === r && ac === c) return false
      return pathSet.has(`${ar},${ac}`)
    })
    if (crowded) continue

    pathSet.add(key)
    path.push([nr, nc])

    const others  = DIRS.filter(([d0, d1]) => d0 !== dr || d1 !== dc)
    const ordered = Math.random() < 0.6
      ? [[dr, dc], ...shuffle(others)]
      : shuffle([...DIRS])
    dirStack.push(ordered)
  }

  return null // step budget hit — caller will retry
}

// Keeps retrying until a valid path is found (usually succeeds first try).
function generatePath() {
  for (;;) {
    const path = attemptPath()
    if (path) return path
  }
}

export function generateMaze(target) {
  const N   = GRID_SIZE
  const tgt = (target != null) ? target : rand(10, 18)
  const path   = generatePath()

  // Start with all cells having wrong expressions
  const grid = Array.from({ length: N }, () =>
    Array.from({ length: N }, () => makeWrongExpr(tgt))
  )

  // Mark every path cell as correct
  for (const [r, c] of path) {
    grid[r][c] = makeCorrectExpr(tgt)
  }

  return { grid, target: tgt }
}
