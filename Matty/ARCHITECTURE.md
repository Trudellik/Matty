# Matty — Architecture Reference

> Complete project reference for AI context. Covers tech stack, routing, i18n, state, challenges, components, scoring, and conventions.

---

## Tech Stack

| Layer | Tool | Version |
|---|---|---|
| UI | React | 19.2.4 |
| Routing | React Router DOM | 7.13.1 |
| Build | Vite | 8.0.1 |
| Vite plugin | @vitejs/plugin-react | 6.0.1 |
| Module format | ES modules (`"type": "module"`) | — |
| Linting | ESLint 9 + react-hooks/refresh plugins | — |

No external state library, no CSS framework, no i18n library.

---

## Project Structure

```
src/
├── main.jsx                     # Entry point — BrowserRouter + App
├── App.jsx                      # Route definitions, locale redirect
├── styles/
│   ├── index.css                # Global CSS variables, typography, dark mode
│   └── App.css                  # Minimal app-level styles
├── components/                  # Shared UI components
│   ├── GameHeader.jsx/css       # In-game header (lives, score, timer bar)
│   ├── GameIdle.jsx             # Start/level-select screen
│   ├── GameOver.jsx             # End screen (win or loss)
│   └── GameScreens.css          # Shared styles for GameIdle & GameOver
├── pages/
│   ├── Home.jsx/css             # Challenge grid (home page)
│   ├── ChallengePage.jsx/css    # Fallback "coming soon" page
├── features/                    # One folder per challenge
│   ├── addition/
│   │   ├── AdditionChallenge.jsx/css
│   │   ├── useAdditionGame.js   # Game state hook
│   │   └── additionEngine.js    # Pure game logic
│   ├── operator/                # (same structure as addition)
│   ├── multiplication/
│   ├── calculation/
│   ├── fraction/                # Note: folder is singular, route ID is 'fractions'
│   ├── maze/
│   ├── algebra/
│   ├── geometry/
│   └── sequence/
├── store/
│   └── LocaleContext.jsx        # Locale provider + useLocale() hook
├── hooks/
│   ├── useHighScores.js         # Score persistence (localStorage)
│   └── useGameLogger.js         # Dev-mode console logger
├── utils/
│   ├── i18n.js                  # Translation dictionary + t() function
│   └── utils.js                 # formatTime() helper
├── config/
│   └── challenges.js            # Challenge metadata array
├── layouts/                     # Empty, unused
└── services/                    # Empty, unused
```

---

## Entry Point Flow

```
index.html
  └── main.jsx          — StrictMode + BrowserRouter + global CSS
        └── App.jsx     — Routes with locale redirect
              └── LocaleProvider (layout route for /:locale)
                    └── <Outlet /> → Home | ChallengeComponent | ChallengePage
```

**main.jsx:**
```jsx
<StrictMode>
  <BrowserRouter>
    <App />
  </BrowserRouter>
</StrictMode>
```

**App.jsx:**
```jsx
<Routes>
  <Route path="/" element={<Navigate to="/da" replace />} />
  <Route path="/:locale" element={<LocaleProvider />}>
    <Route index element={<Home />} />
    <Route path="challenge/addition"       element={<AdditionChallenge />} />
    <Route path="challenge/operator"       element={<OperatorChallenge />} />
    <Route path="challenge/multiplication" element={<MultiplicationChallenge />} />
    <Route path="challenge/calculation"    element={<CalculationChallenge />} />
    <Route path="challenge/fractions"      element={<FractionChallenge />} />
    <Route path="challenge/maze"           element={<MazeChallenge />} />
    <Route path="challenge/algebra"        element={<AlgebraChallenge />} />
    <Route path="challenge/geometry"       element={<GeometryChallenge />} />
    <Route path="challenge/sequence"       element={<SequenceChallenge />} />
    <Route path="challenge/:id"            element={<ChallengePage />} />
  </Route>
</Routes>
```

---

## Routing & URL Patterns

Default locale is **Danish (`da`)**. Visiting `/` redirects to `/da`.

| URL | Result |
|---|---|
| `/` | Redirect → `/da` |
| `/da` | Home in Danish |
| `/en` | Home in English |
| `/da/challenge/addition` | Addition challenge in Danish |
| `/en/challenge/multiplication` | Multiplication in English |
| `/da/challenge/unknown-id` | ChallengePage fallback |

Locale is extracted from the `:locale` URL param. `LocaleProvider` validates it against `LOCALES`. Invalid locales fall back to `'da'`.

---

## i18n System

### Files
- `src/utils/i18n.js` — Translation dictionary and `t()` function
- `src/store/LocaleContext.jsx` — React context wrapper

### Supported Locales
```javascript
export const LOCALES = ['en', 'da']
export const LOCALE_LABELS = { en: 'EN', da: 'DA' }
```

### Translation Function
```javascript
t(locale, key, vars)
// vars = { n: 5 } replaces {n} in the string
// Fallback: locale → 'en' → key itself
```

### LocaleContext
`LocaleProvider` reads the `locale` param from the URL (via `useParams`), validates it, and provides:

| Value | Type | Description |
|---|---|---|
| `locale` | `string` | Current locale code (`'da'` or `'en'`) |
| `t(key, vars?)` | `fn` | Translate key with optional variable substitution |
| `homePath()` | `fn` | Returns `/${locale}` |
| `challengePath(id)` | `fn` | Returns `/${locale}/challenge/${id}` |

**Usage in any component:**
```javascript
const { t, homePath, challengePath } = useLocale()
```

### Translation Key Conventions
| Pattern | Example |
|---|---|
| Home | `home_subtitle`, `best_time`, `best_score`, `coming_soon` |
| Navigation | `back`, `back_to_home` |
| Challenge card | `challenge_addition_label`, `challenge_addition_desc` |
| Challenge UI | `add_title`, `op_gameover`, `mult_level_easy`, etc. |
| Variable | `"new operator every {n} correct answers"` |

---

## State Management

No Redux or Zustand. State lives in React hooks and a single context.

### LocaleContext
Global context providing locale and navigation helpers. See i18n section above.

### useHighScores()
```javascript
const { scores, saveScore, saveBestTime } = useHighScores()
```
See Scores & Persistence section below.

### useGameLogger()
Dev-only grouped console logging. Inactive in production.
```javascript
const log = useGameLogger('gameName')
log('correct', { question, answer, streak })
// Events: 'start' | 'question' | 'correct' | 'wrong' | 'timeout' | 'end'
```

### Per-Challenge Game Hooks
Each challenge has a `use{Name}Game.js` hook that manages all game state:
```javascript
const game = useAdditionGame({
  saveBestTime: (level, time) => saveBestTime('addition', level, time),
  getExistingScore: (level) => scores['addition']?.[level],
})
```
Game hooks are decoupled from challenge IDs — they receive score I/O as parameters.

---

## Challenges

### Overview

| ID | Folder | Icon | Score Type | Status |
|---|---|---|---|---|
| `addition` | `addition/` | ➕ | time | ready |
| `operator` | `operator/` | ❓ | score | ready |
| `multiplication` | `multiplication/` | ✖️ | time | ready |
| `calculation` | `calculation/` | ⚡ | score | ready |
| `fractions` | `fraction/` | ½ | score | ready |
| `maze` | `maze/` | 🧩 | score | ready |
| `algebra` | `algebra/` | 𝑥 | score | ready |
| `geometry` | `geometry/` | 📐 | score | ready |
| `sequence` | `sequence/` | 🔢 | score | ready |

> Note: the fractions feature folder is `fraction/` (singular) but the route and challenge ID is `fractions`.

### Challenge File Pattern

Every challenge follows this structure:

```
features/{name}/
├── {Name}Challenge.jsx   # Component: renders UI, wires hook to components
├── {Name}Challenge.css   # Styles scoped to this challenge
├── use{Name}Game.js      # Hook: full game state machine
└── {name}Engine.js       # Pure functions: game logic, board generation, LEVELS config
```

### Engine Pattern
Engines are pure — no React, no side effects, fully testable:
```javascript
// Example: additionEngine.js
export const LEVELS = {
  easy:   { cols: 4, rows: 4, target: 10, labelKey: '...', descKey: '...' },
  medium: { cols: 6, rows: 4, target: 15, labelKey: '...', descKey: '...' },
  hard:   { cols: 6, rows: 6, target: 20, labelKey: '...', descKey: '...' },
}
export function buildGrid(cols, rows, target) { ... }
```

### Config Object Shape
From `src/config/challenges.js`:
```javascript
{
  id: 'addition',             // string — matches route segment and localStorage key prefix
  label: 'Addition',          // display name (may be unused in favour of t())
  icon: '➕',                 // emoji
  description: '...',         // short description (may be unused)
  scoreType: 'time' | 'score', // determines best value comparison direction
  ready: true                 // set from VITE_READY_CHALLENGES env var
}
```

The `ready` flag is driven by the env var:
```javascript
const readyIds = new Set(
  (import.meta.env.VITE_READY_CHALLENGES ?? '').split(',').map(s => s.trim())
)
```

---

## Shared Components

### GameHeader
In-game top bar. Used by all active challenge screens.

```javascript
<GameHeader
  onQuit={fn}            // required
  quitLabel="✕"          // optional
  lives={3}              // optional — renders heart icons
  maxLives={3}
  crackingIdx={1}        // animates a specific heart cracking
  streak={5}             // optional — shown center
  score={42}             // optional — shown right
  difficulty="Easy"      // optional badge — shown right
  timerKey={roundKey}    // resets the drain bar animation
  timerDuration={10}     // seconds for full drain
  timerDanger={false}    // turns timer bar red
/>
```

### GameIdle
Start/level-selection screen. Used before game begins.

```javascript
<GameIdle
  icon="➕"
  title="Addition"
  subtitle="Pair up numbers that sum to the target"
  rules={['Click two cells', 'They must sum to target']}   // optional
  best={45}               // optional — existing best score
  bestLabel="Best time"   // optional
  onStart={fn}
  startLabel="Start"      // optional
  onBack={fn}             // optional
  backLabel="← Back"      // optional
/>
```
Keyboard: `Enter` triggers `onStart`.

### GameOver
End screen — win or loss. Can render as full page or overlay.

```javascript
<GameOver
  icon="💀"               // optional, default '💀'
  title="Game Over"
  result={42}
  resultLabel="Score"
  isNewBest={true}
  newBestLabel="New best!"
  actions={[
    { label: 'Play again', onClick: fn, primary: true },
    { label: 'Home', onClick: fn },
  ]}
  overlay={false}          // true = fixed overlay, false = full page
/>
```
Keyboard (full-page): `Enter` = primary action, `Escape` = last action.

---

## Scores & Persistence

### Hook
```javascript
const { scores, saveScore, saveBestTime } = useHighScores()
```

### Storage
- localStorage key: `'matty_highscores'`
- JSON stringified, written immediately on save

### Data Shape
```javascript
{
  // Point-based challenges (higher = better)
  "operator": 450,
  "calculation": 150,
  "fractions": 88,

  // Time-based challenges (lower = better, grouped by level)
  "addition": { easy: 45, medium: 120, hard: 220 },
  "multiplication": { easy: 60, medium: 130 }
}
```

### Methods
```javascript
saveScore('operator', 520)
// Only saves if 520 > existing score

saveBestTime('addition', 'easy', 38)
// Only saves if 38 < existing time for that level
```

### Display
- Badges shown on challenge cards on Home
- Time formatted by `formatTime(seconds)` from `src/utils/utils.js`
- `scoreType: 'time'` → uses `saveBestTime`, reads `scores[id][level]`
- `scoreType: 'score'` → uses `saveScore`, reads `scores[id]`

---

## CSS & Styling

### Approach
Plain CSS files colocated with components. No CSS modules, no preprocessor.

### Global Variables (`styles/index.css`)
```css
:root {
  --text: #6b6375;
  --text-h: #08060d;
  --bg: #fff;
  --border: #e5e4e7;
  --code-bg: #f4f3ec;
  --accent: #aa3bff;
  --accent-bg: rgba(170, 59, 255, 0.1);
  --accent-border: rgba(170, 59, 255, 0.5);
  --social-bg: rgba(244, 243, 236, 0.5);
  --shadow: /* multi-layer box shadow */;
  --sans: system-ui, 'Segoe UI', Roboto, sans-serif;
  --mono: ui-monospace, Consolas, monospace;
}

@media (prefers-color-scheme: dark) {
  /* Same variables, dark values. Accent: #c084fc */
}
```

### Layout
- `#root`: max-width 1126px, centered, flex column
- Min height: `100svh`
- Responsive breakpoints: 1024px, 600px

### Common Patterns
| Element | Pattern |
|---|---|
| Cards | `border: 2px solid var(--border)`, border-radius, hover lift |
| Badges | `padding: 3px 10px`, `border-radius: 20px`, `background: var(--accent-bg)` |
| Back buttons | No background, color `var(--text-h)` |
| Animations | CSS `@keyframes` (crack, drain, shake, etc.) |

---

## Environment Variables

**`.env`:**
```
VITE_READY_CHALLENGES=addition,operator,multiplication,calculation,fractions,maze,algebra,geometry,sequence
```

Controls which challenges show as active vs "coming soon" on the home grid.

---

## Key Conventions

### 1. Score I/O Decoupling
Game hooks receive score callbacks as parameters — they never reference challenge IDs or localStorage keys directly. The component decides the wiring.

### 2. Pure Engines
All game logic (`*Engine.js`) is pure JavaScript. No React imports, no side effects. The hook orchestrates the engine's output into state.

### 3. Locale via URL
Locale is never stored in localStorage or component state. It lives entirely in the URL (`/:locale`). Use `homePath()` and `challengePath(id)` from `useLocale()` to build links — never hardcode `/`.

### 4. Adding a New Challenge
1. Create `src/features/{name}/` with `{Name}Challenge.jsx`, `use{Name}Game.js`, `{name}Engine.js`, `{Name}Challenge.css`
2. Add route in `App.jsx` under `/:locale`
3. Add entry in `src/config/challenges.js`
4. Add translation keys to both `en` and `da` in `src/utils/i18n.js`
5. Add the ID to `VITE_READY_CHALLENGES` in `.env`
