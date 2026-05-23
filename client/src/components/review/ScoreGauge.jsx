import { useEffect, useRef } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';

// ── Score → stroke color ──────────────────────────────────────────────────────
function scoreColor(score) {
  if (score >= 80) return '#22C55E'; // green
  if (score >= 60) return '#F59E0B'; // amber
  if (score >= 40) return '#F97316'; // orange
  return '#EF4444';                  // red
}

// ── Size config ───────────────────────────────────────────────────────────────
const SIZE_CONFIG = {
  sm: { size: 80,  cx: 40, cy: 40, r: 32, strokeWidth: 5,  scoreFontSize: 20, gradeFontSize: 10 },
  lg: { size: 140, cx: 70, cy: 70, r: 56, strokeWidth: 7,  scoreFontSize: 36, gradeFontSize: 14 },
};

/**
 * SVG circular gauge that animates the stroke arc on mount.
 *
 * @param {{
 *   score: number,
 *   grade?: string,
 *   size?: 'sm'|'lg',
 *   className?: string,
 * }} props
 */
export default function ScoreGauge({ score = 0, grade, size = 'lg', className = '' }) {
  const cfg = SIZE_CONFIG[size] ?? SIZE_CONFIG.lg;
  const circumference = 2 * Math.PI * cfg.r;
  // We use 75% of the full circle for the arc (270°) for a classic gauge look
  const arcLength = circumference * 0.75;
  const color = scoreColor(score);

  // Animated score display (counts up)
  const displayScore = useMotionValue(0);
  const rounded = useTransform(displayScore, (v) => Math.round(v));
  const displayRef = useRef(null);

  useEffect(() => {
    const controls = animate(displayScore, score, {
      duration: 1.2,
      ease: 'easeOut',
    });
    return controls.stop;
  }, [score, displayScore]);

  // strokeDashoffset: 0 = full arc, arcLength = empty
  const filledOffset = arcLength - (score / 100) * arcLength;

  return (
    <div className={`inline-flex flex-col items-center gap-2 ${className}`}>
      <svg
        width={cfg.size}
        height={cfg.size}
        viewBox={`0 0 ${cfg.size} ${cfg.size}`}
        aria-label={`Score: ${score} out of 100${grade ? `, Grade: ${grade}` : ''}`}
        role="img"
      >
        {/* ── Track (background arc) ────────────────────────────────── */}
        <circle
          cx={cfg.cx}
          cy={cfg.cy}
          r={cfg.r}
          fill="none"
          stroke="#1A1A1A"
          strokeWidth={cfg.strokeWidth}
          strokeLinecap="round"
          strokeDasharray={`${arcLength} ${circumference}`}
          strokeDashoffset={0}
          transform={`rotate(135 ${cfg.cx} ${cfg.cy})`}
        />

        {/* ── Progress arc (animated) ───────────────────────────────── */}
        <motion.circle
          cx={cfg.cx}
          cy={cfg.cy}
          r={cfg.r}
          fill="none"
          stroke={color}
          strokeWidth={cfg.strokeWidth}
          strokeLinecap="round"
          strokeDasharray={`${arcLength} ${circumference}`}
          strokeDashoffset={arcLength} // start empty
          transform={`rotate(135 ${cfg.cx} ${cfg.cy})`}
          initial={{ strokeDashoffset: arcLength }}
          animate={{ strokeDashoffset: filledOffset }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
          style={{ filter: `drop-shadow(0 0 6px ${color}55)` }}
        />

        {/* ── Score number ──────────────────────────────────────────── */}
        <foreignObject
          x={0}
          y={cfg.cy - cfg.scoreFontSize * 0.7}
          width={cfg.size}
          height={cfg.scoreFontSize * 1.4}
        >
          <div
            className="flex items-center justify-center w-full h-full"
            style={{ fontFamily: 'JetBrains Mono, monospace' }}
          >
            <motion.span
              style={{
                fontSize: cfg.scoreFontSize,
                fontWeight: 600,
                color: '#FFFFFF',
                lineHeight: 1,
              }}
            >
              {rounded}
            </motion.span>
          </div>
        </foreignObject>

        {/* ── Grade label ───────────────────────────────────────────── */}
        {grade && (
          <text
            x={cfg.cx}
            y={cfg.cy + cfg.scoreFontSize * 0.85}
            textAnchor="middle"
            fill="#888888"
            fontSize={cfg.gradeFontSize}
            fontFamily="Inter, sans-serif"
            fontWeight={500}
          >
            {grade}
          </text>
        )}
      </svg>
    </div>
  );
}