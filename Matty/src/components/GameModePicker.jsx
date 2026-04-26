import { useLocale } from '../store/LocaleContext'
import './GameModePicker.css'

/**
 * Mode toggle shown in the GameOptionsPage `extra` slot for all lives-based challenges.
 *
 * Props:
 *   value    'lives' | 'endurance'
 *   onChange (mode) => void
 */
export default function GameModePicker({ value, onChange }) {
  const { t } = useLocale()
  return (
    <div className="gmp-root">
      <span className="gmp-label">{t('game_mode_label')}</span>
      <div className="gmp-row">
        {['lives', 'endurance'].map((mode) => (
          <button
            key={mode}
            className={`gmp-btn${value === mode ? ' gmp-btn--active' : ''}`}
            onClick={() => onChange(mode)}
          >
            <span className="gmp-btn-title">
              {mode === 'lives' ? '❤️ ' : '⏱ '}
              {t(`game_mode_${mode}`)}
            </span>
            <span className="gmp-btn-desc">{t(`game_mode_${mode}_desc`)}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
