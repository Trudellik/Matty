const readySigneIds = new Set(
  (import.meta.env.VITE_READY_SIGNE_CHALLENGES ?? '').split(',').map(s => s.trim()).filter(Boolean)
)

const signeChallenges = [
  { id: 'colormatch',     label: 'Color Match',       icon: '🎨', description: 'Flip cards and match pairs of color GIFs',                       scoreType: 'time'  },
  { id: 'fingerspelling', label: 'Fingerspelling',    icon: '🤟', description: 'Learn the manual alphabet — spell words letter by letter',        scoreType: 'score' },
  { id: 'signmatch',      label: 'Sign Match',        icon: '👐', description: 'Match a sign image to the correct word',                          scoreType: 'score' },
  { id: 'wordbuilder',    label: 'Word Builder',      icon: '🔤', description: 'Arrange letters to build the target word',                        scoreType: 'time'  },
  { id: 'readingflow',    label: 'Reading Flow',      icon: '📖', description: 'Read sentences and answer comprehension questions',                scoreType: 'score' },
  { id: 'letterorder',   label: 'Letter Order',      icon: '🔡', description: 'Put scrambled letters in alphabetical order',                     scoreType: 'time'  },
  { id: 'wordchain',     label: 'Word Chain',        icon: '🔗', description: 'Build a chain — each word starts with the last letter of the previous', scoreType: 'score' },
  { id: 'rhymetime',     label: 'Rhyme Time',        icon: '🎵', description: 'Pick the word that rhymes with the target',                       scoreType: 'score' },
  { id: 'syllables',     label: 'Syllables',         icon: '🗣️', description: 'Count the syllables in each spoken word',                         scoreType: 'score' },
].map(c => ({ ...c, ready: readySigneIds.has(c.id) }))

export default signeChallenges
