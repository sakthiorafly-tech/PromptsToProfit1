import {
  Rocket, Medal, Trophy, Coffee, Database, Flame, FileCode2, Atom, Brain, Zap, Lock, CheckCircle2, Info, AlertTriangle, Crown, Swords, RotateCcw,
} from 'lucide-react';
import { getCategory } from '../data/missions';
import { useGame } from '../context/GameContext';

const ICONS = { Rocket, Medal, Trophy, Coffee, Database, Flame, FileCode2, Atom, Brain, Crown, Swords, RotateCcw };
export const Icon = ({ name, ...props }) => {
  const C = ICONS[name] || Zap;
  return <C {...props} />;
};

export function Logo({ compact = false }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="grid h-9 w-9 place-items-center rounded-xl bg-brand-500 shadow-glow">
        <Zap className="h-5 w-5 fill-white text-white" />
      </div>
      {!compact && (
        <div className="leading-tight">
          <div className="text-[15px] font-bold tracking-tight text-white">SkillArena</div>
          <div className="text-[10.5px] font-medium text-ink-400">Play. Prove. Get Hired.</div>
        </div>
      )}
    </div>
  );
}

export function Avatar({ name, color = '#7C6CFF', size = 40, ring = false }) {
  const initials = name.split(' ').map((p) => p[0]).slice(0, 2).join('');
  return (
    <div
      className={`grid shrink-0 place-items-center rounded-full font-semibold text-white ${ring ? 'ring-2 ring-brand-400 ring-offset-2 ring-offset-ink-900' : ''}`}
      style={{ width: size, height: size, fontSize: size * 0.36, background: `linear-gradient(135deg, ${color}, ${color}99)` }}
      aria-hidden="true"
    >
      {initials}
    </div>
  );
}

export function ProgressBar({ value, color = '#7C6CFF', height = 8, className = '' }) {
  return (
    <div className={`w-full overflow-hidden rounded-full bg-white/[0.06] ${className}`} style={{ height }}>
      <div
        className="h-full rounded-full transition-[width] duration-700 ease-out"
        style={{ width: `${Math.max(0, Math.min(100, value))}%`, background: color }}
      />
    </div>
  );
}

export function ProgressRing({ value, size = 120, stroke = 10, color = '#7C6CFF', children }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} stroke="rgba(255,255,255,0.06)" strokeWidth={stroke} fill="none" />
        <circle
          cx={size / 2} cy={size / 2} r={r} stroke={color} strokeWidth={stroke} fill="none" strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={c - (c * Math.min(100, value)) / 100}
          style={{ transition: 'stroke-dashoffset 900ms cubic-bezier(.2,.7,.2,1)' }}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">{children}</div>
    </div>
  );
}

const DIFF = {
  Easy: 'text-ok-400 bg-ok-500/10 border-ok-500/20',
  Medium: 'text-xp-400 bg-xp-500/10 border-xp-500/20',
  Hard: 'text-bad-400 bg-bad-500/10 border-bad-500/20',
};
export const DifficultyPill = ({ level }) => (
  <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold ${DIFF[level]}`}>{level}</span>
);

export function CategoryTag({ id, size = 'sm' }) {
  const c = getCategory(id);
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-medium" style={{ color: c.color }}>
      <span className={`grid place-items-center rounded-md ${size === 'lg' ? 'h-8 w-8' : 'h-6 w-6'}`} style={{ background: `${c.color}1f` }}>
        <Icon name={c.icon} className={size === 'lg' ? 'h-4 w-4' : 'h-3.5 w-3.5'} />
      </span>
      {c.name}
    </span>
  );
}

export function BadgeTile({ badge, earnedAt, compact = false }) {
  const earned = Boolean(earnedAt);
  return (
    <div className={`group relative flex flex-col items-center rounded-2xl border p-3 text-center transition ${earned ? 'border-white/10 bg-white/[0.03]' : 'border-dashed border-white/[0.07] opacity-60'}`}>
      <div
        className={`relative grid place-items-center rounded-2xl ${compact ? 'h-11 w-11' : 'h-14 w-14'} ${earned ? '' : 'grayscale'}`}
        style={{ background: earned ? `${badge.color}22` : 'rgba(255,255,255,0.04)', boxShadow: earned ? `0 0 0 1px ${badge.color}55, 0 8px 24px -10px ${badge.color}` : 'none' }}
      >
        {earned ? <Icon name={badge.icon} className={compact ? 'h-5 w-5' : 'h-6 w-6'} style={{ color: badge.color }} /> : <Lock className="h-5 w-5 text-ink-500" />}
      </div>
      <div className={`mt-2 font-semibold leading-tight ${compact ? 'text-[11px]' : 'text-xs'} ${earned ? 'text-ink-100' : 'text-ink-400'}`}>{badge.name}</div>
      {!compact && (
        <div className="mt-1 text-[11px] leading-snug text-ink-500">
          {earned ? `Earned ${new Date(earnedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}` : badge.description}
        </div>
      )}
    </div>
  );
}

export function SectionTitle({ title, subtitle, action }) {
  return (
    <div className="mb-4 flex items-end justify-between gap-4">
      <div>
        <h2 className="text-base font-semibold text-white">{title}</h2>
        {subtitle && <p className="mt-0.5 text-sm text-ink-400">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function SimulatedNote({ children = 'All students, scores and rankings shown are simulated demo data.' }) {
  return (
    <p className="flex items-center gap-1.5 text-[11px] text-ink-500">
      <Info className="h-3.5 w-3.5 shrink-0" /> {children}
    </p>
  );
}

export function Toast() {
  const { toast } = useGame();
  if (!toast) return null;
  const Ico = toast.tone === 'success' ? CheckCircle2 : toast.tone === 'warn' ? AlertTriangle : Info;
  const color = toast.tone === 'success' ? 'text-ok-400' : toast.tone === 'warn' ? 'text-xp-400' : 'text-brand-300';
  return (
    <div key={toast.id} className="fixed bottom-24 left-1/2 z-[60] w-max max-w-[calc(100vw-2rem)] -translate-x-1/2 animate-fade-up lg:bottom-6" role="status">
      <div className="flex items-center gap-2.5 rounded-xl border border-white/10 bg-ink-800/95 px-4 py-3 text-sm text-ink-100 shadow-2xl backdrop-blur">
        <Ico className={`h-4 w-4 ${color}`} /> {toast.message}
      </div>
    </div>
  );
}

export function TitleChip({ title, size = 'sm' }) {
  return (
    <span
      className={`inline-flex items-center gap-1 whitespace-nowrap rounded-full border font-semibold ${size === 'xs' ? 'px-1.5 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs'}`}
      style={{ color: title.color, borderColor: `${title.color}55`, background: `${title.color}14` }}
      title={title.earn}
    >
      <Icon name={title.icon} className={size === 'xs' ? 'h-3 w-3' : 'h-3.5 w-3.5'} /> {title.name}
    </span>
  );
}
