const challenges = [
  { id: 'addition',       label: 'Addition',          icon: '➕', description: 'Find pairs that add up to the target',                  scoreType: 'time',  ready: true },
  { id: 'operator',       label: 'Operator',           icon: '❓', description: 'Pick the missing operator to complete the equation',    scoreType: 'score', ready: true, scoreKeys: ['operator_basic', 'operator_full'] },
  { id: 'multiplication', label: 'Multiplication',     icon: '✖️',  description: 'Master the times tables',                              scoreType: 'time',  ready: true },
  { id: 'calculation',    label: 'Calculation',        icon: '⚡',  description: 'Answer fast before time runs out',                     scoreType: 'score', ready: true },
  { id: 'fractions',      label: 'Fractions',          icon: '½',  description: 'Pick the largest fraction',                            scoreType: 'score', ready: true },
  { id: 'maze',           label: 'Math Maze',          icon: '🧩', description: 'Navigate the grid — make the sum match the target',    scoreType: 'score', ready: true },
  { id: 'algebra',        label: 'Algebra',            icon: '𝑥',  description: 'Solve for x in linear equations',                     scoreType: 'score', ready: true, scoreKeys: ['algebra_easy', 'algebra_medium', 'algebra_hard'] },
  { id: 'geometry',       label: 'Geometry',           icon: '📐', description: 'Calculate areas and volumes of shapes',                scoreType: 'score', ready: true, scoreKeys: ['geometry_easy', 'geometry_medium', 'geometry_hard'] },
  { id: 'sequence',       label: 'Sequences',          icon: '🔢', description: 'Find the missing number in the pattern',               scoreType: 'score', ready: true, scoreKeys: ['sequence_easy', 'sequence_medium', 'sequence_hard'] },
  { id: 'pairing',        label: 'Pairing',            icon: '🔀', description: 'Match pairs of colors, numbers, or letters',            scoreType: 'time',  ready: true, scoreKey: 'pairing_single' },
  
]

export default challenges
