export const FRUITS = [
  { id: 'almond',      en: 'Almond',      da: 'Mandel' },
  { id: 'apple',       en: 'Apple',       da: 'Æble' },
  { id: 'avocado',     en: 'Avocado',     da: 'Avocado' },
  { id: 'banana',      en: 'Banana',      da: 'Banan' },
  { id: 'blackberry',  en: 'Blackberry',  da: 'Brombær' },
  { id: 'carrot',      en: 'Carrot',      da: 'Gulerod' },
  { id: 'cauliflower', en: 'Cauliflower', da: 'Blomkål' },
  { id: 'corn',        en: 'Corn',        da: 'Majs' },
  { id: 'cucumber',    en: 'Cucumber',    da: 'Agurk' },
  { id: 'grape',       en: 'Grape',       da: 'Drue' },
  { id: 'lemon',       en: 'Lemon',       da: 'Citron' },
  { id: 'nut',         en: 'Nut',         da: 'Nød' },
  { id: 'onion',       en: 'Onion',       da: 'Løg' },
  { id: 'orange',      en: 'Orange',      da: 'Appelsin' },
  { id: 'pear',        en: 'Pear',        da: 'Pære' },
  { id: 'pineapple',   en: 'Pineapple',   da: 'Ananas' },
  { id: 'plume',       en: 'Plum',        da: 'Blomme' },
  { id: 'potato',      en: 'Potato',      da: 'Kartoffel' },
  { id: 'rhubarb',     en: 'Rhubarb',     da: 'Rabarber' },
  { id: 'salad',       en: 'Salad',       da: 'Salat' },
  { id: 'strawberry',  en: 'Strawberry',  da: 'Jordbær' },
  { id: 'tomato',      en: 'Tomato',      da: 'Tomat' },
  { id: 'vegetables',  en: 'Vegetables',  da: 'Grøntsager' },
]

export const LEVELS = {
  easy:   { cols: 3, rows: 4, pairs: 6,  labelKey: 'ft_level_easy',   descKey: 'ft_level_easy_desc' },
  medium: { cols: 4, rows: 4, pairs: 8,  labelKey: 'ft_level_medium', descKey: 'ft_level_medium_desc' },
  hard:   { cols: 4, rows: 5, pairs: 10, labelKey: 'ft_level_hard',   descKey: 'ft_level_hard_desc' },
}

export const BG_FRUITS = ['apple', 'banana', 'orange', 'strawberry', 'grape', 'pineapple', 'carrot', 'tomato', 'pear', 'lemon']

const gifModules = import.meta.glob('../../assets/fruits/gifs/*.gif', { eager: true })
const pngModules = import.meta.glob('../../assets/fruits/photos/*.png', { eager: true })

const gifUrls = Object.fromEntries(
  Object.entries(gifModules).map(([path, mod]) => [path.split('/').pop().replace('.gif', ''), mod.default])
)
const pngUrls = Object.fromEntries(
  Object.entries(pngModules).map(([path, mod]) => [path.split('/').pop().replace('.png', ''), mod.default])
)

export function getFruitGifUrl(id)   { return gifUrls[id] ?? '' }
export function getFruitPhotoUrl(id) { return pngUrls[id] ?? '' }

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export function buildFruitGrid(pairs) {
  const selected = shuffle(FRUITS).slice(0, pairs)
  const flat = selected.flatMap(f => [
    { value: f.id, type: 'gif',   fruit: f },
    { value: f.id, type: 'photo', fruit: f },
  ])
  return shuffle(flat).map((cell, id) => ({ ...cell, id, matched: false }))
}
