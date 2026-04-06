const IS_DEV = import.meta.env.DEV

const BADGE = 'background:#333;color:#fff;padding:2px 6px;border-radius:4px;font-weight:700'
const COLORS = {
  start:    'background:#1565c0;color:#fff;padding:2px 6px;border-radius:4px',
  question: 'background:#4a148c;color:#fff;padding:2px 6px;border-radius:4px',
  correct:  'background:#1b5e20;color:#fff;padding:2px 6px;border-radius:4px',
  wrong:    'background:#b71c1c;color:#fff;padding:2px 6px;border-radius:4px',
  timeout:  'background:#e65100;color:#fff;padding:2px 6px;border-radius:4px',
  end:      'background:#37474f;color:#fff;padding:2px 6px;border-radius:4px',
}

export function useGameLogger(gameName) {
  return function log(event, data = {}) {
    if (!IS_DEV) return
    const badge      = COLORS[event] ?? BADGE
    const hasData    = Object.keys(data).length > 0
    console.groupCollapsed(`%c${gameName}%c ${event}`, BADGE, badge)
    if (hasData) console.table(data)
    console.groupEnd()
  }
}
