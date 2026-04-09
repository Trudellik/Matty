const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min

function makeChoices(answer, spread = 10) {
  const choices = new Set([answer])
  while (choices.size < 4) {
    const delta = rand(1, spread)
    const sign  = Math.random() < 0.5 ? -1 : 1
    const c     = answer + sign * delta
    if (c > 0) choices.add(c)
  }
  return [...choices].sort(() => Math.random() - 0.5)
}

// ── Easy ──────────────────────────────────────────────────────────
function genRectangle() {
  const w = rand(2, 15), h = rand(2, 15)
  return { shape: 'rectangle', label: 'Area of rectangle', formula: 'A = w × h', dims: { w, h }, answer: w * h }
}
function genSquare() {
  const s = rand(2, 15)
  return { shape: 'square', label: 'Area of square', formula: 'A = s²', dims: { s }, answer: s * s }
}
function genTriangleEasy() {
  const b = rand(2, 14) * 2, h = rand(2, 14)
  return { shape: 'triangle', label: 'Area of triangle', formula: 'A = ½ × b × h', dims: { b, h }, answer: (b * h) / 2 }
}

// ── Medium ────────────────────────────────────────────────────────
function genParallelogram() {
  const b = rand(3, 14), h = rand(3, 14)
  return { shape: 'parallelogram', label: 'Area of parallelogram', formula: 'A = b × h', dims: { b, h }, answer: b * h }
}
function genTrapezoid() {
  const a = rand(3, 10), b = rand(5, 15), h = rand(2, 10)
  return { shape: 'trapezoid', label: 'Area of trapezoid', formula: 'A = ½(a+b)×h', dims: { a, b, h }, answer: ((a + b) * h) / 2 }
}
function genTrianglePyth() {
  const triples = [[3,4,5],[5,12,13],[8,15,17],[7,24,25],[6,8,10],[9,12,15]]
  const [a, b]  = triples[rand(0, triples.length - 1)]
  return { shape: 'triangle-pyth', label: 'Area of right triangle', formula: 'A = ½ × a × b', dims: { a, b }, answer: (a * b) / 2 }
}
function genTriangleMedium() {
  const b = rand(4, 18) * 2, h = rand(3, 15)
  return { shape: 'triangle', label: 'Area of triangle', formula: 'A = ½ × b × h', dims: { b, h }, answer: (b * h) / 2 }
}

// ── Hard ──────────────────────────────────────────────────────────
function genCubeVolume() {
  const s = rand(2, 10)
  return { shape: 'cube', label: 'Volume of cube', formula: 'V = s³', dims: { s }, answer: s * s * s }
}
function genCubeSurface() {
  const s = rand(2, 10)
  return { shape: 'cube', label: 'Surface area of cube', formula: 'SA = 6s²', dims: { s }, answer: 6 * s * s }
}
function genPrismVolume() {
  const l = rand(2, 10), w = rand(2, 10), h = rand(2, 10)
  return { shape: 'prism', label: 'Volume of rectangular prism', formula: 'V = l × w × h', dims: { l, w, h }, answer: l * w * h }
}
function genCylinderVolume() {
  const r = rand(2, 8), h = rand(2, 10)
  const PI = 3
  return { shape: 'cylinder', label: 'Volume of cylinder (π≈3)', formula: 'V = π × r² × h', dims: { r, h }, answer: PI * r * r * h }
}

const EASY_GEN   = [genRectangle, genSquare, genTriangleEasy]
const MEDIUM_GEN = [genParallelogram, genTrapezoid, genTrianglePyth, genTriangleMedium]
const HARD_GEN   = [genCubeVolume, genCubeSurface, genPrismVolume, genCylinderVolume]

export const LEVELS = {
  easy:   { labelKey: 'geo_level_easy',   descKey: 'geo_level_easy_desc',   generators: EASY_GEN,   timePerQ: 20, MAX_LIVES: 3 },
  medium: { labelKey: 'geo_level_medium', descKey: 'geo_level_medium_desc', generators: MEDIUM_GEN, timePerQ: 25, MAX_LIVES: 3 },
  hard:   { labelKey: 'geo_level_hard',   descKey: 'geo_level_hard_desc',   generators: HARD_GEN,   timePerQ: 30, MAX_LIVES: 3 },
}

export function generateQuestion(level) {
  const gens = LEVELS[level].generators
  const q    = gens[rand(0, gens.length - 1)]()
  return { ...q, choices: makeChoices(q.answer, level === 'hard' ? 30 : 15) }
}
