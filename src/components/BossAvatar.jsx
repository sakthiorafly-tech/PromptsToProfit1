// Original, hand-drawn SVG boss characters for the 5 Hard missions.
// Animations (idle float, blink, hit flash, defeat) live in index.css.
const eye = (cx, cy, r = 5) => (
  <g className="boss-eye" style={{ transformOrigin: `${cx}px ${cy}px` }}>
    <ellipse cx={cx} cy={cy} rx={r} ry={r * 1.15} fill="#0B1020" />
    <circle cx={cx + r * 0.35} cy={cy - r * 0.4} r={r * 0.35} fill="#fff" />
  </g>
);

const BODIES = {
  // Ghost with a stolen coin
  'java-bank': (c) => (
    <>
      <path d="M22 54 C22 30 36 18 50 18 C64 18 78 30 78 54 L78 82 L71 76 L64 82 L57 76 L50 82 L43 76 L36 82 L29 76 L22 82 Z" fill={c} />
      <path d="M30 40 C32 30 40 25 47 24" stroke="#fff" strokeOpacity=".35" strokeWidth="4" strokeLinecap="round" fill="none" />
      {eye(40, 48)}{eye(60, 48)}
      <path d="M42 62 Q50 58 58 62" stroke="#0B1020" strokeWidth="3" strokeLinecap="round" fill="none" />
      <g className="boss-prop">
        <circle cx="80" cy="66" r="11" fill="#FBBF24" stroke="#B7791F" strokeWidth="2.5" />
        <text x="80" y="71" textAnchor="middle" fontSize="13" fontWeight="800" fill="#7A4E0F" fontFamily="system-ui, sans-serif">₹</text>
      </g>
    </>
  ),
  // Angry clock monster with a database hat
  'sql-optimize': (c) => (
    <>
      <ellipse cx="50" cy="20" rx="17" ry="5" fill="#E6FFFA" opacity=".9" />
      <path d="M33 20 V29 C33 32 41 34 50 34 C59 34 67 32 67 29 V20" fill={c} opacity=".85" />
      <ellipse cx="50" cy="20" rx="17" ry="5" fill={c} stroke="#0B1020" strokeOpacity=".25" />
      <circle cx="50" cy="60" r="28" fill={c} />
      <circle cx="50" cy="60" r="21" fill="#0B1020" opacity=".25" />
      <g className="boss-clock-hand" style={{ transformOrigin: '50px 60px' }}><line x1="50" y1="60" x2="50" y2="44" stroke="#fff" strokeWidth="3" strokeLinecap="round" /></g>
      <line x1="50" y1="60" x2="61" y2="64" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
      <path d="M36 50 L45 54 M64 50 L55 54" stroke="#0B1020" strokeWidth="3.5" strokeLinecap="round" />
      {eye(41, 58, 4)}{eye(59, 58, 4)}
      <path d="M36 88 V94 M64 88 V94" stroke={c} strokeWidth="6" strokeLinecap="round" />
    </>
  ),
  // Three-headed hydra with brace mouths
  'py-api': (c) => (
    <>
      <path d="M30 90 C30 70 40 64 50 64 C60 64 70 70 70 90 Z" fill={c} />
      <path d="M42 66 C36 54 24 50 22 38" stroke={c} strokeWidth="9" strokeLinecap="round" fill="none" />
      <path d="M50 64 V34" stroke={c} strokeWidth="9" strokeLinecap="round" />
      <path d="M58 66 C64 54 76 50 78 38" stroke={c} strokeWidth="9" strokeLinecap="round" fill="none" />
      {[[22, 32], [50, 26], [78, 32]].map(([x, y], i) => (
        <g key={i} className="boss-head" style={{ transformOrigin: `${x}px ${y + 10}px`, animationDelay: `${i * 0.35}s` }}>
          <circle cx={x} cy={y} r="11" fill={c} />
          {eye(x - 4, y - 2, 2.6)}{eye(x + 4, y - 2, 2.6)}
          <text x={x} y={y + 9} textAnchor="middle" fontSize="8" fontWeight="800" fill="#0B1020" fontFamily="ui-monospace, monospace">{'{}'}</text>
        </g>
      ))}
    </>
  ),
  // Monitor robot with a ticker and leaks
  'react-effect': (c) => (
    <>
      <rect x="20" y="22" width="60" height="46" rx="9" fill={c} />
      <rect x="27" y="29" width="46" height="26" rx="4" fill="#0B1020" />
      <polyline className="boss-ticker" points="29,48 36,42 42,46 49,35 55,41 62,33 71,39" stroke="#4ADE80" strokeWidth="2.5" fill="none" strokeLinejoin="round" strokeLinecap="round" />
      {eye(41, 62, 3)}{eye(59, 62, 3)}
      <rect x="44" y="68" width="12" height="8" fill={c} opacity=".8" />
      <rect x="32" y="76" width="36" height="6" rx="3" fill={c} />
      <line x1="50" y1="22" x2="50" y2="12" stroke={c} strokeWidth="3" />
      <circle className="boss-antenna" cx="50" cy="10" r="4" fill="#F87171" />
      {[30, 50, 70].map((x, i) => <path key={x} className="boss-drip" style={{ animationDelay: `${i * 0.5}s` }} d={`M${x} 84 C${x - 3} 89 ${x - 3} 92 ${x} 92 C${x + 3} 92 ${x + 3} 89 ${x} 84 Z`} fill="#38BDF8" />)}
    </>
  ),
  // Cracked brick golem
  'ps-binsearch': (c) => (
    <>
      <rect x="24" y="24" width="52" height="56" rx="8" fill={c} />
      <path d="M24 42 H76 M24 60 H76 M42 24 V42 M60 42 V60 M38 60 V80 M58 60 V80" stroke="#0B1020" strokeOpacity=".22" strokeWidth="2" />
      <path d="M57 24 L50 38 L57 46 L47 58 L52 66" stroke="#0B1020" strokeWidth="2.5" fill="none" strokeLinejoin="round" />
      <g className="boss-warning-eyes">
        <circle cx="38" cy="47" r="5" fill="#FBBF24" /><circle cx="64" cy="47" r="5" fill="#FBBF24" />
        <circle cx="38" cy="47" r="2" fill="#0B1020" /><circle cx="64" cy="47" r="2" fill="#0B1020" />
      </g>
      <path d="M40 70 L46 66 L52 70 L58 66" stroke="#0B1020" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <rect x="12" y="44" width="12" height="20" rx="5" fill={c} />
      <rect x="76" y="44" width="12" height="20" rx="5" fill={c} />
    </>
  ),
};

export default function BossAvatar({ id, color, state = 'idle', size = 88 }) {
  const body = BODIES[id];
  if (!body) return null;
  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      className={`boss-avatar boss-${state}`}
      role="img"
      aria-label={state === 'defeated' ? 'Defeated boss' : 'Boss'}
      style={{ overflow: 'visible' }}
    >
      <ellipse className="boss-shadow" cx="50" cy="97" rx="24" ry="3.5" fill="#000" opacity=".35" />
      <g className="boss-body">{body(color)}</g>
    </svg>
  );
}
