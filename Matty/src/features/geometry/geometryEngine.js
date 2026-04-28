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
  return { shape: 'rectangle', labelKey: 'geo_q_rectangle', formulaKey: 'geo_f_rectangle', qType: 'area', dims: { w, h }, answer: w * h }
}
function genSquare() {
  const s = rand(2, 15)
  return { shape: 'square', labelKey: 'geo_q_square', formulaKey: 'geo_f_square', qType: 'area', dims: { s }, answer: s * s }
}
function genTriangleEasy() {
  const b = rand(2, 14) * 2, h = rand(2, 14)
  return { shape: 'triangle', labelKey: 'geo_q_triangle', formulaKey: 'geo_f_triangle', qType: 'area', dims: { b, h }, answer: (b * h) / 2 }
}
function genRectanglePerim() {
  const w = rand(2, 15), h = rand(2, 15)
  return { shape: 'rectangle', labelKey: 'geo_q_rectangle_perim', formulaKey: 'geo_f_rectangle_perim', qType: 'perimeter', dims: { w, h }, answer: 2 * (w + h) }
}
function genSquarePerim() {
  const s = rand(2, 15)
  return { shape: 'square', labelKey: 'geo_q_square_perim', formulaKey: 'geo_f_square_perim', qType: 'perimeter', dims: { s }, answer: 4 * s }
}

// ── Medium ────────────────────────────────────────────────────────
function genParallelogram() {
  const b = rand(3, 14), h = rand(3, 14)
  return { shape: 'parallelogram', labelKey: 'geo_q_parallelogram', formulaKey: 'geo_f_parallelogram', qType: 'area', dims: { b, h }, answer: b * h }
}
function genTrapezoid() {
  const a = rand(3, 10), b = rand(5, 15), h = rand(2, 10)
  return { shape: 'trapezoid', labelKey: 'geo_q_trapezoid', formulaKey: 'geo_f_trapezoid', qType: 'area', dims: { a, b, h }, answer: ((a + b) * h) / 2 }
}
function genTrianglePyth() {
  const triples = [[3,4,5],[5,12,13],[8,15,17],[7,24,25],[6,8,10],[9,12,15]]
  const [a, b]  = triples[rand(0, triples.length - 1)]
  return { shape: 'triangle-pyth', labelKey: 'geo_q_right_triangle', formulaKey: 'geo_f_right_triangle', qType: 'area', dims: { a, b }, answer: (a * b) / 2 }
}
function genTriangleMedium() {
  const b = rand(4, 18) * 2, h = rand(3, 15)
  return { shape: 'triangle', labelKey: 'geo_q_triangle', formulaKey: 'geo_f_triangle', qType: 'area', dims: { b, h }, answer: (b * h) / 2 }
}
function genRightTrianglePerim() {
  const triples = [[3,4,5],[5,12,13],[8,15,17],[6,8,10],[9,12,15]]
  const [a, b, c] = triples[rand(0, triples.length - 1)]
  return { shape: 'triangle-pyth', labelKey: 'geo_q_right_triangle_perim', formulaKey: 'geo_f_right_triangle_perim', qType: 'perimeter', dims: { a, b, c }, answer: a + b + c }
}

// ── Hard ──────────────────────────────────────────────────────────
function genCubeVolume() {
  const s = rand(2, 10)
  return { shape: 'cube', labelKey: 'geo_q_cube_vol', formulaKey: 'geo_f_cube_vol', qType: 'area', dims: { s }, answer: s * s * s }
}
function genCubeSurface() {
  const s = rand(2, 10)
  return { shape: 'cube', labelKey: 'geo_q_cube_sa', formulaKey: 'geo_f_cube_sa', qType: 'area', dims: { s }, answer: 6 * s * s }
}
function genPrismVolume() {
  const l = rand(2, 10), w = rand(2, 10), h = rand(2, 10)
  return { shape: 'prism', labelKey: 'geo_q_prism_vol', formulaKey: 'geo_f_prism_vol', qType: 'area', dims: { l, w, h }, answer: l * w * h }
}
function genCylinderVolume() {
  const r = rand(2, 8), h = rand(2, 10)
  const PI = 3
  return { shape: 'cylinder', labelKey: 'geo_q_cylinder_vol', formulaKey: 'geo_f_cylinder_vol', qType: 'area', dims: { r, h }, answer: PI * r * r * h }
}

const EASY_GEN   = [genRectangle, genSquare, genTriangleEasy, genRectanglePerim, genSquarePerim]
const MEDIUM_GEN = [genParallelogram, genTrapezoid, genTrianglePyth, genTriangleMedium, genRightTrianglePerim]
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
