const readyIds = new Set(
  (import.meta.env.VITE_READY_CHALLENGES ?? '').split(',').map(s => s.trim()).filter(Boolean)
)

const challenges = [
  { id: 'addition',       label: 'Addition',          icon: '➕', description: 'Find pairs that add up to the target',                  scoreType: 'time'  },
  { id: 'operator',       label: 'Operator',           icon: '❓', description: 'Pick the missing operator to complete the equation',    scoreType: 'score', scoreKeys: ['operator_basic', 'operator_full'] },
  { id: 'multiplication', label: 'Multiplication',     icon: '✖️',  description: 'Master the times tables',                              scoreType: 'time'  },
  { id: 'calculation',    label: 'Calculation',        icon: '⚡',  description: 'Answer fast before time runs out',                     scoreType: 'score' },
  { id: 'fractions',      label: 'Fractions',          icon: '½',  description: 'Pick the largest fraction',                            scoreType: 'score' },
  { id: 'maze',           label: 'Math Maze',          icon: '🧩', description: 'Navigate the grid — make the sum match the target',    scoreType: 'score' },
  { id: 'algebra',        label: 'Algebra',            icon: '𝑥',  description: 'Solve for x in linear equations',                     scoreType: 'score', scoreKeys: ['algebra_easy', 'algebra_medium', 'algebra_hard'] },
  { id: 'geometry',       label: 'Geometry',           icon: '📐', description: 'Calculate areas and volumes of shapes',                scoreType: 'score', scoreKeys: ['geometry_easy', 'geometry_medium', 'geometry_hard'] },
  { id: 'sequence',       label: 'Sequences',          icon: '🔢', description: 'Find the missing number in the pattern',               scoreType: 'score', scoreKeys: ['sequence_easy', 'sequence_medium', 'sequence_hard'] },
  { id: 'pairing',        label: 'Pairing',            icon: '🔀', description: 'Match pairs of colors, numbers, or letters',            scoreType: 'time', scoreKey: 'pairing_single' },
  { id: 'colormatch',     label: 'Color Match',        icon: '🎨', description: 'Flip cards and match pairs of color GIFs',                scoreType: 'time'  },
].map(c => ({ ...c, ready: readyIds.has(c.id) }))

export default challenges
