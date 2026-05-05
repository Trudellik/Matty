export const ANIMALS = [
  { id: 'bee',       en: 'Bee',        da: 'Bi' },
  { id: 'bird',      en: 'Bird',       da: 'Fugl' },
  { id: 'calf',      en: 'Calf',       da: 'Kalv' },
  { id: 'camel',     en: 'Camel',      da: 'Kamel' },
  { id: 'cat',       en: 'Cat',        da: 'Kat' },
  { id: 'codfish',   en: 'Cod',        da: 'Torsk' },
  { id: 'cow',       en: 'Cow',        da: 'Ko' },
  { id: 'deer',      en: 'Deer',       da: 'Hjort' },
  { id: 'dog',       en: 'Dog',        da: 'Hund' },
  { id: 'duck',      en: 'Duck',       da: 'And' },
  { id: 'eel',       en: 'Eel',        da: 'Ål' },
  { id: 'elephant',  en: 'Elephant',   da: 'Elefant' },
  { id: 'fish',      en: 'Fish',       da: 'Fisk' },
  { id: 'fly',       en: 'Fly',        da: 'Flue' },
  { id: 'frog',      en: 'Frog',       da: 'Frø' },
  { id: 'giraffe',   en: 'Giraffe',    da: 'Giraf' },
  { id: 'goat',      en: 'Goat',       da: 'Ged' },
  { id: 'goose',     en: 'Goose',      da: 'Gås' },
  { id: 'guineapig', en: 'Guinea Pig', da: 'Marsvin' },
  { id: 'hamster',   en: 'Hamster',    da: 'Hamster' },
  { id: 'hedgehog',  en: 'Hedgehog',   da: 'Pindsvin' },
  { id: 'herring',   en: 'Herring',    da: 'Sild' },
  { id: 'hippo',     en: 'Hippo',      da: 'Flodhest' },
  { id: 'horse',     en: 'Horse',      da: 'Hest' },
  { id: 'ladybug',   en: 'Ladybug',    da: 'Mariehøne' },
  { id: 'lion',      en: 'Lion',       da: 'Løve' },
  { id: 'monkey',    en: 'Monkey',     da: 'Abe' },
  { id: 'mouse',     en: 'Mouse',      da: 'Mus' },
  { id: 'pig',       en: 'Pig',        da: 'Gris' },
  { id: 'pigeon',    en: 'Pigeon',     da: 'Due' },
  { id: 'pinguin',   en: 'Penguin',    da: 'Pingvin' },
  { id: 'rat',       en: 'Rat',        da: 'Rotte' },
  { id: 'rhino',     en: 'Rhino',      da: 'Næsehorn' },
  { id: 'rooster',   en: 'Rooster',    da: 'Hane' },
  { id: 'salmon',    en: 'Salmon',     da: 'Laks' },
  { id: 'sheep',     en: 'Sheep',      da: 'Får' },
  { id: 'shrimp',    en: 'Shrimp',     da: 'Reje' },
  { id: 'squirrel',  en: 'Squirrel',   da: 'Egern' },
  { id: 'tiger',     en: 'Tiger',      da: 'Tiger' },
  { id: 'turkey',    en: 'Turkey',     da: 'Kalkun' },
  { id: 'wolf',      en: 'Wolf',       da: 'Ulv' },
  { id: 'worm',      en: 'Worm',       da: 'Orm' },
]

export const LEVELS = {
  easy:   { cols: 3, rows: 4, pairs: 6,  labelKey: 'an_level_easy',   descKey: 'an_level_easy_desc' },
  medium: { cols: 4, rows: 4, pairs: 8,  labelKey: 'an_level_medium', descKey: 'an_level_medium_desc' },
  hard:   { cols: 4, rows: 5, pairs: 10, labelKey: 'an_level_hard',   descKey: 'an_level_hard_desc' },
}

export const BG_ANIMALS = ['bee', 'cat', 'dog', 'duck', 'frog', 'horse', 'lion', 'monkey', 'pig', 'bird']

export function getAnimalGifUrl(id) { return `/animal/${id}.gif` }
export function getAnimalJpgUrl(id) { return `/animal/${id}.jpg` }

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export function buildAnimalGrid(pairs) {
  const selected = shuffle(ANIMALS).slice(0, pairs)
  const flat = selected.flatMap(a => [
    { value: a.id, type: 'gif', animal: a },
    { value: a.id, type: 'jpg', animal: a },
  ])
  return shuffle(flat).map((cell, id) => ({ ...cell, id, matched: false }))
}
