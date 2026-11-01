// The player's hero for boss duels: an original armoured "code knight" with a
// glowing visor, cape and energy blade. The chest emblem shows the initials.
export default function HeroAvatar({ initials = 'RP', size = 96 }) {
  return (
    <svg viewBox="0 0 120 150" width={size} height={size * 1.25} className="hero-avatar" role="img" aria-label="Your hero" style={{ overflow: 'visible' }}>
      <defs>
        <linearGradient id="hero-blade" x1="0" y1="1" x2="1" y2="0">
          <stop offset="0" stopColor="#E9E5FF" />
          <stop offset="1" stopColor="#67E8F9" />
        </linearGradient>
        <linearGradient id="hero-armor" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#9A8CFF" />
          <stop offset="1" stopColor="#5B4BE0" />
        </linearGradient>
      </defs>
      <ellipse className="hero-shadow" cx="56" cy="146" rx="30" ry="4" fill="#000" opacity=".4" />
      <g className="hero-body">
        {/* cape */}
        <path className="hero-cape" d="M36 62 C26 90 22 118 28 140 L52 132 L60 140 L76 130 L80 62 Z" fill="#2E2470" />
        {/* legs */}
        <rect x="40" y="112" width="13" height="28" rx="5" fill="#1E2440" />
        <rect x="59" y="112" width="13" height="28" rx="5" fill="#1E2440" />
        <rect x="38" y="134" width="17" height="8" rx="3" fill="#7C6CFF" />
        <rect x="57" y="134" width="17" height="8" rx="3" fill="#7C6CFF" />
        {/* torso armour */}
        <path d="M34 66 C34 58 44 54 56 54 C68 54 78 58 78 66 L76 114 L36 114 Z" fill="#2A3358" />
        <path d="M40 68 C40 62 48 60 56 60 C64 60 72 62 72 68 L70 104 L42 104 Z" fill="url(#hero-armor)" />
        <rect x="42" y="108" width="28" height="7" rx="3" fill="#1E2440" />
        <circle cx="56" cy="111.5" r="2.5" fill="#FBBF24" />
        <text x="56" y="88" textAnchor="middle" fontSize="13" fontWeight="900" fill="#F4F2FB" fontFamily="system-ui, sans-serif" letterSpacing="0.5">{initials}</text>
        {/* shoulder pads */}
        <ellipse cx="35" cy="66" rx="9" ry="7" fill="#7C6CFF" />
        <ellipse cx="77" cy="66" rx="9" ry="7" fill="#7C6CFF" />
        {/* back arm */}
        <path d="M33 70 C28 82 30 92 34 98" stroke="#2A3358" strokeWidth="9" strokeLinecap="round" fill="none" />
        {/* helmet */}
        <path d="M38 40 C38 22 74 22 74 40 L74 50 C74 56 68 58 56 58 C44 58 38 56 38 50 Z" fill="#1E2440" />
        <path d="M56 18 L60 28 L52 28 Z" fill="#7C6CFF" />
        <path d="M44 26 C50 22 62 22 68 26" stroke="#7C6CFF" strokeWidth="3" fill="none" strokeLinecap="round" />
        <rect className="hero-visor" x="42" y="38" width="30" height="7" rx="3.5" fill="#67E8F9" />
        {/* sword arm + energy blade pointing at the boss */}
        <path d="M76 70 C86 76 92 80 96 84" stroke="#2A3358" strokeWidth="9" strokeLinecap="round" fill="none" />
        <circle cx="97" cy="85" r="5" fill="#7C6CFF" />
        <line x1="90" y1="78" x2="104" y2="92" stroke="#FBBF24" strokeWidth="4" strokeLinecap="round" />
        <line className="hero-blade-glow" x1="97" y1="85" x2="124" y2="44" stroke="#7C6CFF" strokeWidth="13" strokeLinecap="round" opacity=".45" />
        <line x1="97" y1="85" x2="124" y2="44" stroke="url(#hero-blade)" strokeWidth="5.5" strokeLinecap="round" />
      </g>
    </svg>
  );
}
