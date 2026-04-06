import { useNavigate } from 'react-router-dom'
import { useHighScores } from '../../hooks/useHighScores'
import { useLocale } from '../../store/LocaleContext'
import { useGeometryGame } from './useGeometryGame'
import { LEVELS } from './geometryEngine'
import GameOver from '../../components/GameOver'
import GameHeader from '../../components/GameHeader'
import './GeometryChallenge.css'

// ── Inline SVG shape renderer ──────────────────────────────────────
function ShapeDisplay({ shape, dims }) {
  const W = 220, H = 140
  const stroke = '#aaa'
  const fill   = 'rgba(100,160,255,0.15)'
  const lbl    = { fill: '#ccc', fontSize: 13 }

  if (shape === 'rectangle' || shape === 'square') {
    const { w, h, s } = dims
    const rw = s ? 120 : Math.min(180, (w / (w + h)) * 200 + 40)
    const rh = s ? 120 : Math.min(100, (h / (w + h)) * 200 + 20)
    const x  = (W - rw) / 2, y = (H - rh) / 2
    return (
      <svg viewBox={`0 0 ${W} ${H}`}>
        <rect x={x} y={y} width={rw} height={rh} stroke={stroke} strokeWidth="2" fill={fill} />
        <text x={W/2} y={y + rh + 18} textAnchor="middle" {...lbl}>{s ?? w}</text>
        <text x={x - 10} y={H/2} textAnchor="end" dominantBaseline="middle" {...lbl}>{s ?? h}</text>
      </svg>
    )
  }

  if (shape === 'triangle' || shape === 'triangle-pyth') {
    const { b, h, a } = dims
    const base = b ?? a
    const ht   = h ?? dims.b
    const bx   = (W - 160) / 2
    return (
      <svg viewBox={`0 0 ${W} ${H}`}>
        <polygon points={`${bx},${H-20} ${bx+160},${H-20} ${W/2},${H-20-90}`} stroke={stroke} strokeWidth="2" fill={fill} />
        <text x={W/2} y={H-6} textAnchor="middle" {...lbl}>{base}</text>
        <text x={W/2+90} y={H/2} textAnchor="start" {...lbl}>h={ht}</text>
      </svg>
    )
  }

  if (shape === 'parallelogram') {
    const { b, h } = dims
    const offset = 30
    const y0 = 20, y1 = H - 20
    const pts = `${offset+20},${y1} ${W-20},${y1} ${W-20-offset},${y0} ${20},${y0}`
    return (
      <svg viewBox={`0 0 ${W} ${H}`}>
        <polygon points={pts} stroke={stroke} strokeWidth="2" fill={fill} />
        <text x={W/2} y={y1+16} textAnchor="middle" {...lbl}>{b}</text>
        <text x={W-10} y={H/2} textAnchor="start" dominantBaseline="middle" {...lbl}>h={h}</text>
      </svg>
    )
  }

  if (shape === 'trapezoid') {
    const { a, b, h } = dims
    const scale = 160 / Math.max(a, b)
    const wa = a * scale, wb = b * scale
    const y0 = 15, y1 = H - 15
    const x0a = (W - wa) / 2, x0b = (W - wb) / 2
    const pts = `${x0a},${y0} ${x0a+wa},${y0} ${x0b+wb},${y1} ${x0b},${y1}`
    return (
      <svg viewBox={`0 0 ${W} ${H}`}>
        <polygon points={pts} stroke={stroke} strokeWidth="2" fill={fill} />
        <text x={W/2} y={y0-4} textAnchor="middle" {...lbl}>{a}</text>
        <text x={W/2} y={y1+14} textAnchor="middle" {...lbl}>{b}</text>
        <text x={W-5} y={H/2} textAnchor="end" dominantBaseline="middle" {...lbl}>h={h}</text>
      </svg>
    )
  }

  if (shape === 'cube') {
    const { s } = dims
    const sz = 80, ox = 30, oy = 20
    const x0 = (W-sz)/2, y0 = (H-sz)/2
    return (
      <svg viewBox={`0 0 ${W} ${H}`}>
        <rect x={x0} y={y0} width={sz} height={sz} stroke={stroke} strokeWidth="2" fill={fill} />
        <polygon points={`${x0},${y0} ${x0+ox},${y0-oy} ${x0+ox+sz},${y0-oy} ${x0+sz},${y0}`} stroke={stroke} strokeWidth="2" fill={fill} />
        <polygon points={`${x0+sz},${y0} ${x0+sz+ox},${y0-oy} ${x0+sz+ox},${y0-oy+sz} ${x0+sz},${y0+sz}`} stroke={stroke} strokeWidth="2" fill={fill} />
        <text x={W/2} y={H-2} textAnchor="middle" {...lbl}>s={s}</text>
      </svg>
    )
  }

  if (shape === 'prism') {
    const { l, w, h } = dims
    const sz = 70, ox = 25, oy = 15
    const x0 = (W-sz)/2-10, y0 = (H-sz)/2
    return (
      <svg viewBox={`0 0 ${W} ${H}`}>
        <rect x={x0} y={y0} width={sz} height={sz} stroke={stroke} strokeWidth="2" fill={fill} />
        <polygon points={`${x0},${y0} ${x0+ox},${y0-oy} ${x0+ox+sz},${y0-oy} ${x0+sz},${y0}`} stroke={stroke} strokeWidth="2" fill={fill} />
        <polygon points={`${x0+sz},${y0} ${x0+sz+ox},${y0-oy} ${x0+sz+ox},${y0-oy+sz} ${x0+sz},${y0+sz}`} stroke={stroke} strokeWidth="2" fill={fill} />
        <text x={x0+sz/2} y={H+2} textAnchor="middle" {...lbl}>l={l}</text>
        <text x={x0+sz+ox+4} y={y0-oy+sz/2} dominantBaseline="middle" {...lbl}>w={w}</text>
        <text x={x0-4} y={y0+sz/2} textAnchor="end" dominantBaseline="middle" {...lbl}>h={h}</text>
      </svg>
    )
  }

  if (shape === 'cylinder') {
    const { r, h } = dims
    const cx = W/2, cy = H/2, rx = 50, ry = 14, ch = 80
    return (
      <svg viewBox={`0 0 ${W} ${H}`}>
        <ellipse cx={cx} cy={cy-ch/2} rx={rx} ry={ry} stroke={stroke} strokeWidth="2" fill={fill} />
        <rect x={cx-rx} y={cy-ch/2} width={rx*2} height={ch} stroke="none" fill={fill} />
        <line x1={cx-rx} y1={cy-ch/2} x2={cx-rx} y2={cy+ch/2} stroke={stroke} strokeWidth="2" />
        <line x1={cx+rx} y1={cy-ch/2} x2={cx+rx} y2={cy+ch/2} stroke={stroke} strokeWidth="2" />
        <ellipse cx={cx} cy={cy+ch/2} rx={rx} ry={ry} stroke={stroke} strokeWidth="2" fill={fill} />
        <text x={cx+rx+4} y={cy} dominantBaseline="middle" {...lbl}>h={h}</text>
        <text x={cx} y={cy-ch/2-ry-4} textAnchor="middle" {...lbl}>r={r}</text>
      </svg>
    )
  }

  return null
}

export default function GeometryChallenge() {
  const navigate              = useNavigate()
  const { scores, saveScore } = useHighScores()
  const { t }                 = useLocale()

  const game = useGeometryGame({
    saveScore:        (s) => saveScore('geometry', s),
    getExistingScore: ()  => scores['geometry'],
  })

  const {
    level, gameState, lives, maxLives, score, question,
    feedback, isNewBest, crackingIdx,
    handleSelect, startGame, playAgain, selectLevel,
  } = game

  // ── Level select ──────────────────────────────────────────────────
  if (gameState === 'idle') {
    const geoScores = typeof scores['geometry'] === 'object' ? scores['geometry'] : {}
    return (
      <div className="geo-page">
        <button className="geo-back-btn" onClick={() => navigate('/')}>{t('back')}</button>
        <div className="geo-header">
          <span className="geo-big-icon">📐</span>
          <h1>{t('geo_title')}</h1>
          <p>{t('geo_subtitle')}</p>
        </div>
        <div className="geo-level-grid">
          {Object.entries(LEVELS).map(([key, cfg]) => (
            <button
              key={key}
              className={`geo-level-card geo-level-${key}`}
              onClick={() => startGame(key)}
            >
              <span className="geo-level-name">{t(cfg.labelKey)}</span>
              <span className="geo-level-desc">{t(cfg.descKey)}</span>
              {geoScores[key] !== undefined && (
                <span className="geo-level-best">🏆 {geoScores[key]}</span>
              )}
            </button>
          ))}
        </div>
      </div>
    )
  }

  // ── Game over ─────────────────────────────────────────────────────
  if (gameState === 'gameover') {
    return (
      <GameOver
        title={t('geo_gameover')}
        result={score}
        resultLabel={t('geo_score')}
        isNewBest={isNewBest}
        newBestLabel={t('geo_new_best')}
        actions={[
          { label: t('geo_play_again'),   onClick: playAgain,              primary: true },
          { label: t('geo_change_level'), onClick: () => selectLevel(null) },
          { label: t('mult_home'),        onClick: () => navigate('/') },
        ]}
      />
    )
  }

  // ── Game screen ───────────────────────────────────────────────────
  return (
    <div className="geo-page geo-game">
      <GameHeader
        onQuit={() => selectLevel(null)}
        quitLabel={t('geo_levels')}
        lives={lives}
        maxLives={maxLives}
        crackingIdx={crackingIdx}
        score={score}
        difficulty={level ? t(LEVELS[level].labelKey) : ''}
      />

      <div className="geo-arena">
        {question && (
          <>
            <div className="geo-question-label">{question.label}</div>
            <div className="geo-formula">{question.formula}</div>
            <div className="geo-shape-wrap">
              <ShapeDisplay shape={question.shape} dims={question.dims} />
            </div>
            <div className="geo-choices">
              {question.choices.map((c, i) => {
                const isCorrect = feedback && c === question.answer
                const isWrong   = feedback?.type === 'wrong' && c === feedback.selected
                return (
                  <button
                    key={i}
                    className={[
                      'geo-choice-btn',
                      isCorrect ? 'geo-choice-correct' : '',
                      isWrong   ? 'geo-choice-wrong'   : '',
                    ].filter(Boolean).join(' ')}
                    onClick={() => handleSelect(c)}
                    disabled={!!feedback}
                  >
                    {c}
                  </button>
                )
              })}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
