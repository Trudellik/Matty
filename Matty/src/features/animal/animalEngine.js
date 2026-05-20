export const ANIMALS = [
  { id: 'bee',       en: 'Bee',        da: 'Bi' },
  { id: 'bird',      en: 'Bird',       da: 'Fugl' },
  { id: 'calf',      en: 'Calf',       da: 'Kalv',       minLevel: 'medium' },
  { id: 'camel',     en: 'Camel',      da: 'Kamel' },
  { id: 'cat',       en: 'Cat',        da: 'Kat' },
  { id: 'codfish',   en: 'Cod',        da: 'Torsk',      minLevel: 'hard' },
  { id: 'cow',       en: 'Cow',        da: 'Ko' },
  { id: 'deer',      en: 'Deer',       da: 'Hjort' },
  { id: 'dog',       en: 'Dog',        da: 'Hund' },
  { id: 'duck',      en: 'Duck',       da: 'And' },
  { id: 'eel',       en: 'Eel',        da: 'Ål',         minLevel: 'hard' },
  { id: 'elephant',  en: 'Elephant',   da: 'Elefant' },
  { id: 'fish',      en: 'Fish',       da: 'Fisk' },
  { id: 'fly',       en: 'Fly',        da: 'Flue' },
  { id: 'frog',      en: 'Frog',       da: 'Frø' },
  { id: 'giraffe',   en: 'Giraffe',    da: 'Giraf' },
  { id: 'goat',      en: 'Goat',       da: 'Ged' },
  { id: 'goose',     en: 'Goose',      da: 'Gås',        minLevel: 'medium' },
  { id: 'guineapig', en: 'Guinea Pig', da: 'Marsvin',    minLevel: 'medium' },
  { id: 'hamster',   en: 'Hamster',    da: 'Hamster',    minLevel: 'medium' },
  { id: 'hedgehog',  en: 'Hedgehog',   da: 'Pindsvin' },
  { id: 'herring',   en: 'Herring',    da: 'Sild',       minLevel: 'hard' },
  { id: 'hippo',     en: 'Hippo',      da: 'Flodhest' },
  { id: 'horse',     en: 'Horse',      da: 'Hest' },
  { id: 'ladybug',   en: 'Ladybug',    da: 'Mariehøne' },
  { id: 'lion',      en: 'Lion',       da: 'Løve' },
  { id: 'monkey',    en: 'Monkey',     da: 'Abe' },
  { id: 'mouse',     en: 'Mouse',      da: 'Mus' },
  { id: 'pig',       en: 'Pig',        da: 'Gris' },
  { id: 'pigeon',    en: 'Pigeon',     da: 'Due' },
  { id: 'pinguin',   en: 'Penguin',    da: 'Pingvin' },
  { id: 'rat',       en: 'Rat',        da: 'Rotte',      minLevel: 'medium' },
  { id: 'rhino',     en: 'Rhino',      da: 'Næsehorn' },
  { id: 'rooster',   en: 'Rooster',    da: 'Hane' },
  { id: 'salmon',    en: 'Salmon',     da: 'Laks',       minLevel: 'hard' },
  { id: 'sheep',     en: 'Sheep',      da: 'Får' },
  { id: 'shrimp',    en: 'Shrimp',     da: 'Reje' },
  { id: 'squirrel',  en: 'Squirrel',   da: 'Egern' },
  { id: 'tiger',     en: 'Tiger',      da: 'Tiger' },
  { id: 'turkey',    en: 'Turkey',     da: 'Kalkun' },
  { id: 'wolf',      en: 'Wolf',       da: 'Ulv',        minLevel: 'medium' },
  { id: 'worm',      en: 'Worm',       da: 'Orm' },
]

export const LEVELS = {
  easy:   { cols: 3, rows: 4, pairs: 6,  labelKey: 'an_level_easy',   descKey: 'an_level_easy_desc' },
  medium: { cols: 4, rows: 4, pairs: 8,  labelKey: 'an_level_medium', descKey: 'an_level_medium_desc' },
  hard:   { cols: 4, rows: 5, pairs: 10, labelKey: 'an_level_hard',   descKey: 'an_level_hard_desc' },
}

export const BG_ANIMALS = ['bee', 'cat', 'dog', 'duck', 'frog', 'horse', 'lion', 'monkey', 'pig', 'bird']

const gifModules = import.meta.glob('../../assets/animal/gifs/*.gif', { eager: true })
const jpgModules = import.meta.glob('../../assets/animal/photos/*.jpg', { eager: true })

const gifUrls = Object.fromEntries(
  Object.entries(gifModules).map(([path, mod]) => [path.split('/').pop().replace('.gif', ''), mod.default])
)
const jpgUrls = Object.fromEntries(
  Object.entries(jpgModules).map(([path, mod]) => [path.split('/').pop().replace('.jpg', ''), mod.default])
)

export function getAnimalGifUrl(id) { return gifUrls[id] ?? '' }
export function getAnimalJpgUrl(id) { return jpgUrls[id] ?? '' }

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

const LEVEL_ORDER = ['easy', 'medium', 'hard']

export function buildAnimalGrid(pairs, level = 'easy') {
  const eligible = ANIMALS.filter(a =>
    !a.minLevel || LEVEL_ORDER.indexOf(level) >= LEVEL_ORDER.indexOf(a.minLevel)
  )
  const selected = shuffle(eligible).slice(0, pairs)
  const flat = selected.flatMap(a => [
    { value: a.id, type: 'gif', animal: a },
    { value: a.id, type: 'jpg', animal: a },
  ])
  return shuffle(flat).map((cell, id) => ({ ...cell, id, matched: false }))
}
